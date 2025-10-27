import React, { useState, useEffect } from 'react';
import { Plus, Tag, Trash2, Edit2, X, Check } from 'lucide-react';
import Sidebar from '../components/sidebar';
import genreService from '../services/genre-service';

interface Genre {
  id: string;
  name: string;
}

export default function GenreManagementScreen() {
  const [genreName, setGenreName] = useState('');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Get all genres on component mount
  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await genreService.getAll();
      
      // ✅ Handle different possible response structures
      let genresData: Genre[] = [];
      
      if (Array.isArray(response)) {
        // If response is directly an array
        genresData = response;
      } else if (response && Array.isArray(response.data)) {
        // If response has data property that is an array
        genresData = response.data;
      } else if (response && response.genres && Array.isArray(response.genres)) {
        // If response has genres property that is an array
        genresData = response.genres;
      } else if (response && response.result && Array.isArray(response.result)) {
        // If response has result property that is an array
        genresData = response.result;
      } else {
        console.warn('Unexpected API response structure:', response);
        setError('Unexpected data format received from server');
        return;
      }
      
      // ✅ Ensure all genres have proper id and name
      const formattedGenres = genresData.map((genre: any, index) => ({
        id: genre.id?.toString() || genre._id?.toString() || `genre-${index}-${Date.now()}`,
        name: genre.name || genre.genreName || 'Unknown Genre'
      }));
      
      setGenres(formattedGenres);
    } catch (err: any) {
      setError('Failed to fetch genres');
      console.error('Error fetching genres:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create genre
  const handleCreate = async () => {
    if (!genreName.trim()) return;

    try {
      setError('');
      setLoading(true);
      const newGenre = { name: genreName.trim() };
      const response = await genreService.create(newGenre);
      
      // ✅ Handle different response structures for create
      let createdGenre: Genre;
      
      if (response && response.id) {
        createdGenre = {
          id: response.id.toString(),
          name: response.name || genreName.trim()
        };
      } else if (response && response.data) {
        createdGenre = {
          id: response.data.id?.toString() || `genre-${Date.now()}`,
          name: response.data.name || genreName.trim()
        };
      } else {
        createdGenre = {
          id: `genre-${Date.now()}`,
          name: genreName.trim()
        };
      }
      
      setGenres(prevGenres => [...prevGenres, createdGenre]);
      setGenreName('');
    } catch (err: any) {
      setError('Failed to create genre');
      console.error('Error creating genre:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete genre
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this genre?')) {
      return;
    }

    try {
      setError('');
      setLoading(true);
      await genreService.remove(id);
      setGenres(prevGenres => prevGenres.filter(genre => genre.id !== id));
    } catch (err: any) {
      setError('Failed to delete genre');
      console.error('Error deleting genre:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Start editing
  const startEditing = (genre: Genre) => {
    setEditingId(genre.id);
    setEditingName(genre.name);
  };

  // ✅ Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  // ✅ Update genre
  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;

    try {
      setError('');
      setLoading(true);
      const updatedGenre = { name: editingName.trim() };
      const response = await genreService.update(id, updatedGenre);
      
      // ✅ Handle different response structures for update
      let updatedGenreData: Genre;
      
      if (response && response.id) {
        updatedGenreData = {
          id: response.id.toString(),
          name: response.name || editingName.trim()
        };
      } else if (response && response.data) {
        updatedGenreData = {
          id: response.data.id?.toString() || id,
          name: response.data.name || editingName.trim()
        };
      } else {
        updatedGenreData = {
          id: id,
          name: editingName.trim()
        };
      }
      
      setGenres(prevGenres => 
        prevGenres.map(genre => 
          genre.id === id ? updatedGenreData : genre
        )
      );
      setEditingId(null);
      setEditingName('');
    } catch (err: any) {
      setError('Failed to update genre');
      console.error('Error updating genre:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle key press for create input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreate();
    }
  };

  // ✅ Handle key press for edit input
  const handleEditKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUpdate(id);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-red-100 flex">
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
          <div className="p-6 lg:p-8 flex items-center justify-center">
            <div className="w-full max-w-2xl">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4">
                  <Tag className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Manage Genres</h1>
                <p className="text-gray-600">Create, update, and delete your content genres</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              

              {/* Create Genre Form */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 mb-6 border border-red-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Genre</h2>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={genreName}
                    onChange={(e) => setGenreName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="Enter genre name (e.g., Zim Dancehall)"
                    disabled={loading}
                  />
                  <button
                    onClick={handleCreate}
                    disabled={!genreName.trim() || loading}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                    {loading ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </div>

              {/* All Genres List */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-red-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
                    All Genres {genres.length > 0 && `(${genres.length})`}
                  </h2>
                  <button
                    onClick={fetchGenres}
                    disabled={loading}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
                
                {loading && genres.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading genres...</p>
                  </div>
                ) : genres.length === 0 ? (
                  <div className="text-center py-12">
                    <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No genres yet. Create your first genre above!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {genres.map((genre) => (
                      <div
                        key={genre.id} // ✅ Unique key prop
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-white rounded-lg border border-red-100 hover:border-red-300 hover:shadow-md transition-all"
                      >
                        {editingId === genre.id ? (
                          // Edit Mode
                          <div className="flex items-center gap-3 flex-1">
                            <Tag className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => handleEditKeyPress(e, genre.id)}
                              className="flex-1 px-3 py-2 border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-500"
                              autoFocus
                              disabled={loading}
                            />
                            <button
                              onClick={() => handleUpdate(genre.id)}
                              disabled={loading}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                              title="Save"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={loading}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                              title="Cancel"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          // View Mode
                          <>
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <Tag className="w-5 h-5 text-red-600 flex-shrink-0" />
                              <h3 className="font-semibold text-gray-800 text-lg truncate">{genre.name}</h3>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => startEditing(genre)}
                                disabled={loading}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                                title="Edit"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(genre.id)}
                                disabled={loading}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}