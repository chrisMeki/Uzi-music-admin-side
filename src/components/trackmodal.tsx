import { useState, useEffect } from 'react';
import { X, Music, Trash2 } from 'lucide-react';
import trackService from '../services/track_service';

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

interface TrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackSaved: (track: Track, isEditing: boolean) => void;
  editingTrack: Track | null;
  albums: Album[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  supabase: any;
}

export default function TrackModal({
  isOpen,
  onClose,
  onTrackSaved,
  editingTrack,
  albums,
  loading,
  setLoading,
  setError,
  supabase
}: TrackModalProps) {
  const [title, setTitle] = useState('');
  const [album, setAlbum] = useState('');
  const [selectedAlbumId, setSelectedAlbumId] = useState('');
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

  useEffect(() => {
    if (editingTrack) {
      setTitle(editingTrack.title);
      setAlbum(editingTrack.album);
      
      let albumId = editingTrack.albumId;
      if (!albumId) {
        const matchedAlbum = albums.find(alb => alb.title === editingTrack.album);
        albumId = matchedAlbum?._id || '';
      }
      
      setSelectedAlbumId(albumId);
      setDurationMs(editingTrack.durationMs.toString());
      setTrackNumber(editingTrack.trackNumber.toString());
      setFeaturedArtists(editingTrack.featuredArtists);
      setTrackArt(editingTrack.trackArt);
      setTrackArtPreview(editingTrack.trackArt);
      setTrackDescription(editingTrack.trackDescription);
      setSpecialCredits(editingTrack.specialCredits);
      setBackingVocals(editingTrack.backingVocals);
      setInstrumentation(editingTrack.instrumentation);
      setReleaseDate(editingTrack.releaseDate);
      setProducer(editingTrack.producer);
      setMasteringEngineer(editingTrack.masteringEngineer);
      setMixingEngineer(editingTrack.mixingEngineer);
      setWriter(editingTrack.writer);
      setIsPublished(editingTrack.isPublished);
    } else {
      resetForm();
    }
  }, [editingTrack, albums]);

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
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `track-art/${fileName}`;

      const { error } = await supabase.storage
        .from('track')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTrackArtFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setTrackArtPreview(result);
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
    
    const selectedAlbum = albums.find(alb => alb._id === selectedId);
    if (selectedAlbum) {
      setAlbum(selectedAlbum.title);
    } else {
      setAlbum('');
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !selectedAlbumId.trim()) {
      setError('Title and Album are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let trackArtUrl = trackArt;

      if (trackArtFile) {
        try {
          trackArtUrl = await uploadImageToSupabase(trackArtFile);
        } catch (uploadError: any) {
          setError(`Failed to upload image: ${uploadError.message}`);
          setLoading(false);
          return;
        }
      }

      // FIXED: Send the album ID in the 'album' field, not as 'albumId'
      const trackData = {
        title: title.trim(),
        album: selectedAlbumId, // Send the ObjectId here, not the title
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
        // FIXED: Use the MongoDB _id for updates, not the numeric id
        const trackId = editingTrack._id;
        if (!trackId) {
          throw new Error('Cannot update track: No valid _id found');
        }
        
        const response = await trackService.update(trackId, trackData);
        savedTrack = response.data || response;
      } else {
        const response = await trackService.create(trackData);
        savedTrack = response.data || response;
      }

      // For the frontend display, we still want the album title
      const selectedAlbum = albums.find(alb => alb._id === selectedAlbumId);
      const albumTitle = selectedAlbum?.title || album;

      const newTrack: Track = {
        id: savedTrack.id || savedTrack._id || Date.now(),
        _id: savedTrack._id || savedTrack.id,
        ...trackData,
        album: albumTitle, // Use the title for frontend display
        albumId: selectedAlbumId // Store the ID separately for future edits
      };

      onTrackSaved(newTrack, !!editingTrack);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {editingTrack ? 'Edit Track' : 'Add New Track'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Album *
                </label>
                <select
                  value={selectedAlbumId}
                  onChange={handleAlbumChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-400 transition-colors"
                  disabled={loading}
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
              </div>

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

        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : (editingTrack ? 'Update Track' : 'Add Track')}
          </button>
        </div>
      </div>
    </div>
  );
}