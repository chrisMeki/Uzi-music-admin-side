import { useState, useEffect } from 'react';
import { Plus, Music, Trash2, Edit2, X } from 'lucide-react';
import Sidebar from '../components/sidebar';
import trackService from '../services/track_service';
import albumService from '../services/addalbum_service';
import defaultCover from '../assets/default.jpeg';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  'https://rntctuwbqtlklrwebxlg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudGN0dXdicXRsa2xyd2VieGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDQ2MzEsImV4cCI6MjA3Njg4MDYzMX0.e3Ir6Ro051jO0rtveFTk01XL1AsMWFqIQyxPOZGzodY'
);

interface Track {
  id: number;
  _id?: string; // Added for MongoDB compatibility
  title: string;
  album: string;
  albumId?: string; // Added to track the album ID separately
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
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  const [title, setTitle] = useState('');
  const [album, setAlbum] = useState('');
  const [durationMs, setDurationMs] = useState('');
  const [trackNumber, setTrackNumber] = useState('');
  const [featuredArtists, setFeaturedArtists] = useState('');
  const [trackArt, setTrackArt] = useState('');
  const [trackArtFile, setTrackArtFile] = useState<File | null>(null);
  const [trackArtPreview, setTrackArtPreview] = useState('');
  const [trackDescription, setTrackDescription] = useState('');
  const [specialCredits, setSpecialCredits] = useState('');
  const [backingVocals, setBackingVocals] = useState('');
  const [instrumentation, setInstrumentation] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [producer, setProducer] = useState('');
  const [masteringEngineer, setMasteringEngineer] = useState('');
  const [mixingEngineer, setMixingEngineer] = useState('');
  const [writer, setWriter] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  // Load tracks and albums on component mount
  useEffect(() => {
    loadTracks();
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      setAlbumsLoading(true);
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
      
      console.log('Albums data:', albumsData);
      setAlbums(albumsData || []);
    } catch (err) {
      console.error('Error loading albums:', err);
      setError('Failed to load albums');
    } finally {
      setAlbumsLoading(false);
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
      
      console.log('Tracks data:', tracksData);
      
      // Normalize track data to ensure consistent structure
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

  // Upload image to Supabase
  const uploadImageToSupabase = async (file: File): Promise<string> => {
    try {
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `track-art/${fileName}`;

      // Upload file to Supabase storage
      const { error } = await supabase.storage
        .from('track')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('track')
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error('Could not get public URL');
      }

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image to Supabase:', error);
      throw error;
    }
  };

  // Fast image URL check - returns default immediately if no valid track art
  const getTrackArt = (trackId: string, trackArt?: string): string => {
    if (!trackArt || trackArt.trim() === '' || imageErrors.has(trackId)) {
      return defaultCover;
    }
    return trackArt;
  };

  const handleImageError = (trackId: string) => {
    setImageErrors(prev => new Set(prev).add(trackId));
  };

  const resetForm = () => {
    setTitle('');
    setAlbum('');
    setSelectedAlbumId('');
    setDurationMs('');
    setTrackNumber('');
    setFeaturedArtists('');
    setTrackArt('');
    setTrackArtFile(null);
    setTrackArtPreview('');
    setTrackDescription('');
    setSpecialCredits('');
    setBackingVocals('');
    setInstrumentation('');
    setReleaseDate('');
    setProducer('');
    setMasteringEngineer('');
    setMixingEngineer('');
    setWriter('');
    setIsPublished(false);
    setEditingTrack(null);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTrackArtFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setTrackArtPreview(result);
        // Don't set trackArt here as we'll upload to Supabase later
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setTrackArtFile(null);
    setTrackArtPreview('');
    setTrackArt('');
  };

  const handleAlbumChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedAlbumId(selectedId);
    
    // Find the selected album to get its name
    const selectedAlbum = albums.find(alb => alb._id === selectedId);
    if (selectedAlbum) {
      setAlbum(selectedAlbum.title);
    } else {
      setAlbum('');
    }
  };

  const addOrUpdateTrack = async () => {
    if (!title.trim() || !selectedAlbumId.trim()) {
      setError('Title and Album are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let trackArtUrl = trackArt;

      // Upload image to Supabase if a new file was selected
      if (trackArtFile) {
        try {
          trackArtUrl = await uploadImageToSupabase(trackArtFile);
          console.log('Image uploaded successfully:', trackArtUrl);
        } catch (uploadError: any) {
          setError(`Failed to upload image: ${uploadError.message}`);
          setLoading(false);
          return;
        }
      }

      const trackData = {
        title: title.trim(),
        album: album.trim(),
        albumId: selectedAlbumId,
        durationMs: parseInt(durationMs) || 0,
        trackNumber: parseInt(trackNumber) || 1,
        featuredArtists: featuredArtists.trim(),
        trackArt: trackArtUrl,
        trackDescription: trackDescription.trim(),
        specialCredits: specialCredits.trim(),
        backingVocals: backingVocals.trim(),
        instrumentation: instrumentation.trim(),
        releaseDate: releaseDate,
        producer: producer.trim(),
        masteringEngineer: masteringEngineer.trim(),
        mixingEngineer: mixingEngineer.trim(),
        writer: writer.trim(),
        isPublished: isPublished
      };

      let savedTrack: { id: any; _id: any; };

      if (editingTrack) {
        // Use _id for MongoDB if available, otherwise use id
        const trackId = editingTrack._id || editingTrack.id.toString();
        const response = await trackService.update(trackId, trackData);
        savedTrack = response.data || response;
        
        setTracks(tracks.map(t => 
          (t._id === editingTrack._id || t.id === editingTrack.id) 
            ? { ...t, ...savedTrack } 
            : t
        ));
      } else {
        // Add new track
        const response = await trackService.create(trackData);
        savedTrack = response.data || response;
        
        // Generate a temporary ID for the new track
        const newTrack: Track = {
          id: savedTrack.id || savedTrack._id || Date.now(),
          _id: savedTrack._id || savedTrack.id,
          title: trackData.title,
          album: trackData.album,
          albumId: trackData.albumId,
          durationMs: trackData.durationMs,
          trackNumber: trackData.trackNumber,
          featuredArtists: trackData.featuredArtists,
          trackArt: trackData.trackArt,
          trackDescription: trackData.trackDescription,
          specialCredits: trackData.specialCredits,
          backingVocals: trackData.backingVocals,
          instrumentation: trackData.instrumentation,
          releaseDate: trackData.releaseDate,
          producer: trackData.producer,
          masteringEngineer: trackData.masteringEngineer,
          mixingEngineer: trackData.mixingEngineer,
          writer: trackData.writer,
          isPublished: trackData.isPublished
        };
        
        setTracks(prev => [...prev, newTrack]);
      }
      
      closeModal();
    } catch (err: any) {
      console.error('Error saving track:', err);
      setError(
        editingTrack 
          ? `Failed to update track: ${err.response?.data?.message || err.message || 'Unknown error'}`
          : `Failed to create track: ${err.response?.data?.message || err.message || 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const editTrack = (track: Track) => {
    setEditingTrack(track);
    setTitle(track.title);
    setAlbum(track.album);
    
    // Find the album ID by matching the album name or use stored albumId
    let albumId = track.albumId;
    if (!albumId) {
      const matchedAlbum = albums.find(alb => alb.title === track.album);
      albumId = matchedAlbum?._id || '';
    }
    
    setSelectedAlbumId(albumId);
    setDurationMs(track.durationMs.toString());
    setTrackNumber(track.trackNumber.toString());
    setFeaturedArtists(track.featuredArtists);
    setTrackArt(track.trackArt);
    setTrackArtPreview(track.trackArt);
    setTrackDescription(track.trackDescription);
    setSpecialCredits(track.specialCredits);
    setBackingVocals(track.backingVocals);
    setInstrumentation(track.instrumentation);
    setReleaseDate(track.releaseDate);
    setProducer(track.producer);
    setMasteringEngineer(track.masteringEngineer);
    setMixingEngineer(track.mixingEngineer);
    setWriter(track.writer);
    setIsPublished(track.isPublished);
    setIsModalOpen(true);
  };

  const deleteTrack = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this track?')) {
      return;
    }

    try {
      setLoading(true);
      // Find the track to get its _id for MongoDB
      const trackToDelete = tracks.find(track => track.id === id);
      if (!trackToDelete) {
        setError('Track not found');
        return;
      }

      // Use _id for MongoDB if available, otherwise use id
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

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 flex">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-full z-40">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-100' : 'lg:ml-60'}`}>
        {/* Mobile Header */}
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

        {/* Scrollable Content Area */}
        <div className="overflow-auto h-[calc(100vh-80px)] lg:h-screen">
          <div className="p-6 lg:p-8">
            <div className="w-full max-w-7xl mx-auto">
              {/* Desktop Header */}
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

              {/* Error Message */}
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

              {/* Loading State */}
              {loading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  <p className="text-gray-600 mt-2">Loading...</p>
                </div>
              )}

              {/* Track List */}
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
                      {/* Track Art */}
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

                      {/* Track Info */}
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

                        {/* Action Buttons */}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingTrack ? 'Edit Track' : 'Add New Track'}
              </h2>
              <button
                onClick={closeModal}
                disabled={loading}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-400 transition-colors"
                      placeholder="Enter track title"
                      disabled={loading}
                    />
                  </div>

                  {/* Album */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Album *
                    </label>
                    <select
                      value={selectedAlbumId}
                      onChange={handleAlbumChange}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-400 transition-colors"
                      disabled={loading || albumsLoading}
                    >
                      <option value="">Select an album</option>
                      {albums.map((alb) => (
                        <option key={alb._id} value={alb._id}>
                          {alb.title}
                        </option>
                      ))}
                    </select>
                    {selectedAlbumId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Selected Album: {album}
                      </p>
                    )}
                    {albumsLoading && (
                      <p className="text-xs text-gray-500 mt-1">Loading albums...</p>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (ms)
                    </label>
                    <input
                      type="number"
                      value={durationMs}
                      onChange={(e) => setDurationMs(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-400 transition-colors"
                      placeholder="e.g., 240000"
                      disabled={loading}
                    />
                  </div>

                  {/* Track Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Track Number
                    </label>
                    <input
                      type="number"
                      value={trackNumber}
                      onChange={(e) => setTrackNumber(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-400 transition-colors"
                      placeholder="e.g., 1"
                      disabled={loading}
                    />
                  </div>

                  {/* Featured Artists */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Featured Artists
                    </label>
                    <input
                      type="text"
                      value={featuredArtists}
                      onChange={(e) => setFeaturedArtists(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-400 transition-colors"
                      placeholder="e.g., Enzo Ishall, Killer T"
                      disabled={loading}
                    />
                  </div>

                  {/* Producer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Producer
                    </label>
                    <input
                      type="text"
                      value={producer}
                      onChange={(e) => setProducer(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-400 transition-colors"
                      placeholder="e.g., Levels"
                      disabled={loading}
                    />
                  </div>

                  {/* Release Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Release Date
                    </label>
                    <input
                      type="date"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-400 transition-colors"
                      disabled={loading}
                    />
                  </div>

                  {/* Writer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Writer
                    </label>
                    <input
                      type="text"
                      value={writer}
                      onChange={(e) => setWriter(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-400 transition-colors"
                      placeholder="e.g., Winky D, Enzo Ishall"
                      disabled={loading}
                    />
                  </div>

                  {/* Mastering Engineer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mastering Engineer
                    </label>
                    <input
                      type="text"
                      value={masteringEngineer}
                      onChange={(e) => setMasteringEngineer(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-400 transition-colors"
                      placeholder="e.g., Sound Master"
                      disabled={loading}
                    />
                  </div>

                  {/* Mixing Engineer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mixing Engineer
                    </label>
                    <input
                      type="text"
                      value={mixingEngineer}
                      onChange={(e) => setMixingEngineer(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-400 transition-colors"
                      placeholder="e.g., Mix Pro"
                      disabled={loading}
                    />
                  </div>

                  {/* Backing Vocals */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Backing Vocals
                    </label>
                    <input
                      type="text"
                      value={backingVocals}
                      onChange={(e) => setBackingVocals(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-400 transition-colors"
                      placeholder="e.g., Sharon, Tafadzwa"
                      disabled={loading}
                    />
                  </div>

                  {/* Track Art */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Track Art
                    </label>
                    <div className="flex gap-4">
                      {trackArtPreview ? (
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
                          <img 
                            src={trackArtPreview} 
                            alt="Track art preview" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={removeImage}
                            disabled={loading}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex-1 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-400 transition-colors flex flex-col items-center justify-center gap-2 bg-gray-50">
                          <Music className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-600 font-medium">Upload track art</span>
                          <span className="text-xs text-gray-500">Click to browse</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={loading}
                          />
                        </label>
                      )}
                    </div>
                    {trackArtFile && (
                      <p className="text-xs text-gray-500 mt-1">
                        Image will be uploaded to Supabase storage
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Track Description
                    </label>
                    <textarea
                      value={trackDescription}
                      onChange={(e) => setTrackDescription(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-400 transition-colors"
                      placeholder="Describe the track..."
                      rows={3}
                      disabled={loading}
                    />
                  </div>

                  {/* Instrumentation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instrumentation
                    </label>
                    <textarea
                      value={instrumentation}
                      onChange={(e) => setInstrumentation(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-400 transition-colors"
                      placeholder="e.g., Guitar: Mike, Drums: Tinashe"
                      rows={3}
                      disabled={loading}
                    />
                  </div>

                  {/* Special Credits */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Credits
                    </label>
                    <textarea
                      value={specialCredits}
                      onChange={(e) => setSpecialCredits(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-400 transition-colors"
                      placeholder="Special thanks and credits..."
                      rows={2}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Published Checkbox */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-5 h-5 text-red-600 border-2 border-gray-300 rounded focus:ring-red-500"
                    disabled={loading}
                  />
                  <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                    Mark as Published
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
              <button
                onClick={closeModal}
                disabled={loading}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={addOrUpdateTrack}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (editingTrack ? 'Update Track' : 'Add Track')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}