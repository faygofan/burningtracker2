import React, { useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, STALE_DATA_THRESHOLD_MS, RATE_LIMIT_MS } from '../constants';

// Initialize Supabase Client safely
// If keys are missing (e.g. env vars not loaded), we set this to null to prevent crash
const supabase: SupabaseClient | null = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

interface InfoViewProps {
  mapId: string;
  onBack: () => void;
}

interface ChannelData {
  id: number;
  burning: number; // 0-100
  players: number; // 0-4
  lastUpdated: number; // Timestamp of last edit
}

const MAP_TITLES: Record<string, string> = {
  'new-node-1': 'Silent Ashlands 1',
  'new-node-2': 'Silent Ashlands 2',
  'new-node-3': 'Silent Ashlands 3',
  'new-node-4': 'Silent Ashlands 4',
  'new-node-5': 'Fate-Fields of Providence 1',
  'new-node-6': 'Fate-Fields of Providence 2',
  'new-node-7': 'Fate-Fields of Providence 3',
  'new-node-8': 'Fate-Fields of Judgment 1',
  'new-node-9': 'Fate-Fields of Judgment 2',
  'new-node-10': 'Fate-Fields of Judgment 3',
  'new-node-11': 'Fate-Fields of Eternity 1',
  'new-node-12': 'Fate-Fields of Eternity 2',
  'new-node-13': 'Fate-Fields of Eternity 3',
  'new-node-14': 'Night Road 1',
  'new-node-15': 'Night Road 2',
  'new-node-16': 'Night Road 3',
  'new-node-17': 'Night Road 4',
  'new-node-18': 'Phantasmal Road 1',
  'new-node-19': 'Phantasmal Road 2',
  'new-node-20': 'Phantasmal Road 3',
  'new-node-21': 'Phantasmal Road 4',
  'new-node-22': 'Silent Ashlands 5',
};

// Helper to format map ID to Title if not in record
const getMapTitle = (id: string) => {
  if (MAP_TITLES[id]) return MAP_TITLES[id];
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace('New Node', 'Node');
};

// Helper to interpolate color from Grey to Red based on percentage
const getBurningColor = (percentage: number) => {
  const p = Math.min(1, Math.max(0, percentage / 100));
  const start = [92, 95, 102];
  const end = [220, 38, 38];
  const r = Math.round(start[0] + (end[0] - start[0]) * p);
  const g = Math.round(start[1] + (end[1] - start[1]) * p);
  const b = Math.round(start[2] + (end[2] - start[2]) * p);
  return `rgb(${r}, ${g}, ${b})`;
};

// Generate default channels helper
const createDefaultChannels = (): ChannelData[] => 
  Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    burning: 0,
    players: 0,
    lastUpdated: Date.now(),
  }));

// Helper to calculate decayed burning
const calculateBurning = (burning: number, players: number, lastUpdated: number) => {
    if (players === 0) return burning; // No decay if 0 players

    const msElapsed = Date.now() - lastUpdated;
    const minutesElapsed = Math.floor(msElapsed / 1000 / 60);
    const decaySteps = Math.floor(minutesElapsed / 15);
    
    // Decrease by 10% per step, min 0
    return Math.max(0, burning - (decaySteps * 10));
};

export const InfoView: React.FC<InfoViewProps> = ({ mapId, onBack }) => {
  // Initialize state immediately with defaults so UI renders instantly
  const [channels, setChannels] = useState<ChannelData[]>(createDefaultChannels);
  const [selectedChannel, setSelectedChannel] = useState<ChannelData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Suggestion 3: Rate Limiting (Client-side simple check)
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);
  
  // Local state for form inputs
  const [editBurning, setEditBurning] = useState<string>('');
  const [editPlayers, setEditPlayers] = useState<number>(0);
  const [burningError, setBurningError] = useState<string | null>(null);

  // Force re-render every minute to update decay
  const [, setTick] = useState(0);

  // Derived map name for DB storage (e.g. "Phantasmal Road 2")
  const currentMapName = getMapTitle(mapId);

  // Initialize channels from Supabase
  useEffect(() => {
    if (!supabase) return;

    const fetchChannels = async () => {
      // Fetch data from Supabase using the readable map name
      const { data, error } = await supabase
        .from('channel_states')
        .select('*')
        .eq('map_id', currentMapName);

      if (error) {
        console.error('Error fetching channels:', error);
        return;
      }

      // Merge DB data into default channels
      if (data && data.length > 0) {
        const defaultCh = createDefaultChannels();
        const merged = defaultCh.map((def) => {
          const found = data.find((row: any) => row.channel_id === def.id);
          if (found) {
            return {
              id: found.channel_id,
              burning: found.burning,
              players: found.players,
              lastUpdated: new Date(found.last_updated).getTime(),
            };
          }
          return def;
        });
        setChannels(merged);
      }
    };

    fetchChannels();

    // 2. Subscribe to Realtime Changes
    console.log(`Subscribing to changes for map: ${currentMapName}`);
    const channel = supabase
      .channel(`map_tracker_${mapId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT and UPDATE
          schema: 'public',
          table: 'channel_states',
          filter: `map_id=eq.${currentMapName}`,
        },
        (payload) => {
          console.log("Realtime update received:", payload);
          const newRow = payload.new as any;
          
          setChannels((prev) => 
            prev.map((ch) => {
              if (ch.id === newRow.channel_id) {
                return {
                  id: newRow.channel_id,
                  burning: newRow.burning,
                  players: newRow.players,
                  lastUpdated: new Date(newRow.last_updated).getTime()
                };
              }
              return ch;
            })
          );
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for ${currentMapName}:`, status);
      });

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, [mapId, currentMapName]);

  // Timer for decay updates
  useEffect(() => {
    const interval = setInterval(() => {
        setTick(t => t + 1);
    }, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  // --- Safety Guard for Missing Config ---
  if (!supabase) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/90 p-4">
        <div className="bg-[#2f3136] p-6 rounded-lg border border-red-500/50 max-w-md text-center shadow-2xl">
          <h2 className="text-[#facc15] font-bold text-xl mb-4">Configuration Missing</h2>
          <p className="text-neutral-300 mb-4">
            The application cannot connect to the database because the API keys are missing.
          </p>
          <div className="bg-black/50 p-3 rounded text-left mb-4">
            <p className="text-xs text-neutral-400 font-mono">Error: supabaseUrl is required</p>
          </div>
          <p className="text-sm text-neutral-400 mb-6">
            Please ensure your <code className="bg-neutral-700 px-1 rounded text-white">.env</code> file is created in the project root and contains 
            <span className="text-white"> VITE_SUPABASE_URL</span> and <span className="text-white"> VITE_SUPABASE_ANON_KEY</span>.
          </p>
          <button 
            onClick={onBack}
            className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            Go Back to Map
          </button>
        </div>
      </div>
    );
  }

  const handleChannelClick = (channel: ChannelData) => {
    const decayedBurning = calculateBurning(channel.burning, channel.players, channel.lastUpdated);
    setSelectedChannel(channel);
    setEditBurning(decayedBurning.toString());
    setEditPlayers(channel.players);
    setBurningError(null);
    setIsModalOpen(true);
  };

  const saveChanges = async () => {
    if (!selectedChannel || burningError || !supabase) return;

    // Suggestion 3: Rate Limiting Check
    const now = Date.now();
    if (now - lastSubmitTime < RATE_LIMIT_MS) {
      alert("You are updating too fast. Please wait a moment.");
      return;
    }
    setLastSubmitTime(now);

    let finalBurning = editBurning === '' ? 0 : parseInt(editBurning);
    if (isNaN(finalBurning)) finalBurning = 0;

    // Optimistic Update (Update UI immediately)
    const updatedChannel = {
        id: selectedChannel.id,
        burning: finalBurning,
        players: editPlayers,
        lastUpdated: now
    };

    setChannels(prev => prev.map(ch => ch.id === updatedChannel.id ? updatedChannel : ch));
    closeModal();

    // Persist to Supabase using the readable map name
    const { error } = await supabase
        .from('channel_states')
        .upsert({
            map_id: currentMapName,
            channel_id: selectedChannel.id,
            burning: finalBurning,
            players: editPlayers,
            last_updated: new Date().toISOString()
        }, { onConflict: 'map_id,channel_id' });

    if (error) {
        console.error("Failed to update Supabase:", JSON.stringify(error, null, 2));
        // Revert optimistic update if needed, or show toast error
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedChannel(null);
    setBurningError(null);
  };

  const handleBurningChange = (valStr: string) => {
    setEditBurning(valStr);
    if (valStr === '') {
        setBurningError(null);
        return;
    }
    const val = parseInt(valStr);
    if (isNaN(val)) {
        setBurningError("Invalid number");
        return;
    }
    if (val < 0 || val > 100) {
        setBurningError("Must be between 0% and 100%");
    } else if (val % 10 !== 0) {
        setBurningError("Must be a multiple of 10");
    } else {
        setBurningError(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        saveChanges();
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-75">
      <div className="w-full max-w-5xl bg-[#2f3136] rounded-lg shadow-2xl border border-[#202225] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Title Bar */}
        <div className="bg-[#202225] px-4 py-3 flex justify-between items-center border-b border-[#18191c]">
          <div className="flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div>
             <h1 className="text-[#facc15] font-bold text-lg tracking-wide shadow-black drop-shadow-md">
               {currentMapName}
             </h1>
          </div>
          <button 
            onClick={onBack}
            className="text-neutral-500 hover:text-white transition-colors text-xl font-bold px-2"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-[#36393f] p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-transparent">
            
            {/* Suggestion 2: Mobile Responsiveness (grid-cols-2 on mobile, 5 on desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {channels.map((channel) => {
                    const isFull = channel.players >= 4;
                    const isSelected = selectedChannel?.id === channel.id;
                    // Suggestion 1: Stale Data Detection
                    const isStale = (Date.now() - channel.lastUpdated) > STALE_DATA_THRESHOLD_MS;
                    
                    // Calculate effective burning with decay
                    const effectiveBurning = calculateBurning(channel.burning, channel.players, channel.lastUpdated);

                    return (
                    <button
                        key={channel.id}
                        onClick={() => handleChannelClick(channel)}
                        className={`
                            relative flex flex-col justify-between p-2 h-20 rounded border
                            transition-all duration-150 active:scale-95 group
                            ${isSelected
                                ? 'bg-[#22b8cf] border-[#1098ad] ring-2 ring-[#22b8cf]/50 z-10'
                                : isFull
                                    ? 'bg-[#e9ecef]/50 border-neutral-300/50 cursor-default'
                                    : 'bg-[#f2f4f7] border-neutral-300 hover:bg-[#dde1e6] hover:border-neutral-400'
                            }
                        `}
                    >
                        {/* Top Left: Channel Number */}
                        <span className={`
                            self-start font-mono text-xs font-bold
                            ${isSelected ? 'text-white/90' : 'text-[#5c5f66]'}
                        `}>
                            CH. {channel.id}
                        </span>

                        {/* Top Right: Info Icon with Tooltip */}
                        <div 
                          className="absolute top-1 right-1 z-20 group/info"
                          onClick={(e) => e.stopPropagation()}
                        >
                            {/* Icon Changes color if stale */}
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 24 24" 
                                fill="currentColor" 
                                className={`w-4 h-4 transition-colors cursor-help 
                                    ${isSelected ? 'text-white/70 hover:text-white' : 
                                      isStale ? 'text-orange-400 hover:text-orange-600' : 'text-neutral-400 hover:text-neutral-600'}
                                `}
                            >
                                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-2.625a1.125 1.125 0 01.178 2.236.654.654 0 00-.384.614V13.5a.75.75 0 001.5 0v-1.125a2.154 2.154 0 011.154-2.006 2.625 2.625 0 10-5.05-1.644.75.75 0 001.499.26c.033-.318.305-.566.653-.566zM12 15.75a.75.75 0 100 1.5.75.75 0 000-1.5z" clipRule="evenodd" />
                            </svg>

                            {/* Tooltip */}
                            <div className="absolute bottom-full right-0 mb-1 hidden group-hover/info:block z-30">
                                <div className={`
                                    text-xs font-medium px-2 py-1 rounded shadow-[0_4px_8px_rgba(0,0,0,0.5)] border border-[#18191c] whitespace-nowrap
                                    ${isStale ? 'bg-orange-900 text-orange-100 border-orange-700' : 'bg-[#202225] text-[#dcddde]'}
                                `}>
                                    {isStale && <span className="mr-1">⚠️</span>}
                                    Updated {new Date(channel.lastUpdated).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
                                </div>
                                <div className={`w-2 h-2 absolute right-1 -bottom-1 rotate-45 border-r border-b border-[#18191c] ${isStale ? 'bg-orange-900 border-orange-700' : 'bg-[#202225]'}`}></div>
                            </div>
                        </div>
                        
                        {/* Center: Burning % (Hero) */}
                        <span 
                          className={`
                            absolute inset-0 flex items-center justify-center font-bold text-[18px]
                            ${isSelected ? 'text-white drop-shadow-sm' : ''}
                          `}
                          style={!isSelected ? { color: getBurningColor(effectiveBurning) } : undefined}
                        >
                            {effectiveBurning}%
                        </span>

                        {/* Bottom Right: Players */}
                        <span className={`
                            self-end text-[12px] font-medium
                            ${isSelected 
                                ? 'text-white/90'
                                : isFull 
                                    ? 'text-red-500'
                                    : 'text-[#868e96]'
                            }
                        `}>
                            {channel.players}/4
                        </span>
                    </button>
                )})}
            </div>
        </div>
      </div>

      {/* Edit Channel Modal */}
      {isModalOpen && selectedChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#2f3136] w-64 rounded-lg shadow-2xl border border-[#202225] overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-[#202225] px-3 py-2 border-b border-[#18191c] flex justify-between items-center">
                    <h2 className="text-neutral-300 font-bold text-sm">Edit Channel {selectedChannel.id}</h2>
                    <button onClick={closeModal} className="text-neutral-500 hover:text-white text-lg font-bold">✕</button>
                </div>
                <div className="p-4 space-y-4">
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-[#b9bbbe]">
                            <label>Burning %</label>
                        </div>
                        <div className="relative">
                            <input 
                                type="number" 
                                min="0" 
                                max="100" 
                                step="10"
                                value={editBurning}
                                onChange={(e) => handleBurningChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className={`w-full bg-[#202225] text-[#facc15] py-2 px-2 rounded border outline-none text-center font-bold text-lg placeholder-neutral-600 ${
                                    burningError ? 'border-red-500 focus:border-red-500' : 'border-[#202225] focus:border-yellow-600'
                                }`}
                            />
                            {burningError && (
                                <p className="text-red-500 text-[10px] mt-1 text-center font-medium">{burningError}</p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1">
                         <div className="flex justify-between text-xs font-medium text-[#b9bbbe]">
                            <label>Players (0-4)</label>
                        </div>
                        <input 
                            type="number" 
                            min="0" 
                            max="4" 
                            step="1"
                            value={editPlayers}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) {
                                    setEditPlayers(Math.min(4, Math.max(0, val)));
                                } else {
                                    setEditPlayers(0);
                                }
                            }}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-[#202225] text-white py-2 px-2 rounded border border-[#202225] focus:border-blue-500 outline-none text-center font-bold text-lg placeholder-neutral-600"
                        />
                    </div>
                </div>
                <div className="bg-[#292b2f] px-3 py-3 flex justify-center">
                    <button 
                        onClick={saveChanges}
                        disabled={!!burningError}
                        className={`w-full py-1.5 rounded text-sm font-medium transition-colors shadow-sm ${
                            burningError 
                            ? 'bg-neutral-600 text-neutral-400 cursor-not-allowed' 
                            : 'bg-[#5865f2] hover:bg-[#4752c4] text-white'
                        }`}
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};