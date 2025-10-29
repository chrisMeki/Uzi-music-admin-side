import { useState, useEffect } from 'react';
import { Plus, Music, Trash2, Edit2, X } from 'lucide-react';
import Sidebar from '../components/sidebar';
import trackService from '../services/track_service';
import albumService from '../services/addalbum_service';
import TrackModal from '../components/trackmodal';
import { createClient } from '@supabase/supabase-js';
import defaultCover from '../assets/default.jpeg';

// Initialize Supabase client
const supabase = createClient(
  'https://rntctuwbqtlklrwebxlg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudGN0dXdicXRsa2xyd2VieGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDQ2MzEsImV4cCI6MjA3Njg4MDYzMX0.e3Ir6Ro051jO0rtveFTk01XL1AsMWFqIQyxPOZGzodY'
);

interface Track {
  id: number;
  _id?: string;
  title: string;
  album: string;
  albumId?: string;
  durationMs: number;
  trackNumber: number;
  featuredArtists: string;
  trackArt: string;
  trackDescription: string;
  specialCredits: string;
  backingVocals: string;
  instrumentation: string;
  releaseDate: string;
  producer: string;
  masteringEngineer: string;
  mixingEngineer: string;
  writer: string;
  isPublished: boolean;
}

interface Album {
  _id: string;
  title: string;
}

export default function AddTracksScreen() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTracks();
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      const response = await albumService.getAllAlbums();
      let albumsData: Album[] = [];
      
      if (Array.isArray(response)) {
        albumsData = response;
      } else if (response && Array.isArray(response.data)) {
        albumsData = response.data;
      } else if (response && response.data && Array.isArray(response.data.albums)) {
        albumsData = response.data.albums;
      } else if (response && response.albums) {
        albumsData = response.albums;
      }
      
      setAlbums(albumsData || []);
    } catch (err) {
      console.error('Error loading albums:', err);
      setError('Failed to load albums');
    }
  };

  const loadTracks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await trackService.getAll();
      
      let tracksData: Track[] = [];
      
      if (Array.isArray(response)) {
        tracksData = response;
      } else if (response && Array.isArray(response.data)) {
        tracksData = response.data;
      } else if (response && response.data && Array.isArray(response.data.tracks)) {
        tracksData = response.data.tracks;
      } else if (response && response.tracks) {
        tracksData = response.tracks;
      }
      
      const normalizedTracks = tracksData.map((track: any) => ({
        id: track.id || track._id || Date.now() + Math.random(),
        _id: track._id || track.id,
        title: track.title || '',
        album: track.album || '',
        albumId: track.albumId || '',
        durationMs: track.durationMs || 0,
        trackNumber: track.trackNumber || 1,
        featuredArtists: track.featuredArtists || '',
        trackArt: track.trackArt || '',
        trackDescription: track.trackDescription || '',
        specialCredits: track.specialCredits || '',
        backingVocals: track.backingVocals || '',
        instrumentation: track.instrumentation || '',
        releaseDate: track.releaseDate || '',
        producer: track.producer || '',
        masteringEngineer: track.masteringEngineer || '',
        mixingEngineer: track.mixingEngineer || '',
        writer: track.writer || '',
        isPublished: track.isPublished || false
      }));
      
      setTracks(normalizedTracks);
    } catch (err: any) {
      setError('Failed to load tracks: ' + (err.message || 'Unknown error'));
      console.error('Error loading tracks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (trackId: string) => {
    setImageErrors(prev => new Set(prev).add(trackId));
  };

  const openModal = () => {
    setEditingTrack(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTrack(null);
  };

  const editTrack = (track: Track) => {
    setEditingTrack(track);
    setIsModalOpen(true);
  };

  const deleteTrack = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this track?')) {
      return;
    }

    try {
      setLoading(true);
      const trackToDelete = tracks.find(track => track.id === id);
      if (!trackToDelete) {
        setError('Track not found');
        return;
      }

      const trackId = trackToDelete._id || id.toString();
      await trackService.remove(trackId);
      setTracks(tracks.filter(track => track.id !== id));
    } catch (err: any) {
      setError(`Failed to delete track: ${err.response?.data?.message || err.message || 'Unknown error'}`);
      console.error('Error deleting track:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSaved = (savedTrack: Track, isEditing: boolean) => {
    if (isEditing) {
      setTracks(tracks.map(t => 
        (t._id === savedTrack._id || t.id === savedTrack.id) 
          ? { ...t, ...savedTrack } 
          : t
      ));
    } else {
      setTracks(prev => [...prev, savedTrack]);
    }
    closeModal();
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTrackArt = (trackId: string, trackArt?: string): string => {
    if (!trackArt || trackArt.trim() === '' || imageErrors.has(trackId)) {
      return defaultCover;
    }
    return trackArt;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 flex">
      <div className="fixed left-0 top-0 h-full z-40">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      </div>

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-100' : 'lg:ml-60'}`}>
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="overflow-auto h-[calc(100vh-80px)] lg:h-screen">
          <div className="p-6 lg:p-8">
            <div className="w-full max-w-7xl mx-auto">
              <div className="bg-white border-b border-gray-200 shadow-sm rounded-2xl mb-6">
                <div className="px-6 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Music className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">Track Manager</h1>
                        <p className="text-sm text-gray-500">{tracks.length} tracks total</p>
                        <p className="text-sm text-gray-500">{albums.length} albums available</p>
                      </div>
                    </div>
                    <button
                      onClick={openModal}
                      disabled={loading}
                      className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-5 h-5" />
                      Add Track
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span>{error}</span>
                    <button 
                      onClick={() => setError(null)}
                      className="text-red-700 hover:text-red-900"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {loading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  <p className="text-gray-600 mt-2">Loading...</p>
                </div>
              )}

              {tracks.length === 0 && !loading ? (
                <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-100">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Music className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No tracks yet</h3>
                  <p className="text-gray-500 mb-6">Get started by adding your first track</p>
                  <button
                    onClick={openModal}
                    disabled={loading}
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 inline-flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                    Add Your First Track
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tracks.map((track) => (
                    <div
                      key={track.id} 
                      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-red-100 to-orange-100">
                        <img 
                          src={getTrackArt(track.id.toString(), track.trackArt)}
                          alt={track.title}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(track.id.toString())}
                        />
                        {track.isPublished && (
                          <div className="absolute top-3 right-3">
                            <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                              Published
                            </span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                            Track #{track.trackNumber}
                          </span>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{track.title}</h3>
                        {track.featuredArtists && (
                          <p className="text-sm text-gray-600 mb-2 truncate">feat. {track.featuredArtists}</p>
                        )}
                        
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm font-medium text-gray-700">{formatDuration(track.durationMs)}</span>
                          {track.producer && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-600 truncate">Prod. {track.producer}</span>
                            </>
                          )}
                        </div>

                        {track.trackDescription && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{track.trackDescription}</p>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => editTrack(track)}
                            disabled={loading}
                            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTrack(track.id)}
                            disabled={loading}
                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TrackModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onTrackSaved={handleTrackSaved}
        editingTrack={editingTrack}
        albums={albums}
        loading={loading}
        setLoading={setLoading}
        setError={setError}
        supabase={supabase}
      />
    </div>
  );
}