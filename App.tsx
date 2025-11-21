import React, { useState } from 'react';
import { ImageViewer } from './components/ImageViewer';
import { InfoView } from './components/InfoView';

const App: React.FC = () => {
  const [view, setView] = useState<'map' | 'info'>('map');
  const [selectedMapId, setSelectedMapId] = useState<string>('silent-ashlands-1');

  const handleNavigate = (mapId: string) => {
    setSelectedMapId(mapId);
    setView('info');
  };

  return (
    // Main container: full screen, black background, no scrolling allowed
    <main className="w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
      {view === 'map' ? (
        <ImageViewer onNavigate={handleNavigate} />
      ) : (
        <InfoView mapId={selectedMapId} onBack={() => setView('map')} />
      )}
    </main>
  );
};

export default App;