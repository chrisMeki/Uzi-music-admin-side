import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Music, Plus, X, Calendar, User, ImageIcon } from 'lucide-react';
import Sidebar from '../components/sidebar'; // Adjust the import path as needed

interface Album {
  id: number;
  title: string;
  artist: string;
  year?: string;
  genre?: string;
  coverUrl?: string;
}

interface FormData {
  title: string;
  artist: string;
  year: string;
  genre: string;
  coverUrl: string;
}

export default function AlbumManager() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    artist: '',
    year: '',
    genre: '',
    coverUrl: ''
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const genres = ['Rock', 'Pop', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'Country', 'R&B', 'Metal', 'Indie'];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setFormData({
          ...formData,
          coverUrl: result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.artist) {
      setAlbums([...albums, { ...formData, id: Date.now() }]);
      setFormData({ title: '', artist: '', year: '', genre: '', coverUrl: '' });
      setPreviewImage(null);
      setIsFormOpen(false);
    }
  };

  const deleteAlbum = (id: number) => {
    setAlbums(albums.filter(album => album.id !== id));
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

        <div className="p-4 lg:p-8 min-h-[calc(100vh-80px)] lg:min-h-screen">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 lg:mb-12 animate-fade-in">
              <div className="flex items-center justify-center mb-4">
                <Music className="w-12 h-12 lg:w-16 lg:h-16 text-red-600 animate-pulse" />
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-2 tracking-tight">
                Album Collection
              </h1>
              <p className="text-gray-600 text-base lg:text-lg">Curate your musical journey</p>
            </div>

            {/* Add Album Button */}
            <div className="flex justify-center mb-6 lg:mb-8">
              <button
                onClick={() => setIsFormOpen(true)}
                className="group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 lg:px-8 lg:py-4 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 font-semibold text-base lg:text-lg"
              >
                <Plus className="w-5 h-5 lg:w-6 lg:h-6 group-hover:rotate-90 transition-transform duration-300" />
                Add New Album
              </button>
            </div>

            {/* Form Modal */}
            {isFormOpen && (
              <div className="fixed inset-0 bg bg-opacity-50 flex items-start justify-center ">
                <div className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl max-w-2xl w-full p-6 lg:p-8 transform animate-scale-in max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Add New Album</h2>
                    <button
                      onClick={() => setIsFormOpen(false)}
                      className="text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all duration-300"
                    >
                      <X className="w-6 h-6 lg:w-8 lg:h-8" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Album Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 outline-none"
                        placeholder="Enter album title"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Artist Name *
                      </label>
                      <input
                        type="text"
                        name="artist"
                        value={formData.artist}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 outline-none"
                        placeholder="Enter artist name"
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Release Year
                        </label>
                        <input
                          type="number"
                          name="year"
                          value={formData.year}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 outline-none"
                          placeholder="2024"
                          min={1900}
                          max={2025}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Genre
                        </label>
                        <select
                          name="genre"
                          value={formData.genre}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 outline-none bg-white"
                        >
                          <option value="">Select genre</option>
                          {genres.map(genre => (
                            <option key={genre} value={genre}>{genre}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Cover Image
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="cover-upload"
                        />
                        <label
                          htmlFor="cover-upload"
                          className="block w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-500 transition-all duration-300 cursor-pointer text-center bg-gray-50 hover:bg-red-50"
                        >
                          {previewImage ? (
                            <div className="flex items-center justify-center gap-3">
                              <img src={previewImage} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
                              <span className="text-sm text-gray-600">Click to change image</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2 py-2">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                              <span className="text-sm text-gray-600">Click to upload album cover</span>
                              <span className="text-xs text-gray-400">PNG, JPG up to 10MB</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      >
                        Add Album
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="px-8 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Albums Grid */}
            {albums.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {albums.map((album, index) => (
                  <div
                    key={album.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative h-40 lg:h-48 bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center overflow-hidden">
                      {album.coverUrl ? (
                        <img
                          src={album.coverUrl}
                          alt={album.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <Music className="w-16 h-16 lg:w-20 lg:h-20 text-white opacity-50" />
                      )}
                      <button
                        onClick={() => deleteAlbum(album.id)}
                        className="absolute top-3 right-3 bg-white text-red-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                    </div>
                    <div className="p-4 lg:p-6">
                      <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1 truncate">
                        {album.title}
                      </h3>
                      <p className="text-gray-600 mb-3 truncate">{album.artist}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {album.year && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{album.year}</span>}
                        {album.genre && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">{album.genre}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 lg:py-16">
                <Music className="w-16 h-16 lg:w-24 lg:h-24 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-base lg:text-lg">No albums yet. Start building your collection!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
