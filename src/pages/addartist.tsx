import { useState, useEffect } from 'react';
import { User, Upload, X } from 'lucide-react';
import Sidebar from '../components/sidebar';
import artistService from '../services/addartist_service';
import genreService from '../services/genre_service';
import userService from '../services/user_service';
import { createClient } from '@supabase/supabase-js';
import DeleteModal from '../components/artistdeletemodal';
import UpdateModal from '../components/artistupdatemodal';

const supabase = createClient(
  'https://rntctuwbqtlklrwebxlg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudGN0dXdicXRsa2xyd2VieGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDQ2MzEsImV4cCI6MjA3Njg4MDYzMX0.e3Ir6Ro051jO0rtveFTk01XL1AsMWFqIQyxPOZGzodY'
);

interface Artist {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  bio: string;
  profilePictureUrl: string;
  cover_photo: string;
  genre: string;
  user: string;
  genreName?: string;
  userEmail?: string;
}

interface FormData {
  name: string;
  firstName: string;
  lastName: string;
  bio: string;
  profilePictureUrl: string | File;
  cover_photo: string | File;
  genre: string;
  user: string;
}

interface Genre {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function AddArtistAdmin() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    firstName: "",
    lastName: "",
    bio: "",
    profilePictureUrl: "",
    cover_photo: "",
    genre: "",
    user: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [genres, setGenres] = useState<Genre[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingArtists, setLoadingArtists] = useState(false);

  // Load artists from API on component mount
  useEffect(() => {
    const fetchArtists = async () => {
      setLoadingArtists(true);
      try {
        const response = await artistService.getAllArtists();
        let artistsData: Artist[] = [];
        
        if (Array.isArray(response)) artistsData = response;
        else if (response?.data) artistsData = response.data;
        else if (response?.artists) artistsData = response.artists;
        else if (response?.result) artistsData = response.result;
        
        const formattedArtists = artistsData.map((artist: any) => ({
          id: artist.id || artist._id,
          name: artist.name || '',
          firstName: artist.firstName || '',
          lastName: artist.lastName || '',
          bio: artist.bio || '',
          profilePictureUrl: artist.profilePictureUrl || '',
          cover_photo: artist.cover_photo || '',
          genre: artist.genre || '',
          user: artist.user || '',
          genreName: artist.genreName || '',
          userEmail: artist.userEmail || ''
        })).filter(artist => artist.id);
        
        setArtists(formattedArtists);
      } catch (error) {
        console.error('Error fetching artists:', error);
        setError('Failed to load artists');
      } finally {
        setLoadingArtists(false);
      }
    };

    fetchArtists();
  }, []);

  useEffect(() => {
    const fetchGenres = async () => {
      setLoadingGenres(true);
      try {
        const response = await genreService.getAllGenres();
        let genresData: Genre[] = [];
        
        if (Array.isArray(response)) genresData = response;
        else if (response?.data) genresData = response.data;
        else if (response?.genres) genresData = response.genres;
        else if (response?.result) genresData = response.result;
        
        const formattedGenres = genresData.map((genre: any) => ({
          id: genre.id?.toString() || genre._id?.toString(),
          name: genre.name || genre.genreName || 'Unknown Genre'
        })).filter(genre => genre.id && genre.name);
        
        setGenres(formattedGenres);
      } catch (error) {
        console.error('Error fetching genres:', error);
        setGenres([{ id: '1', name: 'Hip Hop' }, { id: '2', name: 'R&B' }]);
      } finally {
        setLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await userService.getAllUsers();
        let usersData: User[] = [];
        
        if (Array.isArray(response)) usersData = response;
        else if (response?.data) usersData = response.data;
        else if (response?.users) usersData = response.users;
        else if (response?.result) usersData = response.result;
        
        const formattedUsers = usersData.map((user: any) => ({
          id: user.id?.toString() || user._id?.toString(),
          name: user.name || user.username || '',
          email: user.email || 'No email'
        })).filter(user => user.id && user.email);
        
        setUsers(formattedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Function to get genre name for display
  const getGenreName = (genreId: string) => {
    if (!genreId) return 'No Genre';
    const genre = genres.find(g => g.id === genreId);
    return genre ? genre.name : 'No Genre';
  };

  // Function to get user email for display
  const getUserEmail = (userId: string) => {
    if (!userId) return 'No User';
    const user = users.find(u => u.id === userId);
    return user ? user.email : 'No User';
  };

  const uploadImageToSupabase = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error } = await supabase.storage.from('image').upload(fileName, file);
    if (error) throw new Error(`Failed to upload image: ${error.message}`);

    const { data: { publicUrl } } = supabase.storage.from('image').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleFileUpload = (field: 'profilePictureUrl' | 'cover_photo') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file');
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size should be less than 5MB');
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          field === 'profilePictureUrl' ? setProfilePreview(imageUrl) : setCoverPreview(imageUrl);
        };
        reader.readAsDataURL(file);

        setFormData(prev => ({ ...prev, [field]: file }));
      }
    };
    input.click();
  };

  const removeImage = (field: 'profilePictureUrl' | 'cover_photo') => {
    setFormData(prev => ({ ...prev, [field]: "" }));
    field === 'profilePictureUrl' ? setProfilePreview(null) : setCoverPreview(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Artist name is required';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.bio.trim()) newErrors.bio = 'Bio is required';
    if (!formData.genre.trim()) newErrors.genre = 'Genre is required';
    if (!formData.user.trim()) newErrors.user = 'User is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddArtist = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError(null);

    try {
      let profilePictureUrl = formData.profilePictureUrl;
      let coverPhotoUrl = formData.cover_photo;

      if (formData.profilePictureUrl instanceof File) {
        profilePictureUrl = await uploadImageToSupabase(formData.profilePictureUrl, 'profile-pictures');
      }
      if (formData.cover_photo instanceof File) {
        coverPhotoUrl = await uploadImageToSupabase(formData.cover_photo, 'cover-photos');
      }

      const artistData = {
        name: formData.name,
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        profilePictureUrl: profilePictureUrl as string,
        cover_photo: coverPhotoUrl as string,
        genre: formData.genre,
        user: formData.user
      };

      const response = await artistService.create(artistData);
      const newArtist: Artist = { 
        ...artistData, 
        id: response.id || Date.now(),
        genreName: getGenreName(formData.genre),
        userEmail: getUserEmail(formData.user)
      };
      
      setArtists(prev => [...prev, newArtist]);
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create artist');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", firstName: "", lastName: "", bio: "", profilePictureUrl: "", cover_photo: "", genre: "", user: "" });
    setProfilePreview(null);
    setCoverPreview(null);
    setErrors({});
    setEditingId(null);
    setError(null);
  };

  const handleEditClick = (artist: Artist) => {
    setFormData({
      name: artist.name,
      firstName: artist.firstName,
      lastName: artist.lastName,
      bio: artist.bio,
      profilePictureUrl: artist.profilePictureUrl,
      cover_photo: artist.cover_photo,
      genre: artist.genre,
      user: artist.user
    });
    setProfilePreview(artist.profilePictureUrl);
    setCoverPreview(artist.cover_photo);
    setEditingId(artist.id);
    setShowForm(true);
    setError(null);
  };

  const handleUpdateArtist = () => {
    if (validateForm()) {
      setSelectedArtist({ ...formData as Artist, id: editingId! });
      setShowUpdateModal(true);
    }
  };

  const confirmUpdate = async () => {
    setLoading(true);
    setError(null);

    try {
      let profilePictureUrl = formData.profilePictureUrl;
      let coverPhotoUrl = formData.cover_photo;

      if (formData.profilePictureUrl instanceof File) {
        profilePictureUrl = await uploadImageToSupabase(formData.profilePictureUrl, 'profile-pictures');
      }
      if (formData.cover_photo instanceof File) {
        coverPhotoUrl = await uploadImageToSupabase(formData.cover_photo, 'cover-photos');
      }

      const updateData = {
        name: formData.name,
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        profilePictureUrl: profilePictureUrl as string,
        cover_photo: coverPhotoUrl as string,
        genre: formData.genre,
        user: formData.user
      };

      await artistService.updateArtist(editingId!.toString(), updateData);
      setArtists(prev => prev.map(artist => 
        artist.id === editingId ? { 
          ...updateData, 
          id: editingId!,
          genreName: getGenreName(formData.genre),
          userEmail: getUserEmail(formData.user)
        } : artist
      ));
      
      setShowUpdateModal(false);
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update artist');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (artist: Artist) => {
    setSelectedArtist(artist);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await artistService.deleteArtist(selectedArtist!.id.toString());
      setArtists(prev => prev.filter(artist => artist.id !== selectedArtist!.id));
      setShowDeleteModal(false);
      setSelectedArtist(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete artist');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewArtistClick = () => {
    resetForm();
    setShowForm(true);
  };

  const handleCloseForm = () => {
    resetForm();
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-red-100 flex">
      <div className="fixed left-0 top-0 h-full z-40">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-100' : 'lg:ml-60'}`}>
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="overflow-auto h-[calc(100vh-80px)] lg:h-screen">
          <div className="p-6 lg:p-8">
            <div className="w-full max-w-6xl mx-auto">
              {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {loading && (
                <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-6 flex items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    <span className="text-gray-700">Processing...</span>
                  </div>
                </div>
              )}

              {/* Always show the Add New Artist button at the top */}
              {!showForm && (
                <div className="mb-8 flex justify-center">
                  <button 
                    onClick={handleAddNewArtistClick} 
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-lg font-bold rounded-2xl shadow-xl hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105"
                  >
                    + Add New Artist
                  </button>
                </div>
              )}

              {showForm && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 mb-6 border border-red-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">
                      {editingId ? 'Edit Artist' : 'Add New Artist'}
                    </h2>
                    <button onClick={handleCloseForm} className="text-gray-500 hover:text-red-600 transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    {/* Form fields remain the same */}
                    <div>
                      <label className="block text-sm font-bold text-red-700 uppercase tracking-wide mb-3">Artist Name *</label>
                      <input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className={`w-full px-4 lg:px-6 py-3 lg:py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-200 transition-all ${errors.name ? 'border-red-500 bg-red-50' : 'border-red-200'}`} placeholder="e.g., Winky D" />
                      {errors.name && <p className="text-red-600 text-sm mt-2">{errors.name}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
                      <div>
                        <label className="block text-sm font-bold text-red-700 uppercase tracking-wide mb-3">First Name *</label>
                        <input type="text" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} className={`w-full px-4 lg:px-6 py-3 lg:py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-200 ${errors.firstName ? 'border-red-500 bg-red-50' : 'border-red-200'}`} placeholder="First name" />
                        {errors.firstName && <p className="text-red-600 text-sm mt-2">{errors.firstName}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-red-700 uppercase tracking-wide mb-3">Last Name *</label>
                        <input type="text" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} className={`w-full px-4 lg:px-6 py-3 lg:py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-200 ${errors.lastName ? 'border-red-500 bg-red-50' : 'border-red-200'}`} placeholder="Last name" />
                        {errors.lastName && <p className="text-red-600 text-sm mt-2">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-red-700 uppercase tracking-wide mb-3">Biography *</label>
                      <textarea value={formData.bio} onChange={(e) => handleInputChange('bio', e.target.value)} rows={4} className={`w-full px-4 lg:px-6 py-3 lg:py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-200 resize-none ${errors.bio ? 'border-red-500 bg-red-50' : 'border-red-200'}`} placeholder="Enter artist biography..." />
                      {errors.bio && <p className="text-red-600 text-sm mt-2">{errors.bio}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
                      <div>
                        <label className="block text-sm font-bold text-red-700 uppercase tracking-wide mb-3">Profile Picture</label>
                        <div className="space-y-3">
                          {profilePreview && (
                            <div className="relative w-full h-40 lg:h-48 rounded-xl overflow-hidden border-2 border-red-200">
                              <img src={profilePreview} alt="Profile preview" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeImage('profilePictureUrl')} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          <button type="button" onClick={() => handleFileUpload('profilePictureUrl')} className="w-full flex items-center justify-center gap-2 px-4 lg:px-6 py-3 lg:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg">
                            <Upload className="w-5 h-5" />
                            {profilePreview ? 'Change Profile Picture' : 'Upload Profile Picture'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-red-700 uppercase tracking-wide mb-3">Cover Photo</label>
                        <div className="space-y-3">
                          {coverPreview && (
                            <div className="relative w-full h-40 lg:h-48 rounded-xl overflow-hidden border-2 border-red-200">
                              <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeImage('cover_photo')} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          <button type="button" onClick={() => handleFileUpload('cover_photo')} className="w-full flex items-center justify-center gap-2 px-4 lg:px-6 py-3 lg:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg">
                            <Upload className="w-5 h-5" />
                            {coverPreview ? 'Change Cover Photo' : 'Upload Cover Photo'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
                      <div>
                        <label className="block text-sm font-bold text-red-700 uppercase tracking-wide mb-3">Genre *</label>
                        <select value={formData.genre} onChange={(e) => handleInputChange('genre', e.target.value)} className={`w-full px-4 lg:px-6 py-3 lg:py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-200 ${errors.genre ? 'border-red-500 bg-red-50' : 'border-red-200'}`}>
                          <option value="">Select a genre</option>
                          {genres.map((genre) => (
                            <option key={genre.id} value={genre.id}>
                              {genre.name}
                            </option>
                          ))}
                        </select>
                        {loadingGenres && <p className="text-gray-600 text-sm mt-2">Loading genres...</p>}
                        {errors.genre && <p className="text-red-600 text-sm mt-2">{errors.genre}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-red-700 uppercase tracking-wide mb-3">User *</label>
                        <select value={formData.user} onChange={(e) => handleInputChange('user', e.target.value)} className={`w-full px-4 lg:px-6 py-3 lg:py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-200 ${errors.user ? 'border-red-500 bg-red-50' : 'border-red-200'}`}>
                          <option value="">Select a user</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name ? `${user.name} - ${user.email}` : user.email}
                            </option>
                          ))}
                        </select>
                        {loadingUsers && <p className="text-gray-600 text-sm mt-2">Loading users...</p>}
                        {errors.user && <p className="text-red-600 text-sm mt-2">{errors.user}</p>}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button type="button" onClick={editingId ? handleUpdateArtist : handleAddArtist} disabled={loading} className="flex-1 flex items-center justify-center gap-3 px-6 lg:px-8 py-4 lg:py-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-lg font-bold rounded-2xl shadow-xl hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Processing...' : (editingId ? 'Update Artist' : 'Add Artist')}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Show artist list only when form is NOT open */}
              {!showForm && (
                <>
                  {loadingArtists ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                      <span className="ml-4 text-gray-700 text-lg">Loading artists...</span>
                    </div>
                  ) : artists.length > 0 ? (
                    <div className="space-y-6">
                      <h3 className="text-xl lg:text-2xl font-bold text-red-800 mb-4">Added Artists ({artists.length})</h3>
                      {artists.map(artist => (
                        <div key={artist.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 lg:p-6 border border-red-100">
                          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                            {artist.profilePictureUrl ? (
                              <img src={artist.profilePictureUrl} alt={artist.name} className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl object-cover border-2 border-red-200 flex-shrink-0" />
                            ) : (
                              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center flex-shrink-0">
                                <User className="w-8 h-8 lg:w-12 lg:h-12 text-red-600" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <h4 className="text-xl lg:text-2xl font-bold text-red-800 mb-2 truncate">{artist.name}</h4>
                              <p className="text-gray-700 mb-2"><span className="font-semibold">Name:</span> {artist.firstName} {artist.lastName}</p>
                              <p className="text-gray-600 mb-3 line-clamp-2">{artist.bio}</p>
                              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                <span className="bg-red-100 px-3 py-1 rounded-full">
                                  {/* Display stored genre name or get it from genres list */}
                                  Genre: {artist.genreName || getGenreName(artist.genre)}
                                </span>
                                <span className="bg-red-100 px-3 py-1 rounded-full">
                                  {/* Display stored user email or get it from users list */}
                                  User: {artist.userEmail || getUserEmail(artist.user)}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                              <button onClick={() => handleEditClick(artist)} disabled={loading} className="px-4 lg:px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg text-sm lg:text-base disabled:opacity-50">Update</button>
                              <button onClick={() => handleDeleteClick(artist)} disabled={loading} className="px-4 lg:px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg text-sm lg:text-base disabled:opacity-50">Delete</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-red-100">
                        <User className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-red-800 mb-2">No Artists Added Yet</h3>
                        <p className="text-gray-600 mb-6">Start by adding your first artist using the button above.</p>
                        <button onClick={handleAddNewArtistClick} className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg">
                          + Add Your First Artist
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <DeleteModal show={showDeleteModal} artist={selectedArtist} loading={loading} onClose={() => setShowDeleteModal(false)} onConfirm={confirmDelete} />
      <UpdateModal show={showUpdateModal} artist={selectedArtist} loading={loading} onClose={() => setShowUpdateModal(false)} onConfirm={confirmUpdate} />
    </div>
  );
}