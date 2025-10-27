import { useState, type ChangeEvent, type FormEvent, useEffect } from 'react';
import { X, Calendar, User, ImageIcon, FileText, Copyright, Building, Award, Clock, Trash2, Plus, Music, Loader2, ChevronDown } from 'lucide-react';
import type { Album, FormData, Plaque } from '../types';
import { createClient } from '@supabase/supabase-js';
import artistService from '../services/addartist_service';
import genreService from '../services/genre_service';

// Initialize Supabase client
const supabase = createClient(
  'https://rntctuwbqtlklrwebxlg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudGN0dXdicXRsa2xyd2VieGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDQ2MzEsImV4cCI6MjA3Njg4MDYzMX0.e3Ir6Ro051jO0rtveFTk01XL1AsMWFqIQyxPOZGzodY'
);

interface AlbumFormProps {
  editingAlbum: Album | null;
  onSubmit: (album: Album) => void;
  onClose: () => void;
}

interface Genre {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface Artist {
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
}

export default function AlbumForm({ editingAlbum, onSubmit, onClose }: AlbumFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    artist: '',
    release_date: '',
    genre: '',
    genre_id: '',
    cover_art: '',
    description: '',
    track_count: 0,
    copyright_info: '',
    publisher: '',
    credits: '',
    affiliation: '',
    duration: 0,
    is_published: false,
    is_featured: false
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [plaqueArray, setPlaqueArray] = useState<Plaque[]>([]);
  const [currentPlaque, setCurrentPlaque] = useState<Plaque>({
    plaque_type: '',
    plaque_image_url: '',
    plaque_price_range: "",
  });
  const [plaquePreviewImage, setPlaquePreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loadingGenres, setLoadingGenres] = useState<boolean>(false);
  const [loadingArtists, setLoadingArtists] = useState<boolean>(false);
  const [selectedArtistId, setSelectedArtistId] = useState<string>('');
  const [selectedGenreId, setSelectedGenreId] = useState<string>('');
  const [durationInput, setDurationInput] = useState<string>('');
  const [durationUnit, setDurationUnit] = useState<'seconds' | 'minutes'>('seconds');

  const plaqueTypes = ['Gold', 'Platinum', 'Diamond', 'Multi-Platinum', 'Silver', 'Ruby'];

  // Load genres and artists
  useEffect(() => {
    loadGenres();
    loadArtists();
  }, []);

  // Load album data when editing
  useEffect(() => {
    if (editingAlbum) {
      console.log('Editing album data:', editingAlbum);
      
      // Handle artist field - check if it's an object or string
      let artistId = '';
      if (typeof editingAlbum.artist === 'string') {
        artistId = editingAlbum.artist;
      } else if (editingAlbum.artist && typeof editingAlbum.artist === 'object') {
        artistId = (editingAlbum.artist as any)._id || (editingAlbum.artist as any).id || '';
      }

      // Handle duration - convert to readable format
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
        release_date: editingAlbum.release_date || '',
        genre: editingAlbum.genre || '',
        genre_id: editingAlbum.genre_id || '',
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
      
      setSelectedArtistId(artistId);
      setSelectedGenreId(editingAlbum.genre_id || '');
      setPreviewImage(editingAlbum.cover_art || null);
      setPlaqueArray(editingAlbum.plaqueArray || []);
      setDurationInput(durationValue);
    } else {
      resetForm();
    }
  }, [editingAlbum]);

  const loadGenres = async () => {
    setLoadingGenres(true);
    try {
      const response = await genreService.getAllGenres();
      console.log('Genres API response:', response);
      
      let genresData: Genre[] = [];
      
      if (response && Array.isArray(response)) {
        genresData = response;
      } else if (response && response.genres && Array.isArray(response.genres)) {
        genresData = response.genres;
      } else if (response && response.data && Array.isArray(response.data)) {
        genresData = response.data;
      } else {
        console.warn('Unexpected genres response structure:', response);
        genresData = [];
      }
      
      console.log('Processed genres data:', genresData);
      setGenres(genresData);
    } catch (error) {
      console.error('Error loading genres:', error);
      setError('Failed to load genres');
      setGenres([]);
    } finally {
      setLoadingGenres(false);
    }
  };

  const loadArtists = async () => {
    setLoadingArtists(true);
    try {
      const response = await artistService.getAllArtists();
      console.log('Artists API response:', response);
      
      let artistsData: Artist[] = [];
      
      if (response && response.artists && Array.isArray(response.artists)) {
        artistsData = response.artists;
      } else if (Array.isArray(response)) {
        artistsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        artistsData = response.data;
      } else {
        console.warn('Unexpected artists response structure:', response);
        artistsData = [];
      }
      
      console.log('Processed artists data:', artistsData);
      setArtists(artistsData);
    } catch (error) {
      console.error('Error loading artists:', error);
      setError('Failed to load artists');
      setArtists([]);
    } finally {
      setLoadingArtists(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'artist') {
      setFormData({
        ...formData,
        artist: value
      });
      setSelectedArtistId(value);
    } else if (name === 'genre_id') {
      const selectedGenre = genres.find(genre => genre._id === value);
      setFormData({
        ...formData,
        genre_id: value,
        genre: selectedGenre ? selectedGenre.name : ''
      });
      setSelectedGenreId(value);
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
    
    // Convert to seconds based on the selected unit
    let durationInSeconds = 0;
    
    if (durationUnit === 'minutes') {
      // Handle MM:SS format or just minutes
      if (value.includes(':')) {
        const [minutes, seconds] = value.split(':').map(Number);
        durationInSeconds = (minutes || 0) * 60 + (seconds || 0);
      } else {
        durationInSeconds = (Number(value) || 0) * 60;
      }
    } else {
      durationInSeconds = Number(value) || 0;
    }
    
    setFormData({
      ...formData,
      duration: durationInSeconds
    });
  };

  const handleDurationUnitChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const unit = e.target.value as 'seconds' | 'minutes';
    setDurationUnit(unit);
    
    // Convert existing duration to new unit for display
    if (formData.duration) {
      if (unit === 'minutes') {
        const minutes = Math.floor(formData.duration / 60);
        const seconds = formData.duration % 60;
        setDurationInput(seconds > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${minutes}`);
      } else {
        setDurationInput(formData.duration.toString());
      }
    } else {
      setDurationInput('');
    }
  };

  const handlePlaqueInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentPlaque({
      ...currentPlaque,
      [name]: value
    });
  };

  const uploadImageToSupabase = async (file: File, folder: string): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('album')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('album')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);

        const imageUrl = await uploadImageToSupabase(file, 'cover-art');
        setFormData({
          ...formData,
          cover_art: imageUrl
        });
      } catch (error: any) {
        console.error('Error uploading cover art:', error);
        setError(error.message || 'Failed to upload cover image');
      } finally {
        setUploading(false);
      }
    }
  };

  const handlePlaqueImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPlaquePreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);

        const imageUrl = await uploadImageToSupabase(file, 'plaques');
        setCurrentPlaque({
          ...currentPlaque,
          plaque_image_url: imageUrl
        });
      } catch (error: any) {
        console.error('Error uploading plaque image:', error);
        setError(error.message || 'Failed to upload plaque image');
      } finally {
        setUploading(false);
      }
    }
  };

  const addPlaque = () => {
    if (currentPlaque.plaque_type && currentPlaque.plaque_image_url) {
      setPlaqueArray([...plaqueArray, { ...currentPlaque }]);
      setCurrentPlaque({
        plaque_type: '',
        plaque_image_url: '',
         plaque_price_range: "",
      });
      setPlaquePreviewImage(null);
    }
  };

  const removePlaque = (index: number) => {
    setPlaqueArray(plaqueArray.filter((_, i) => i !== index));
  };

  const clearCoverImage = () => {
    setPreviewImage(null);
    setFormData({
      ...formData,
      cover_art: ''
    });
  };

  const clearPlaqueImage = () => {
    setPlaquePreviewImage(null);
    setCurrentPlaque({
      ...currentPlaque,
      plaque_image_url: ''
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      artist: '',
      release_date: '',
      genre: '',
      genre_id: '',
      cover_art: '',
      description: '',
      track_count: 0,
      copyright_info: '',
      publisher: '',
      credits: '',
      affiliation: '',
      duration: 0,
      is_published: false,
      is_featured: false
    });
    setSelectedArtistId('');
    setSelectedGenreId('');
    setPreviewImage(null);
    setPlaqueArray([]);
    setCurrentPlaque({
      plaque_type: '',
      plaque_image_url: '',
       plaque_price_range: "",
    });
    setPlaquePreviewImage(null);
    setDurationInput('');
    setDurationUnit('seconds');
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.title || !formData.artist) {
        throw new Error('Title and Artist are required');
      }

      const albumData = {
        ...formData,
        plaqueArray: [...plaqueArray]
      };

      onSubmit(albumData as Album);
    } catch (error: any) {
      console.error('Error saving album:', error);
      setError(error.response?.data?.message || error.message || 'Failed to save album');
    } finally {
      setLoading(false);
    }
  };

  const PlaqueSection = () => (
    <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-100 rounded-xl">
          <Award className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Awards & Plaques</h3>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-2xl mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Plaque Type
            </label>
            <select
              name="plaque_type"
              value={currentPlaque.plaque_type}
              onChange={handlePlaqueInputChange}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 outline-none text-gray-900 appearance-none cursor-pointer"
            >
              <option value="" className="text-gray-500">Select plaque type</option>
              {plaqueTypes.map(type => (
                <option key={type} value={type} className="text-gray-900 py-2">
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price Range
            </label>
            <input
              type="text"
              name="plaque_price_range"
              value={currentPlaque.plaque_price_range}
              onChange={handlePlaqueInputChange}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 outline-none text-gray-900 placeholder-gray-500"
              placeholder="e.g., $500 - $1000 or 500-1000"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Plaque Image
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handlePlaqueImageUpload}
                className="hidden"
                id="plaque-upload"
                disabled={uploading}
              />
              <label
                htmlFor="plaque-upload"
                className={`block w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl transition-all duration-300 cursor-pointer text-center bg-white text-gray-700 ${
                  uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-red-500 hover:bg-red-50'
                }`}
              >
                {uploading ? (
                  <span className="text-gray-700">Uploading...</span>
                ) : plaquePreviewImage ? (
                  <div className="flex items-center justify-center gap-2">
                    <img src={plaquePreviewImage} alt="Plaque Preview" className="h-8 w-8 object-cover rounded" />
                    <span className="text-gray-700">Change image</span>
                  </div>
                ) : (
                  <span className="text-gray-700">Upload plaque image</span>
                )}
              </label>
              {plaquePreviewImage && !uploading && (
                <button
                  type="button"
                  onClick={clearPlaqueImage}
                  className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors duration-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
        
        <button
          type="button"
          onClick={addPlaque}
          disabled={!currentPlaque.plaque_type || !currentPlaque.plaque_image_url || uploading}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Plaque
        </button>
      </div>

      {plaqueArray.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-700">Added Plaques:</h4>
          {plaqueArray.map((plaque, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <img 
                  src={plaque.plaque_image_url} 
                  alt={plaque.plaque_type}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div>
                  <p className="font-semibold text-gray-900">{plaque.plaque_type}</p>
                  <p className="text-sm text-gray-600">{plaque.plaque_price_range}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removePlaque(index)}
                className="text-red-600 hover:text-red-800 p-2 transition-colors duration-200"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-white z-50 lg:pl-10">
      <div className="h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                {editingAlbum ? 'Edit Album' : 'Add New Album'}
              </h2>
              <p className="text-gray-600 text-lg">
                {editingAlbum ? 'Update the album details' : 'Fill in the details to add a new album to your collection'}
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all duration-300 p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl"
            >
              <X className="w-8 h-8 lg:w-10 lg:h-10" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <User className="w-6 h-6 text-red-600" />
                    </div>
                    Basic Information
                  </h3>
                  <div className="space-y-6">
                    <div className="group">
                      <label className="block text-lg font-semibold text-gray-700 mb-3">
                        Album Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 outline-none text-gray-900 placeholder-gray-500 text-lg"
                        placeholder="Enter album title"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        Artist *
                      </label>
                      <select
                        name="artist"
                        value={formData.artist}
                        onChange={handleInputChange}
                        required
                        className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 outline-none text-gray-900 text-lg"
                        disabled={loadingArtists}
                      >
                        <option value="" className="text-gray-500">Select artist</option>
                        {Array.isArray(artists) && artists.map(artist => (
                          <option key={artist._id} value={artist._id} className="text-gray-900">
                            {artist.name}
                          </option>
                        ))}
                      </select>
                      {loadingArtists && (
                        <p className="text-gray-500 mt-2">Loading artists...</p>
                      )}
                      {!loadingArtists && artists.length === 0 && (
                        <p className="text-yellow-600 mt-2">No artists available. Please add artists first.</p>
                      )}
                      
                      {selectedArtistId && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-sm font-semibold text-gray-700">Selected Artist ID:</p>
                          <p className="text-lg font-mono text-red-600 bg-white p-2 rounded-lg mt-1 border">
                            {selectedArtistId}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-gray-600" />
                          Release Date
                        </label>
                        <input
                          type="date"
                          name="release_date"
                          value={formData.release_date}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 outline-none text-gray-900 text-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                          Genre
                        </label>
                        <select
                          name="genre_id"
                          value={formData.genre_id}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 outline-none text-gray-900 text-lg"
                          disabled={loadingGenres}
                        >
                          <option value="" className="text-gray-500">Select genre</option>
                          {genres.map(genre => (
                            <option key={genre._id} value={genre._id} className="text-gray-900">
                              {genre.name}
                            </option>
                          ))}
                        </select>
                        {loadingGenres && (
                          <p className="text-gray-500 mt-2">Loading genres...</p>
                        )}
                        {!loadingGenres && genres.length === 0 && (
                          <p className="text-yellow-600 mt-2">No genres available.</p>
                        )}
                      </div>
                    </div>

                    {selectedGenreId && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-sm font-semibold text-gray-700">Selected Genre ID:</p>
                        <p className="text-lg font-mono text-red-600 bg-white p-2 rounded-lg mt-1 border">
                          {selectedGenreId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Track Information */}
                <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <Music className="w-6 h-6 text-red-600" />
                    </div>
                    Track Information
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3">
                        Track Count
                      </label>
                      <input
                        type="number"
                        name="track_count"
                        value={formData.track_count}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 outline-none text-gray-900 placeholder-gray-500 text-lg"
                        placeholder="Number of tracks"
                      />
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-600" />
                        Duration
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={durationInput}
                          onChange={handleDurationChange}
                          className="flex-1 px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 outline-none text-gray-900 placeholder-gray-500 text-lg"
                          placeholder={durationUnit === 'minutes' ? 'e.g., 3:45 or 5' : 'e.g., 225'}
                        />
                        <div className="relative">
                          <select
                            value={durationUnit}
                            onChange={handleDurationUnitChange}
                            className="w-32 px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 outline-none text-gray-900 appearance-none cursor-pointer"
                          >
                            <option value="seconds">Seconds</option>
                            <option value="minutes">Minutes</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {durationUnit === 'minutes' 
                          ? 'Enter minutes (e.g., 5) or minutes:seconds (e.g., 3:45)' 
                          : 'Enter duration in seconds'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <Building className="w-6 h-6 text-red-600" />
                    </div>
                    Business Information
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Copyright className="w-5 h-5 text-gray-600" />
                          Copyright Information
                        </label>
                        <input
                          type="text"
                          name="copyright_info"
                          value={formData.copyright_info}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 outline-none text-gray-900 placeholder-gray-500 text-lg"
                          placeholder="Copyright information"
                        />
                      </div>

                      <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          Publisher
                        </label>
                        <input
                          type="text"
                          name="publisher"
                          value={formData.publisher}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 outline-none text-gray-900 placeholder-gray-500 text-lg"
                          placeholder="Publisher name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                          Credits
                        </label>
                        <input
                          type="text"
                          name="credits"
                          value={formData.credits}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 outline-none text-gray-900 placeholder-gray-500 text-lg"
                          placeholder="Production credits"
                        />
                      </div>

                      <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                          Affiliation
                        </label>
                        <input
                          type="text"
                          name="affiliation"
                          value={formData.affiliation}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 outline-none text-gray-900 placeholder-gray-500 text-lg"
                          placeholder="Affiliation"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Cover Art */}
                <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <ImageIcon className="w-6 h-6 text-red-600" />
                    </div>
                    Cover Art
                  </h3>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="cover-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="cover-upload"
                      className={`block w-full border-2 border-dashed border-gray-300 rounded-2xl transition-all duration-300 cursor-pointer bg-gray-50 ${
                        uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-red-500 hover:bg-red-50'
                      }`}
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center gap-6 p-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                          <span className="text-xl font-semibold text-gray-600">Uploading...</span>
                        </div>
                      ) : previewImage ? (
                        <div className="relative p-6">
                          <img src={previewImage} alt="Preview" className="w-full h-80 object-cover rounded-xl" />
                          <button
                            type="button"
                            onClick={clearCoverImage}
                            className="absolute top-8 right-8 bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors duration-200"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-6 p-12">
                          <ImageIcon className="w-20 h-20 text-gray-400" />
                          <div className="text-center">
                            <span className="text-2xl font-semibold text-gray-600">Click to upload album cover</span>
                            <p className="text-gray-500 mt-3 text-lg">PNG, JPG up to 10MB</p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <FileText className="w-6 h-6 text-red-600" />
                    </div>
                    Description
                  </h3>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 outline-none text-gray-900 placeholder-gray-500 text-lg resize-none"
                    placeholder="Album description"
                  />
                </div>

                {/* Status Flags */}
                <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Album Status</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-2xl">
                      <input
                        type="checkbox"
                        name="is_published"
                        checked={formData.is_published}
                        onChange={handleInputChange}
                        className="w-6 h-6 text-red-600 rounded focus:ring-red-500"
                      />
                      <label className="text-xl font-semibold text-gray-700">Published</label>
                    </div>
                    <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-2xl">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleInputChange}
                        className="w-6 h-6 text-red-600 rounded focus:ring-red-500"
                      />
                      <label className="text-xl font-semibold text-gray-700">Featured</label>
                    </div>
                  </div>
                </div>

                {/* Plaque Section */}
                <PlaqueSection />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col lg:flex-row gap-6 pt-8 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-5 rounded-2xl font-bold text-xl shadow-2xl transform hover:scale-105 disabled:scale-100 transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Creating Album...
                  </>
                ) : uploading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Uploading...
                  </>
                ) : editingAlbum ? (
                  'Update Album'
                ) : (
                  'Add Album to Collection'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                disabled={loading || uploading}
                className="lg:px-12 py-5 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-2xl font-bold text-xl transition-all duration-300 disabled:opacity-50"
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