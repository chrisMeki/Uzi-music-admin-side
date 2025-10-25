import { useState } from 'react';
import { Plus, Music, Trash2 } from 'lucide-react';
import Sidebar from '../components/sidebar'; // Adjust the import path as needed

interface Track {
  id: number;
  name: string;
  artist: string;
  duration: string;
}

export default function AddTracksScreen() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [trackName, setTrackName] = useState('');
  const [artist, setArtist] = useState('');
  const [duration, setDuration] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const addTrack = () => {
    if (trackName.trim() && artist.trim()) {
      const newTrack: Track = {
        id: Date.now(),
        name: trackName,
        artist: artist,
        duration: duration || '0:00'
      };
      setTracks([...tracks, newTrack]);
      setTrackName('');
      setArtist('');
      setDuration('');
    }
  };

  const deleteTrack = (id: number) => {
    setTracks(tracks.filter(track => track.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTrack();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-red-100 flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[calc(100vh-80px)] lg:min-h-screen">
          <div className="w-full max-w-4xl">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 mb-6 border border-red-100">
              <div className="flex items-center gap-3 mb-6">
                <Music className="w-8 h-8 text-red-600" />
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Add Tracks</h1>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Track Name
                  </label>
                  <input
                    type="text"
                    value={trackName}
                    onChange={(e) => setTrackName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:border-red-400 transition-colors"
                    placeholder="Enter track name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Artist
                  </label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:border-red-400 transition-colors"
                    placeholder="Enter artist name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (optional)
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:border-red-400 transition-colors"
                    placeholder="e.g., 3:45"
                  />
                </div>

                <button
                  onClick={addTrack}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  Add Track
                </button>
              </div>
            </div>

            {tracks.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-red-100">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4">
                  Your Tracks ({tracks.length})
                </h2>
                <div className="space-y-3">
                  {tracks.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-white rounded-lg border border-red-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Music className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-800 truncate">{track.name}</h3>
                          <p className="text-sm text-gray-600 truncate">{track.artist}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                        <span className="text-sm text-gray-500 whitespace-nowrap">{track.duration}</span>
                        <button
                          onClick={() => deleteTrack(track.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}