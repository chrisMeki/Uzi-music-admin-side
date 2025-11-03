import { useState, useEffect } from 'react';
import { Award, Calendar, Clock, Music, Plus, Star, Edit, Trash2, Menu, X } from 'lucide-react';
import Sidebar from '../components/sidebar';
import albumService from '../services/addalbum_service';
import AlbumForm from '../components/albumform';
import defaultCover from '../assets/default.jpeg'; 

interface Artist {
  _id: string;
  name: string;
  profilePictureUrl?: string;
}

interface Plaque {
  plaque_type: string;
  plaque_image_url?: string;
  plaque_price_range?: string;
}

interface Album {
  id: string;
  _id?: string;
  title: string;
  artist: Artist | string;
  description?: string;
  cover_art?: string;
  release_date?: string;
  genre?: string | { _id: string; name: string };
  track_count: number;
  duration: number;
  is_published: boolean;
  is_featured: boolean;
  publisher?: string;
  plaqueArray: Plaque[];
  copyright_info?: string;
  credits?: string;
  affiliation?: string;
}

export default function AlbumManager() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await albumService.getAllAlbums();

      let albumsData: Album[] = [];

      if (Array.isArray(response)) {
        albumsData = response;
      } else if (Array.isArray(response?.albums)) {
        albumsData = response.albums;
      } else if (Array.isArray(response?.data)) {
        albumsData = response.data;
      } else if (Array.isArray(response?.results)) {
        albumsData = response.results;
      } else {
        setError("Unexpected data format received from server");
        return;
      }

      albumsData = albumsData.map((album: any) => ({
        ...album,
        id: album.id || album._id
      }));

      setAlbums(albumsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching albums:", err);
      setError("Failed to fetch albums. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const deleteAlbum = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this album?")) return;

    try {
      await albumService.deleteAlbum(id);
      setAlbums(albums.filter(album => album.id !== id));
    } catch (error: any) {
      console.error("Error deleting album:", error);
      setError(error.response?.data?.message || error.message || "Failed to delete album");
    }
  };

  const editAlbum = (album: Album) => {
    setEditingAlbum(album);
    setIsFormOpen(true);
  };

  // Improved normalization function
  const normalizeAlbumData = (albumData: Album): any => {
    const normalized: any = { ...albumData };
    
    // Remove frontend-only fields
    if (normalized.id) {
      delete normalized.id;
    }
    
    // Handle artist field
    if (normalized.artist && typeof normalized.artist === 'object' && '_id' in normalized.artist) {
      normalized.artist = normalized.artist._id;
    }
    
    // Handle genre field - ensure it's sent as ID only
    if (normalized.genre && typeof normalized.genre === 'object' && '_id' in normalized.genre) {
      normalized.genre = normalized.genre._id;
    }
    
    // Ensure plaqueArray is properly formatted
    if (normalized.plaqueArray && !Array.isArray(normalized.plaqueArray)) {
      normalized.plaqueArray = [];
    }
    
    // Convert empty strings to undefined for optional fields
    const optionalFields = ['description', 'cover_art', 'copyright_info', 'credits', 'affiliation', 'publisher'];
    optionalFields.forEach(field => {
      if (normalized[field] === '') {
        normalized[field] = undefined;
      }
    });
    
    return normalized;
  };

  const handleFormSubmit = async (albumData: Album) => {
    try {
      const normalizedData = normalizeAlbumData(albumData);
      
      let result;
      if (editingAlbum) {
        result = await albumService.updateAlbum(editingAlbum.id, normalizedData);
      } else {
        result = await albumService.createAlbum(normalizedData);
      }

      // Handle different response formats
      const updatedAlbum = result.data || result.album || result;
      
      if (!updatedAlbum) {
        throw new Error("No album data returned from server");
      }

      if (editingAlbum) {
        setAlbums(albums.map(album =>
          album.id === editingAlbum.id ? { ...updatedAlbum, id: editingAlbum.id } : album
        ));
      } else {
        setAlbums([...albums, { ...updatedAlbum, id: updatedAlbum.id || updatedAlbum._id }]);
      }
      
      setIsFormOpen(false);
      setEditingAlbum(null);
      setError(null);
      
      // Refresh the list to ensure we have the latest data with populated fields
      setTimeout(() => {
        fetchAlbums();
      }, 100);
      
    } catch (error: any) {
      console.error("Error saving album:", error);
      
      let errorMessage = "Failed to save album. Please try again.";
      
      if (error.response?.data) {
        const serverError = error.response.data;
        
        if (serverError.message) {
          errorMessage = serverError.message;
        }
        
        if (serverError.error && serverError.error.includes('populate')) {
          errorMessage = "Server error: Please contact administrator. (Database population issue)";
        }
        
        // Handle validation errors
        if (serverError.errors) {
          const validationErrors = Object.values(serverError.errors).map((err: any) => err.message);
          errorMessage = `Validation errors: ${validationErrors.join(', ')}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingAlbum(null);
    setError(null);
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds) return "0 min";
    return `${Math.floor(seconds / 60)} min`;
  };

  const getArtistName = (artist: Artist | string): string =>
    typeof artist === "string" ? artist : artist?.name || "Unknown Artist";

  const getGenreName = (genre: string | { _id: string; name: string } | undefined): string => {
    if (!genre) return "Unknown Genre";
    if (typeof genre === "string") return genre;
    return genre.name || "Unknown Genre";
  };

  const getCoverArt = (albumId: string, cover_art?: string): string => {
    if (!cover_art || cover_art.trim() === '' || imageErrors.has(albumId)) {
      return defaultCover;
    }
    return cover_art;
  };

  const handleImageError = (albumId: string) => {
    setImageErrors(prev => new Set(prev).add(albumId));
  };

  const renderAlbums = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading albums...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <span className="font-semibold">Error: </span>
              <span>{error}</span>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 ml-4 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {error.includes('contact administrator') && (
            <div className="mt-2 text-sm">
              <button 
                onClick={fetchAlbums}
                className="text-red-600 hover:text-red-800 underline"
              >
                Try refreshing the page
              </button>
            </div>
          )}
        </div>
      );
    }

    if (!albums.length) {
      return (
        <div className="text-center py-12">
          <Music className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No albums found. Start adding music!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {albums.map((album) => (
          <div
            key={album.id}
            className="bg-white rounded-xl lg:rounded-2xl shadow-md hover:shadow-lg lg:hover:shadow-2xl transition transform hover:scale-[1.02] lg:hover:scale-105 overflow-hidden cursor-pointer group"
          >
            <div className="relative h-40 lg:h-48 bg-gradient-to-br from-red-400 to-red-600">
              <img
                src={getCoverArt(album.id, album.cover_art)}
                alt={album.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => handleImageError(album.id)}
              />

              <div className="absolute top-2 right-2 lg:top-3 lg:right-3 flex gap-1 lg:gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={(e) => { e.stopPropagation(); editAlbum(album); }}
                  className="bg-white text-blue-600 p-1.5 lg:p-2 rounded-full hover:bg-blue-50 transition-colors shadow-md hover:shadow-lg"
                  title="Edit Album"
                >
                  <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteAlbum(album.id); }}
                  className="bg-white text-red-600 p-1.5 lg:p-2 rounded-full hover:bg-red-50 transition-colors shadow-md hover:shadow-lg"
                  title="Delete Album"
                >
                  <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                </button>
              </div>

              {album.is_featured && (
                <div className="absolute top-2 left-2 lg:top-3 lg:left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Featured
                </div>
              )}
            </div>

            <div className="p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-bold mb-1 truncate">{album.title}</h3>
              <p className="text-gray-600 text-sm lg:text-base mb-2 truncate">
                Artist: {getArtistName(album.artist)}
              </p>
              <p className="text-gray-500 text-xs lg:text-sm line-clamp-2 mb-3">
                {album.description || "No description available"}
              </p>

              {album.genre && (
                <div className="mb-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    Genre: {getGenreName(album.genre)}
                  </span>
                </div>
              )}

              {Array.isArray(album.plaqueArray) && album.plaqueArray.length > 0 && (
                <div className="flex flex-wrap gap-1 lg:gap-2 mb-3">
                  {album.plaqueArray.slice(0, 2).map((plaque, i) => (
                    <div
                      key={`${plaque.plaque_type}-${i}`}
                      className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold"
                    >
                      <Award className="w-3 h-3" />
                      {plaque.plaque_type}
                    </div>
                  ))}
                  {album.plaqueArray.length > 2 && (
                    <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                      +{album.plaqueArray.length - 2}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2 lg:gap-3 text-xs lg:text-sm text-gray-500 mb-3">
                {album.release_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(album.release_date).getFullYear()}
                  </span>
                )}
                {album.track_count > 0 && <span>{album.track_count} Tracks</span>}
                {album.duration > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(album.duration)}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center text-xs text-gray-400">
                {album.is_published
                  ? <span className="text-green-600 font-semibold">Published</span>
                  : <span>Draft</span>}
                {album.publisher && <span className="truncate max-w-[100px] lg:max-w-none">{album.publisher}</span>}
              </div>

              <div className="flex gap-2 mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-100">
                <button
                  onClick={(e) => { e.stopPropagation(); editAlbum(album); }}
                  className="flex-1 bg-blue-600 text-white py-2 px-2 lg:px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 lg:gap-2 text-xs lg:text-sm font-medium"
                >
                  <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteAlbum(album.id); }}
                  className="flex-1 bg-red-600 text-white py-2 px-2 lg:px-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1 lg:gap-2 text-xs lg:text-sm font-medium"
                >
                  <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-red-100 flex">
      {/* Sidebar - Fixed position */}
      <div className="fixed left-0 top-0 h-full z-40">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors z-50"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <Music className="w-7 h-7 text-red-600" />
            <span className="font-bold text-lg">Albums</span>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content - Scrollable area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-100' : 'lg:ml-60'}`}>
        <div className="overflow-auto h-screen">
          <div className="p-4 lg:p-8 max-w-6xl mx-auto lg:mt-0 mt-16">
            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-8 lg:mb-10">
              <Music className="w-14 h-14 lg:w-16 lg:h-16 text-red-600 mx-auto mb-3 lg:mb-4" />
              <h1 className="text-3xl lg:text-4xl font-bold">Album Collection</h1>
              <p className="text-gray-600 text-sm lg:text-base">Curate your musical journey</p>
            </div>

            {/* Mobile Header Replacement */}
            <div className="lg:hidden mb-6">
              <h1 className="text-2xl font-bold text-center text-gray-800">Album Collection</h1>
              <p className="text-gray-600 text-center text-sm mt-1">Curate your musical journey</p>
            </div>

            <div className="flex justify-center mb-6">
              <button
                onClick={() => {
                  setEditingAlbum(null);
                  setIsFormOpen(true);
                }}
                className="bg-red-600 text-white px-6 py-3 lg:px-8 lg:py-3 rounded-xl lg:rounded-2xl hover:bg-red-700 transition flex items-center gap-3 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full lg:w-auto justify-center text-sm lg:text-base"
              >
                <Plus className="w-5 h-5 lg:w-6 lg:h-6" />
                <span>Add New Album</span>
              </button>
            </div>

            {isFormOpen && (
              <AlbumForm
                onSubmit={handleFormSubmit}
                onClose={handleFormClose}
                editingAlbum={editingAlbum as any} 
              />
            )}

            {renderAlbums()}
          </div>
        </div>
      </div>
    </div>
  );
}