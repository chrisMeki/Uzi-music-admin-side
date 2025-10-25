import React, { useState } from 'react';
import { Plus, Tag, Trash2 } from 'lucide-react';
import Sidebar from '../components/sidebar'; // Adjust the import path as needed

interface Genre {
  id: number;
  name: string;
  description: string;
}

export default function AddGenreScreen() {
  const [genreName, setGenreName] = useState('');
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSubmit = () => {
    if (genreName.trim()) {
      setGenres([...genres, { 
        id: Date.now(), 
        name: genreName, 
        description: description 
      }]);
      setGenreName('');
      setDescription('');
    }
  };

  const handleDelete = (id: number) => {
    setGenres(genres.filter(genre => genre.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
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
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4">
                <Tag className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Add Genre</h1>
              <p className="text-gray-600">Create and manage your content genres</p>
            </div>

            {/* Add Genre Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 mb-6 border border-red-100">
              <div className="space-y-4">
                <div>
                  <label htmlFor="genreName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Genre Name
                  </label>
                  <input
                    type="text"
                    id="genreName"
                    value={genreName}
                    onChange={(e) => setGenreName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="e.g., Action, Romance, Thriller"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors resize-none"
                    placeholder="Brief description of the genre"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Add Genre
                </button>
              </div>
            </div>

            {/* Genre List */}
            {genres.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-red-100">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4">
                  Added Genres ({genres.length})
                </h2>
                <div className="space-y-3">
                  {genres.map((genre) => (
                    <div
                      key={genre.id}
                      className="flex items-start justify-between p-4 bg-gradient-to-r from-red-50 to-white rounded-lg border border-red-100 hover:border-red-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Tag className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-800 text-lg truncate">{genre.name}</h3>
                          {genre.description && (
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{genre.description}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(genre.id)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
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