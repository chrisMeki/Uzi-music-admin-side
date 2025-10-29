import { useState, type ChangeEvent, type FormEvent, useEffect } from 'react';
import { X, User, ImageIcon, Building, Award, Trash2, Plus, Music, Loader2, Upload, CheckCircle } from 'lucide-react';
import type { Album, FormData, Plaque } from '../types';
import { createClient } from '@supabase/supabase-js';
import artistService from '../services/addartist_service';
import genreService from '../services/genre_service';

const supabase = createClient(
  'https://rntctuwbqtlklrwebxlg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudGN0dXdicXRsa2xyd2VieGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDQ2MzEsImV4cCI6MjA3Njg4MDYzMX0.e3Ir6Ro051jO0rtveFTk01XL1AsMWFqIQyxPOZGzodY'
);

interface AlbumFormProps {
  editingAlbum: Album | null;
  onSubmit: (album: Album) => void;
  onClose: () => void;
}

interface Genre { _id: string; name: string; }
interface Artist { _id: string; name: string; }

const plaqueTypes = ['gold', 'silver', 'emerald', 'sapphire', 'crimson', 'wooden'];

// Helper function to capitalize plaque type for display
const capitalizePlaqueType = (type: string): string => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

export default function AlbumForm({ editingAlbum, onSubmit, onClose }: AlbumFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '', artist: '', artist_name: '', release_date: '', genre: '', genre_id: '', cover_art: '', description: '',
    track_count: 0, copyright_info: '', publisher: '', credits: '', affiliation: '', duration: 0,
    is_published: false, is_featured: false
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [plaqueArray, setPlaqueArray] = useState<Plaque[]>([]);
  const [currentPlaque, setCurrentPlaque] = useState<Plaque>({ plaque_type: '', plaque_image_url: '', plaque_price_range: "" });
  const [plaquePreviewImage, setPlaquePreviewImage] = useState<string | null>(null);
  const [] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loadingGenres, setLoadingGenres] = useState<boolean>(false);
  const [loadingArtists, setLoadingArtists] = useState<boolean>(false);
  const [durationInput, setDurationInput] = useState<string>('');
  const [durationUnit, setDurationUnit] = useState<'seconds' | 'minutes'>('seconds');
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  useEffect(() => {
    loadGenres();
    loadArtists();
  }, []);

  useEffect(() => {
    if (editingAlbum) {
      const artistId = typeof editingAlbum.artist === 'string' ? editingAlbum.artist : (editingAlbum.artist as any)._id || '';
      const artistName = typeof editingAlbum.artist === 'string' 
        ? artists.find(a => a._id === artistId)?.name || ''
        : (editingAlbum.artist as any).name || '';
      
      const genreId = editingAlbum.genre_id || '';
      const genreName = editingAlbum.genre || '';
      
      let durationValue = '';
      
      if (editingAlbum.duration) {
        if (editingAlbum.duration >= 60) {
          const minutes = Math.floor(editingAlbum.duration / 60);
          const seconds = editingAlbum.duration % 60;
          setDurationUnit('minutes');
          durationValue = seconds > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${minutes}`;
        } else {
          setDurationUnit('seconds');
          durationValue = editingAlbum.duration.toString();
        }
      }

      setFormData({
        title: editingAlbum.title || '', 
        artist: artistId, 
        artist_name: artistName,
        release_date: editingAlbum.release_date || '',
        genre: genreName, 
        genre_id: genreId, 
        cover_art: editingAlbum.cover_art || '',
        description: editingAlbum.description || '', 
        track_count: editingAlbum.track_count || 0,
        copyright_info: editingAlbum.copyright_info || '', 
        publisher: editingAlbum.publisher || '',
        credits: editingAlbum.credits || '', 
        affiliation: editingAlbum.affiliation || '',
        duration: editingAlbum.duration || 0, 
        is_published: editingAlbum.is_published || false,
        is_featured: editingAlbum.is_featured || false
      });
      
      setPreviewImage(editingAlbum.cover_art || null);
      setPlaqueArray(editingAlbum.plaqueArray || []);
      setDurationInput(durationValue);
    } else resetForm();
  }, [editingAlbum, artists]);

  const loadGenres = async () => {
    setLoadingGenres(true);
    try {
      const response = await genreService.getAllGenres();
      let genresData: Genre[] = [];
      if (response && Array.isArray(response)) genresData = response;
      else if (response?.genres && Array.isArray(response.genres)) genresData = response.genres;
      else if (response?.data && Array.isArray(response.data)) genresData = response.data;
      setGenres(genresData);
    } catch (error) {
      console.error('Error loading genres:', error);
      setError('Failed to load genres');
    } finally {
      setLoadingGenres(false);
    }
  };

  const loadArtists = async () => {
    setLoadingArtists(true);
    try {
      const response = await artistService.getAllArtists();
      let artistsData: Artist[] = [];
      if (response?.artists && Array.isArray(response.artists)) artistsData = response.artists;
      else if (Array.isArray(response)) artistsData = response;
      else if (response?.data && Array.isArray(response.data)) artistsData = response.data;
      setArtists(artistsData);
    } catch (error) {
      console.error('Error loading artists:', error);
      setError('Failed to load artists');
    } finally {
      setLoadingArtists(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'artist_name') {
      // Find artist by name and set both name and ID
      const selectedArtist = artists.find(artist => artist.name === value);
      setFormData({ 
        ...formData, 
        artist: selectedArtist ? selectedArtist._id : '',
        artist_name: value
      });
    } else if (name === 'genre') {
      // Find genre by name and set both name and ID
      const selectedGenre = genres.find(genre => genre.name === value);
      setFormData({ 
        ...formData, 
        genre_id: selectedGenre ? selectedGenre._id : '', 
        genre: value 
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                type === 'number' ? (value === '' ? '' : Number(value)) : value
      });
    }
  };

  const handleDurationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDurationInput(value);
    let durationInSeconds = 0;
    if (durationUnit === 'minutes') {
      if (value.includes(':')) {
        const [minutes, seconds] = value.split(':').map(Number);
        durationInSeconds = (minutes || 0) * 60 + (seconds || 0);
      } else durationInSeconds = (Number(value) || 0) * 60;
    } else durationInSeconds = Number(value) || 0;
    setFormData({ ...formData, duration: durationInSeconds });
  };

  const handleDurationUnitChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const unit = e.target.value as 'seconds' | 'minutes';
    setDurationUnit(unit);
    if (formData.duration) {
      if (unit === 'minutes') {
        const minutes = Math.floor(formData.duration / 60);
        const seconds = formData.duration % 60;
        setDurationInput(seconds > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${minutes}`);
      } else setDurationInput(formData.duration.toString());
    } else setDurationInput('');
  };

  const handlePlaqueInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentPlaque({ ...currentPlaque, [name]: value });
  };

  const uploadImageToSupabase = async (file: File, folder: string): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('album').upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('album').getPublicUrl(fileName);
      return publicUrl;
    } catch (error: any) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, type: 'cover' | 'plaque') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'cover') setPreviewImage(reader.result as string);
        else setPlaquePreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      const imageUrl = await uploadImageToSupabase(file, type === 'cover' ? 'cover-art' : 'plaques');
      if (type === 'cover') setFormData({ ...formData, cover_art: imageUrl });
      else setCurrentPlaque({ ...currentPlaque, plaque_image_url: imageUrl });
    } catch (error: any) {
      setError(error.message || `Failed to upload ${type} image`);
    } finally {
      setUploading(false);
    }
  };

  const addPlaque = () => {
    if (currentPlaque.plaque_type && currentPlaque.plaque_image_url) {
      setPlaqueArray([...plaqueArray, { ...currentPlaque }]);
      setCurrentPlaque({ plaque_type: '', plaque_image_url: '', plaque_price_range: "" });
      setPlaquePreviewImage(null);
    }
  };

  const removePlaque = (index: number) => {
    setPlaqueArray(plaqueArray.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      title: '', artist: '', artist_name: '', release_date: '', genre: '', genre_id: '', cover_art: '', description: '',
      track_count: 0, copyright_info: '', publisher: '', credits: '', affiliation: '', duration: 0,
      is_published: false, is_featured: false
    });
    setPreviewImage(null);
    setPlaqueArray([]);
    setCurrentPlaque({ plaque_type: '', plaque_image_url: '', plaque_price_range: "" });
    setPlaquePreviewImage(null);
    setDurationInput('');
    setDurationUnit('seconds');
    setError(null);
    setSubmitLoading(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    try {
      if (!formData.title || !formData.artist) throw new Error('Title and Artist are required');
      
      // Create the album data with proper structure for backend
      const albumData = { 
        title: formData.title,
        artist: formData.artist, // Send only the artist ID as string
        release_date: formData.release_date,
        genre: formData.genre_id, // Send genre ID instead of genre name
        genre_id: formData.genre_id,
        cover_art: formData.cover_art,
        description: formData.description,
        track_count: formData.track_count,
        copyright_info: formData.copyright_info,
        publisher: formData.publisher,
        credits: formData.credits,
        affiliation: formData.affiliation,
        duration: formData.duration,
        is_published: formData.is_published,
        is_featured: formData.is_featured,
        plaqueArray: plaqueArray // Make sure this is included
      };
      
      console.log('Submitting album data:', albumData);
      console.log('Plaques being submitted:', plaqueArray);
      onSubmit(albumData as unknown as Album);
    } catch (error: any) {
      setError(error.message || 'Failed to save album');
      setSubmitLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50 z-50 lg:pl-10">
      <div className="h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                {editingAlbum ? 'Edit Album' : 'Create Album'}
              </h2>
              <p className="text-slate-600">
                {editingAlbum ? 'Update album information' : 'Add a new album to your collection'}
              </p>
            </div>
            <button 
              onClick={() => { onClose(); resetForm(); }} 
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              disabled={submitLoading}
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column - Basic Info & Cover */}
              <div className="xl:col-span-1 space-y-6">
                {/* Cover Art */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Album Cover
                  </label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, 'cover')} 
                    className="hidden" 
                    id="cover-upload" 
                    disabled={uploading || submitLoading} 
                  />
                  <label 
                    htmlFor="cover-upload" 
                    className={`block cursor-pointer ${(uploading || submitLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {uploading ? (
                      <div className="aspect-square bg-slate-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                        <span className="text-sm text-slate-600">Uploading...</span>
                      </div>
                    ) : previewImage ? (
                      <div className="relative group">
                        <img src={previewImage} alt="Cover" className="aspect-square w-full object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-medium">Change Image</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            setPreviewImage(null);
                            setFormData({ ...formData, cover_art: '' });
                          }} 
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={submitLoading}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-square bg-slate-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors">
                        <Upload className="w-10 h-10 text-slate-400 mb-2" />
                        <span className="text-sm font-medium text-slate-600">Upload Cover</span>
                        <span className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Status Toggles */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Status</h3>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-slate-700">Published</span>
                    <input 
                      type="checkbox" 
                      name="is_published" 
                      checked={formData.is_published} 
                      onChange={handleInputChange}
                      disabled={submitLoading}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50" 
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-slate-700">Featured</span>
                    <input 
                      type="checkbox" 
                      name="is_featured" 
                      checked={formData.is_featured} 
                      onChange={handleInputChange}
                      disabled={submitLoading}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50" 
                    />
                  </label>
                </div>
              </div>

              {/* Middle Column - Form Fields */}
              <div className="xl:col-span-2 space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <User className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-semibold text-slate-900">Basic Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Album Title <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleInputChange} 
                        required
                        disabled={submitLoading}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:opacity-50"
                        placeholder="Enter album title" 
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Artist <span className="text-red-500">*</span>
                        </label>
                        <select 
                          name="artist_name" 
                          value={formData.artist_name} 
                          onChange={handleInputChange} 
                          required 
                          disabled={loadingArtists || submitLoading}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:opacity-50"
                        >
                          <option value="">Select artist</option>
                          {artists.map(artist => (
                            <option key={artist._id} value={artist.name}>
                              {artist.name}
                            </option>
                          ))}
                        </select>
                        {formData.artist && (
                          <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-200">
                            <p className="text-xs text-slate-600">
                              <strong>Selected Artist:</strong><br />
                              Name: {formData.artist_name}
                            </p>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Genre</label>
                        <select 
                          name="genre" 
                          value={formData.genre} 
                          onChange={handleInputChange} 
                          disabled={loadingGenres || submitLoading}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:opacity-50"
                        >
                          <option value="">Select genre</option>
                          {genres.map(genre => (
                            <option key={genre._id} value={genre.name}>
                              {genre.name}
                            </option>
                          ))}
                        </select>
                        {formData.genre_id && (
                          <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-200">
                            <p className="text-xs text-slate-600">
                              <strong>Selected Genre:</strong><br />
                              Name: {formData.genre}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                      <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleInputChange} 
                        rows={4}
                        disabled={submitLoading}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none disabled:opacity-50"
                        placeholder="Album description" 
                      />
                    </div>
                  </div>
                </div>

                {/* Track Information */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Music className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-semibold text-slate-900">Track Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Track Count</label>
                      <input 
                        type="number" 
                        name="track_count" 
                        value={formData.track_count} 
                        onChange={handleInputChange} 
                        min="0"
                        disabled={submitLoading}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:opacity-50"
                        placeholder="0" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Duration</label>
                      <input 
                        type="text" 
                        value={durationInput} 
                        onChange={handleDurationChange}
                        disabled={submitLoading}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:opacity-50"
                        placeholder={durationUnit === 'minutes' ? '3:45' : '225'} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Unit</label>
                      <select 
                        value={durationUnit} 
                        onChange={handleDurationUnitChange}
                        disabled={submitLoading}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:opacity-50"
                      >
                        <option value="seconds">Seconds</option>
                        <option value="minutes">Minutes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Release Date</label>
                      <input 
                        type="date" 
                        name="release_date" 
                        value={formData.release_date} 
                        onChange={handleInputChange}
                        disabled={submitLoading}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Building className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-semibold text-slate-900">Business Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Copyright Info</label>
                      <input 
                        type="text" 
                        name="copyright_info" 
                        value={formData.copyright_info} 
                        onChange={handleInputChange}
                        disabled={submitLoading}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:opacity-50"
                        placeholder="© 2025" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Publisher</label>
                      <input 
                        type="text" 
                        name="publisher" 
                        value={formData.publisher} 
                        onChange={handleInputChange}
                        disabled={submitLoading}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:opacity-50"
                        placeholder="Publisher name" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Credits</label>
                      <input 
                        type="text" 
                        name="credits" 
                        value={formData.credits} 
                        onChange={handleInputChange}
                        disabled={submitLoading}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:opacity-50"
                        placeholder="Production credits" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Affiliation</label>
                      <input 
                        type="text" 
                        name="affiliation" 
                        value={formData.affiliation} 
                        onChange={handleInputChange}
                        disabled={submitLoading}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:opacity-50"
                        placeholder="Affiliation" 
                      />
                    </div>
                  </div>
                </div>

                {/* Plaques */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Award className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-semibold text-slate-900">Awards & Plaques</h3>
                  </div>
                  
                  {/* Add Plaque Form */}
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div>
                        <select 
                          name="plaque_type" 
                          value={currentPlaque.plaque_type} 
                          onChange={handlePlaqueInputChange}
                          disabled={submitLoading}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm disabled:opacity-50"
                        >
                          <option value="">Select plaque type</option>
                          {plaqueTypes.map(type => (
                            <option key={type} value={type}>
                              {capitalizePlaqueType(type)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <input 
                          type="text" 
                          name="plaque_price_range" 
                          value={currentPlaque.plaque_price_range} 
                          onChange={handlePlaqueInputChange}
                          disabled={submitLoading}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm disabled:opacity-50"
                          placeholder="Price range" 
                        />
                      </div>
                      <div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleImageUpload(e, 'plaque')} 
                          className="hidden" 
                          id="plaque-upload" 
                          disabled={uploading || submitLoading} 
                        />
                        <label 
                          htmlFor="plaque-upload" 
                          className={`w-full px-3 py-2 border border-slate-300 rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors text-sm ${(uploading || submitLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {uploading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                          ) : plaquePreviewImage ? (
                            <><CheckCircle className="w-4 h-4 text-green-600" /> Image Added</>
                          ) : (
                            <><ImageIcon className="w-4 h-4" /> Upload Image</>
                          )}
                        </label>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={addPlaque} 
                      disabled={!currentPlaque.plaque_type || !currentPlaque.plaque_image_url || uploading || submitLoading}
                      className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Plaque
                    </button>
                  </div>

                  {/* Plaque List */}
                  {plaqueArray.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Added Plaques ({plaqueArray.length})</h4>
                      {plaqueArray.map((plaque, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                          {plaque.plaque_image_url && (
                            <img 
                              src={plaque.plaque_image_url} 
                              alt={plaque.plaque_type} 
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 text-sm">
                              {capitalizePlaqueType(plaque.plaque_type)}
                            </p>
                            <p className="text-xs text-slate-600 truncate">{plaque.plaque_price_range}</p>
                            {plaque.plaque_image_url && (
                              <p className="text-xs text-slate-500 truncate mt-1">
                                Image URL: {plaque.plaque_image_url.substring(0, 50)}...
                              </p>
                            )}
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removePlaque(index)} 
                            disabled={submitLoading}
                            className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button 
                type="submit" 
                disabled={submitLoading || uploading}
                className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg font-semibold transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> {editingAlbum ? 'Updating Album...' : 'Creating Album...'}</>
                ) : uploading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Uploading Image...</>
                ) : (
                  editingAlbum ? 'Update Album' : 'Create Album'
                )}
              </button>
              <button 
                type="button" 
                onClick={() => { onClose(); resetForm(); }} 
                disabled={submitLoading || uploading}
                className="px-6 py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}