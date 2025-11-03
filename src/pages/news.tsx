import React, { useState, useEffect } from 'react';
import { Calendar, Tag, Plus, Edit2, Trash2, X, Save, Menu } from 'lucide-react';
import Sidebar from '../components/sidebar';
import newsService from '../services/news_service';

// Import Supabase
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  'https://rntctuwbqtlklrwebxlg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudGN0dXdicXRsa2xyd2VieGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDQ2MzEsImV4cCI6MjA3Njg4MDYzMX0.e3Ir6Ro051jO0rtveFTk01XL1AsMWFqIQyxPOZGzodY'
);

interface NewsItem {
  id: string;
  _id?: string;
  image: string;
  title: string;
  description: string;
  category: string;
  expires_at: string;
  is_published: boolean;
}

interface FormData {
  image: string;
  title: string;
  description: string;
  category: string;
  expires_at: string;
  is_published: boolean;
}

export default function NewsManagement() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    image: "",
    title: "",
    description: "",
    category: "",
    expires_at: "",
    is_published: false
  });

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Loading news from API...');
      
      const response = await newsService.getAllNews();
      console.log('📥 API Response:', response);

      let newsData: NewsItem[] = [];

      // Handle the API response structure: {success: true, news: Array, pagination: Object}
      if (response && response.success && Array.isArray(response.news)) {
        newsData = response.news;
        console.log('✅ Found news data in response.news:', newsData);
      } else if (Array.isArray(response)) {
        newsData = response;
        console.log('✅ Found news data as direct array');
      } else if (response && Array.isArray(response.data)) {
        newsData = response.data;
        console.log('✅ Found news data in response.data');
      }

      // Process the data to ensure all items have proper IDs
      const processedData = (newsData || []).map((item, index) => {
        // Use _id as the primary ID if available, otherwise use id or create fallback
        const id = item._id || item.id || `news-${index}-${Date.now()}`;
        console.log(`🆔 Processing item ${index}: _id=${item._id}, id=${item.id}, final id=${id}`);
        
        return {
          ...item,
          id: id, // Standardize on id field
          _id: item._id // Keep _id for API calls
        };
      });

      console.log('✅ Processed news data:', processedData);
      setNewsList(processedData);
    } catch (err: any) {
      console.error('❌ Error loading news:', err);
      setError('Failed to load news. Please try again.');
      setNewsList([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (): void => {
    setFormData({
      image: "",
      title: "",
      description: "",
      category: "",
      expires_at: "",
      is_published: false
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  // Function to upload image to Supabase
  const uploadImageToSupabase = async (file: File): Promise<string> => {
    try {
      console.log('📤 Uploading image to Supabase...', file.name);
      
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('news')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Supabase upload error:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      console.log('✅ Image uploaded successfully:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('news')
        .getPublicUrl(fileName);

      console.log('🔗 Public URL:', publicUrl);
      return publicUrl;

    } catch (err: any) {
      console.error('❌ Error uploading image:', err);
      throw new Error(err.message || 'Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('📤 Submitting form data:', formData);
      
      if (editingId) {
        console.log(`🔄 Updating news with ID: ${editingId}`);
        // Use _id for API calls if available, otherwise use id
        const newsItem = newsList.find(item => item.id === editingId);
        const apiId = newsItem?._id || editingId;
        console.log(`🎯 Using API ID: ${apiId} for update`);
        
        await newsService.updateNews(apiId, formData);
        console.log('✅ News updated successfully');
      } else {
        console.log('🆕 Creating new news item');
        await newsService.createNews(formData);
        console.log('✅ News created successfully');
      }
      await loadNews();
      resetForm();
    } catch (err: any) {
      console.error('❌ Error saving news:', err);
      setError(err.response?.data?.message || 'Failed to save news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (news: NewsItem): void => {
    console.log(`✏️ Editing news with ID: ${news.id}`, news);
    setFormData({
      image: news.image,
      title: news.title,
      description: news.description,
      category: news.category,
      expires_at: news.expires_at,
      is_published: news.is_published
    });
    setEditingId(news.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    console.log(`🗑️ Attempting to delete news with ID: ${id}`);
    
    if (!id) {
      console.error('❌ Cannot delete news: invalid ID.');
      setError('Cannot delete news: invalid ID.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this news item?')) {
      try {
        setLoading(true);
        setError('');
        
        const newsItem = newsList.find(item => item.id === id);
        console.log('📋 News item to delete:', newsItem);

        if (!newsItem) {
          console.error('❌ News item not found in local state');
          setError('News item not found.');
          return;
        }

        // Use _id for API calls if available, otherwise use id
        const apiId = newsItem._id || id;
        console.log(`🎯 Using API ID for deletion: ${apiId}`);

        // Only call API if it's a real ID (not a temporary one)
        if (!apiId.startsWith('news-')) {
          console.log('🌐 Calling API to delete news...');
          await newsService.deleteNews(apiId);
          console.log('✅ News deleted from API successfully');
        } else {
          console.log('📝 Skipping API call for temporary ID, only removing from local state');
        }
        
        // Remove the deleted item from the local state
        console.log('🔄 Removing news from local state...');
        setNewsList((prev) => {
          const newList = prev.filter((item) => item.id !== id);
          console.log('✅ Local state updated. Remaining items:', newList.length);
          return newList;
        });
        
        console.log('🎉 Delete process completed successfully');
        
      } catch (err: any) {
        console.error('❌ Error deleting news:', err);
        
        if (err.response?.status === 404) {
          console.log('⚠️ News item not found in API, removing from local state anyway');
          setError('News item not found. It may have already been deleted.');
          // Remove from local state anyway
          setNewsList((prev) => prev.filter((item) => item.id !== id));
        } else {
          const errorMsg = err.response?.data?.message || 'Failed to delete news. Please try again.';
          console.error('❌ Delete error:', errorMsg);
          setError(errorMsg);
        }
      } finally {
        setLoading(false);
      }
    } else {
      console.log('❌ Delete cancelled by user');
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'No expiry';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    try {
      return dateString.split('T')[0];
    } catch {
      return '';
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) parent.innerHTML = '<div class="flex items-center justify-center h-full text-red-400 text-5xl">📰</div>';
  };

  const handleImageUpload = async (file: File): Promise<void> => {
    try {
      console.log('📸 Handling image upload:', file.name, file.type, file.size);
      setLoading(true);
      
      // Upload to Supabase
      const imageUrl = await uploadImageToSupabase(file);
      
      console.log('✅ Image uploaded successfully, URL:', imageUrl);
      setFormData({ ...formData, image: imageUrl });
      
    } catch (err: any) {
      console.error('❌ Error uploading image:', err);
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-red-100 flex">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full z-40">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors z-50">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="w-7 h-7 text-red-600" />
            <span className="font-bold text-lg">News</span>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-100' : 'lg:ml-60'}`}>
        <div className="overflow-auto h-screen">
          <div className="p-4 lg:p-8 max-w-6xl mx-auto lg:mt-0 mt-16">

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
                <button onClick={() => setError('')} className="absolute top-0 right-0 px-4 py-3">
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Loading Overlay */}
            {loading && (
              <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                  <p className="mt-4 text-gray-700">Processing...</p>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="hidden lg:flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">News Management</h1>
                <p className="text-gray-600">Create, update, and manage your news announcements</p>
              </div>
              <button 
                onClick={() => setShowForm(true)} 
                disabled={loading}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
                Add News
              </button>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden mb-6 text-center">
              <h1 className="text-2xl font-bold text-gray-800">News Management</h1>
              <p className="text-gray-600 text-sm mt-1">Create, update, and manage your news announcements</p>
              <button 
                onClick={() => setShowForm(true)} 
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
                Add News
              </button>
            </div>

            {/* Add/Edit Modal */}
            {showForm && (
              <div className="fixed inset-0  bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-auto">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-gradient-to-r from-red-500 to-red-600 p-6 flex justify-between items-center z-10">
                    <h2 className="text-2xl font-bold text-white">{editingId ? 'Edit News' : 'Add New News'}</h2>
                    <button onClick={resetForm} className="text-white hover:bg-red-700 p-2 rounded-lg transition-colors">
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Drag & Drop Image Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Image Upload</label>
                      <div
                        className="w-full h-80 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-500 transition-colors"
                        onClick={() => document.getElementById('imageUpload')?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files[0];
                          if (file && file.type.startsWith('image/')) {
                            console.log('🖼️ Image dropped:', file.name);
                            handleImageUpload(file);
                          }
                        }}
                      >
                        {formData.image ? (
                          <img src={formData.image} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <>
                            <Plus className="w-10 h-10 text-red-500 mb-2" />
                            <p className="text-gray-500">Click or drag image here to upload</p>
                            <p className="text-gray-400 text-sm mt-2">Image will be uploaded to Supabase storage</p>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          id="imageUpload"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              console.log('🖼️ Image selected via file input:', e.target.files[0].name);
                              handleImageUpload(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                      </div>
                      {formData.image && (
                        <p className="text-green-600 text-sm mt-2">
                          ✅ Image uploaded successfully to Supabase
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                      <input 
                        type="text" 
                        value={formData.title} 
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" 
                        required 
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <textarea 
                        value={formData.description} 
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-32" 
                        required 
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <input 
                        type="text" 
                        value={formData.category} 
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" 
                        required 
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Expires At</label>
                      <input 
                        type="date" 
                        value={formatDateForInput(formData.expires_at)} 
                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value + 'T00:00:00.000Z' })} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" 
                        required 
                        disabled={loading}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="is_published" 
                        checked={formData.is_published} 
                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })} 
                        className="w-5 h-5 text-red-600 rounded focus:ring-red-500" 
                        disabled={loading}
                      />
                      <label htmlFor="is_published" className="text-sm font-semibold text-gray-700">Publish immediately</label>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save size={20} />
                        {loading ? 'Processing...' : (editingId ? 'Update News' : 'Create News')}
                      </button>
                      <button 
                        type="button" 
                        onClick={resetForm} 
                        disabled={loading}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* News Grid */}
            {!loading && (
              <>
                {newsList && newsList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {newsList.map((news, index) => (
                      <div 
                        key={news.id || `news-${index}`}
                        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100 transform transition-all duration-300 hover:scale-105"
                      >
                        <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 flex justify-between items-center">
                          <span className="bg-white text-red-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
                            <Tag size={14} />
                            {news.category}
                          </span>
                          {news.is_published && (
                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              Published
                            </span>
                          )}
                        </div>
                        <div className="relative h-48 bg-gradient-to-br from-red-100 to-red-200">
                          <img 
                            src={news.image} 
                            alt={news.title} 
                            className="w-full h-full object-cover" 
                            onError={handleImageError} 
                          />
                        </div>
                        <div className="p-6">
                          <h2 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
                            {news.title}
                          </h2>
                          <p className="text-gray-700 mb-4 line-clamp-3">
                            {news.description}
                          </p>
                          <div className="flex items-center gap-2 text-gray-600 pb-4 border-b border-red-100">
                            <Calendar size={16} className="text-red-500" />
                            <span className="text-xs">
                              Expires: <strong>{formatDate(news.expires_at)}</strong>
                            </span>
                          </div>
                          <div className="flex gap-3 mt-4">
                            <button 
                              onClick={() => handleEdit(news)} 
                              disabled={loading}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Edit2 size={16}/>Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(news.id)}
                              disabled={loading}
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={16}/>Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📰</div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">No news yet</h3>
                    <p className="text-gray-600">Click the "Add News" button to create your first announcement</p>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}