import React, { useState } from 'react';
import { MAP_IMAGE_URL } from '../constants';

interface ImageViewerProps {
  onNavigate?: (mapId: string) => void;
}

interface MapNode {
  id: string;
  x: number; // percentage
  y: number; // percentage
  w: number; // percentage
  h: number; // percentage
  tooltip: {
    sacredForce: string;
    title: string;
    mobName: string;
    mobLevel: string;
  };
}

// Expanded list of detected nodes with updated data structure
const INITIAL_NODES: MapNode[] = [
  {
    "id": "new-node-1",
    "x": 8.06,
    "y": 81.24,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x630",
      "title": "Silent Ashlands 1",
      "mobName": "Ash-Devouring Soul",
      "mobLevel": "290"
    }
  },
  {
    "id": "new-node-2",
    "x": 16.75,
    "y": 87.98,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x630",
      "title": "Silent Ashlands 2",
      "mobName": "Ash-Devouring Soul",
      "mobLevel": "290"
    }
  },
  {
    "id": "new-node-3",
    "x": 27.61,
    "y": 83,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x630",
      "title": "Silent Ashlands 3",
      "mobName": "Ash-Devouring Soul / Silence-Swallowing Soul",
      "mobLevel": "290 / 291"
    }
  },
  {
    "id": "new-node-4",
    "x": 19.57,
    "y": 72,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x630",
      "title": "Silent Ashlands 4",
      "mobName": "Silence-Swallowing Soul",
      "mobLevel": "291"
    }
  },
  {
    "id": "new-node-5",
    "x": 35.1,
    "y": 35.05,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x660",
      "title": "Fate-Fields of Providence 1",
      "mobName": "Soul Slayer",
      "mobLevel": "291"
    }
  },
  {
    "id": "new-node-6",
    "x": 26.63,
    "y": 28.31,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x660",
      "title": "Fate-Fields of Providence 2",
      "mobName": "Soul Slayer",
      "mobLevel": "291"
    }
  },
  {
    "id": "new-node-7",
    "x": 20.55,
    "y": 17.75,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x660",
      "title": "Fate-Fields of Providence 3",
      "mobName": "Soul Slayer",
      "mobLevel": "291"
    }
  },
  {
    "id": "new-node-8",
    "x": 43.57,
    "y": 24.05,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x660",
      "title": "Fate-Fields of Judgment 1",
      "mobName": "Judge of Storms",
      "mobLevel": "292"
    }
  },
  {
    "id": "new-node-9",
    "x": 48.56,
    "y": 14.08,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x660",
      "title": "Fate-Fields of Judgment 2",
      "mobName": "Judge of Storms",
      "mobLevel": "292"
    }
  },
  {
    "id": "new-node-10",
    "x": 40.53,
    "y": 7.78,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x660",
      "title": "Fate-Fields of Judgment 3",
      "mobName": "Judge of Storms",
      "mobLevel": "292"
    }
  },
  {
    "id": "new-node-11",
    "x": 61.3,
    "y": 35.44,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x660",
      "title": "Fate-Fields of Eternity 1",
      "mobName": "Executor of Eternity",
      "mobLevel": "293"
    }
  },
  {
    "id": "new-node-12",
    "x": 67.69,
    "y": 26.08,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x660",
      "title": "Fate-Fields of Eternity 2",
      "mobName": "Executor of Eternity",
      "mobLevel": "293"
    }
  },
  {
    "id": "new-node-13",
    "x": 79.38,
    "y": 25.72,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x660",
      "title": "Fate-Fields of Eternity 3",
      "mobName": "Executor of Eternity",
      "mobLevel": "293"
    }
  },
  {
    "id": "new-node-14",
    "x": 61.03,
    "y": 69.2,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x700",
      "title": "Night Road 1",
      "mobName": "Night Guide",
      "mobLevel": "294"
    }
  },
  {
    "id": "new-node-15",
    "x": 65.58,
    "y": 61.68,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x700",
      "title": "Night Road 2",
      "mobName": "Night Guide",
      "mobLevel": "294"
    }
  },
  {
    "id": "new-node-16",
    "x": 74.21,
    "y": 63.79,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x700",
      "title": "Night Road 3",
      "mobName": "Night Guide",
      "mobLevel": "294"
    }
  },
  {
    "id": "new-node-17",
    "x": 82.57,
    "y": 65.99,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x700",
      "title": "Night Road 4",
      "mobName": "Night Guide",
      "mobLevel": "294"
    }
  },
  {
    "id": "new-node-18",
    "x": 63.68,
    "y": 79.39,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x700",
      "title": "Phantasmal Road 1",
      "mobName": "Phantasmal Guide",
      "mobLevel": "294"
    }
  },
  {
    "id": "new-node-19",
    "x": 72.11,
    "y": 81.5,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x700",
      "title": "Phantasmal Road 2",
      "mobName": "Phantasmal Guide",
      "mobLevel": "294"
    }
  },
  {
    "id": "new-node-20",
    "x": 81.41,
    "y": 83.88,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x700",
      "title": "Phantasmal Road 3",
      "mobName": "Phantasmal Guide",
      "mobLevel": "294"
    }
  },
  {
    "id": "new-node-21",
    "x": 86.03,
    "y": 75.62,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x700",
      "title": "Phantasmal Road 4",
      "mobName": "Phantasmal Guide",
      "mobLevel": "294"
    }
  },
  {
    "id": "new-node-22",
    "x": 18.92,
    "y": 59.1,
    "w": 4.5,
    "h": 6,
    "tooltip": {
      "sacredForce": "x630",
      "title": "Silent Ashlands 5",
      "mobName": "Silence-Swallowing Soul",
      "mobLevel": "291"
    }
  }
];

export const ImageViewer: React.FC<ImageViewerProps> = ({ onNavigate }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Editor Mode State
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [recordedNodes, setRecordedNodes] = useState<MapNode[]>([]);
  
  // Combine existing nodes with newly recorded ones for display
  const allNodes = [...INITIAL_NODES, ...recordedNodes];

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setAspectRatio(naturalWidth / naturalHeight);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If clicking a specific node, let that handler take precedence unless we are just recording raw clicks
    if (!isEditorMode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Center the box on the click by subtracting half the default width/height
    const defaultW = 4.5;
    const defaultH = 6;
    const centeredX = x - (defaultW / 2);
    const centeredY = y - (defaultH / 2);

    const newNode: MapNode = {
      id: `new-node-${allNodes.length + 1}`,
      x: parseFloat(centeredX.toFixed(2)),
      y: parseFloat(centeredY.toFixed(2)),
      w: defaultW,
      h: defaultH,
      tooltip: {
        sacredForce: 'x000',
        title: `New Node ${allNodes.length + 1}`,
        mobName: 'Mob Name',
        mobLevel: '000',
      },
    };

    setRecordedNodes([...recordedNodes, newNode]);
  };

  const copyConfig = () => {
    // We copy ALL nodes currently visible (initial + new session) to make it easy to update the file
    const configString = JSON.stringify([...INITIAL_NODES, ...recordedNodes], null, 2);
    navigator.clipboard.writeText(configString);
    alert('Configuration copied to clipboard!');
  };

  // Helper to split mob names/levels for display
  const renderMobInfo = (mobNames: string, mobLevels: string) => {
    const names = mobNames.split(' / ');
    const levels = mobLevels.split(' / ');
    
    return names.map((name, index) => {
      const level = levels[index] || levels[0] || '???';
      return (
        <div key={index} className="flex items-center justify-center pl-1">
           <span className="text-[#ff3366] font-medium text-[15px] tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] whitespace-nowrap">
              {name}(Lv.{level})
           </span>
        </div>
      );
    });
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 bg-black">
      {/* Editor Toggle */}
      <button
        onClick={() => setIsEditorMode(!isEditorMode)}
        className={`absolute top-4 right-4 z-50 px-4 py-2 rounded font-bold text-sm transition-colors ${
          isEditorMode ? 'bg-green-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
        }`}
      >
        {isEditorMode ? 'Exit Editor' : 'Editor Mode'}
      </button>

      {/* Editor Panel */}
      {isEditorMode && (
        <div className="absolute top-16 right-4 z-40 w-80 bg-neutral-900/95 border border-neutral-700 p-4 rounded shadow-xl max-h-[80vh] flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-bold">All Nodes ({allNodes.length})</h3>
            <button onClick={copyConfig} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded">
              Copy JSON
            </button>
          </div>
          <p className="text-xs text-neutral-400 mb-4">Click on the map to add points. The code below updates automatically.</p>
          <div className="flex-1 overflow-auto bg-black p-2 rounded border border-neutral-800">
            <pre className="text-[10px] text-green-400 font-mono whitespace-pre-wrap break-all">
              {JSON.stringify([...INITIAL_NODES, ...recordedNodes], null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 z-10">
          <svg
            className="animate-spin h-10 w-10 mb-4 text-neutral-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium tracking-wider uppercase opacity-80">Loading Map Resource...</span>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="text-red-400 text-center">
          <p>Failed to load the map image.</p>
        </div>
      )}

      {/* Image Container & Overlays */}
      {!hasError && (
        <div
          className={`
            relative
            transition-opacity duration-1000 ease-out
            ${isLoading ? 'opacity-0' : 'opacity-100'}
            ${isEditorMode ? 'cursor-crosshair' : ''}
          `}
          onClick={handleMapClick}
          style={{
            aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
            height: aspectRatio ? 'auto' : '100%',
            width: aspectRatio ? 'auto' : '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            display: aspectRatio ? 'block' : isLoading ? 'none' : 'block',
          }}
        >
          <img
            src={MAP_IMAGE_URL}
            alt="Tallhart Map"
            className="w-full h-full object-contain block select-none"
            draggable={false}
            onLoad={handleLoad}
            onError={handleError}
          />

          {/* Interactive Elements */}
          {aspectRatio &&
            allNodes.map((node) => (
              <React.Fragment key={node.id}>
                {/* Clickable Hotspot */}
                <div
                  className={`absolute z-20 transition-all duration-200 
                    border-2 
                    ${isEditorMode 
                      ? 'border-green-500 bg-green-500/20' 
                      : 'border-transparent bg-transparent hover:border-red-500 hover:bg-red-500/10'
                    }
                    ${!isEditorMode ? 'cursor-pointer hover:shadow-[0_0_15px_rgba(239,68,68,0.8)] hover:scale-105' : ''}
                  `}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    width: `${node.w}%`,
                    height: `${node.h}%`,
                  }}
                  onMouseEnter={() => !isEditorMode && setHoveredNodeId(node.id)}
                  onMouseLeave={() => !isEditorMode && setHoveredNodeId(null)}
                  onClick={(e) => {
                    if (!isEditorMode) {
                      e.stopPropagation();
                      onNavigate?.(node.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${node.tooltip.title} Info`}
                >
                  {/* Inner highlight ring on hover (only in normal mode) */}
                  {!isEditorMode && (
                    <div
                      className={`w-full h-full transition-opacity duration-200 ${
                        hoveredNodeId === node.id ? 'opacity-100' : 'opacity-0'
                      } border border-white/30`}
                    ></div>
                  )}
                  
                  {/* Editor ID Label */}
                  {isEditorMode && (
                     <div className="absolute -top-6 left-0 text-[10px] bg-black/80 text-white px-1 rounded whitespace-nowrap">
                       {node.id}
                     </div>
                  )}
                </div>

                {/* Info Tooltip (Only show in normal mode) */}
                {!isEditorMode && hoveredNodeId === node.id && (
                  <div
                    className="absolute z-30 bg-[#2b3038]/95 border border-[#505560] rounded px-4 py-3 shadow-xl backdrop-blur-sm pointer-events-none min-w-[250px] transform -translate-x-1/2 animate-in fade-in zoom-in-95 duration-150"
                    style={{
                      left: `${node.x + (node.w / 2)}%`, // Center horizontally relative to node center
                      bottom: `${100 - node.y + 2}%`,    // Position above the node
                    }}
                  >
                    {/* Header Section: Sacred Force & Title */}
                    <div className="flex flex-col items-center pb-1">
                      <div className="flex items-center gap-2 mb-1">
                        {/* Sacred Force Gem Icon */}
                        <svg width="18" height="18" viewBox="0 0 100 100" className="drop-shadow-md">
                           <defs>
                             <linearGradient id="gemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                               <stop offset="0%" stopColor="#60a5fa" />
                               <stop offset="100%" stopColor="#a78bfa" />
                             </linearGradient>
                           </defs>
                           <path d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z" fill="url(#gemGradient)" stroke="#c4b5fd" strokeWidth="4"/>
                        </svg>
                        <span className="text-[#d8b4fe] font-bold text-[15px] tracking-wide shadow-black drop-shadow-sm">
                          {node.tooltip.sacredForce}
                        </span>
                      </div>

                      {/* Map Title */}
                      <div className="text-white text-[15px] font-normal drop-shadow-md whitespace-nowrap">
                        Tallahart : {node.tooltip.title}
                      </div>
                    </div>

                    {/* Horizontal Divider */}
                    <div className="w-full h-px bg-[#606570] my-1.5"></div>

                    {/* Mob List Section */}
                    <div className="flex flex-col gap-1">
                      {renderMobInfo(node.tooltip.mobName, node.tooltip.mobLevel)}
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
        </div>
      )}

      {/* Hidden image loader */}
      {!aspectRatio && !hasError && (
        <img
          src={MAP_IMAGE_URL}
          className="absolute opacity-0 pointer-events-none"
          onLoad={handleLoad}
          alt=""
        />
      )}
    </div>
  );
}