import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Article types
interface Article {
  id?: string;
  author: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  images: string[];
}

interface Category {
  id: string;
  name: string;
}

const CreateArticle: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Mock categories - replace with actual data from your API
  const categories: Category[] = [
    { id: '1', name: 'Technology' },
    { id: '2', name: 'Business' },
    { id: '3', name: 'Health' },
    { id: '4', name: 'Science' },
    { id: '5', name: 'Arts' }
  ];

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setImages([...images, ...fileArray]);
      
      // Create preview URLs
      const newImageUrls = fileArray.map(file => URL.createObjectURL(file));
      setImageUrls([...imageUrls, ...newImageUrls]);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = [...images];
    const newImageUrls = [...imageUrls];
    
    newImages.splice(index, 1);
    newImageUrls.splice(index, 1);
    
    setImages(newImages);
    setImageUrls(newImageUrls);
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      setSelectedTags([...selectedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  // Handle tag input keydown (add tag on enter)
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    if (!title || !description || !selectedCategory) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', categories.find((cat) => cat.id === selectedCategory)?.name || '');
      formData.append('tags', JSON.stringify(selectedTags)); // send as stringified array
  
      images.forEach((image) => {
        formData.append('images', image); // key must match your multer config
      });
  
      const token = localStorage.getItem('token');
  
      const response = await axios.post(
        'http://localhost:5000/api/articles/create',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      if (response.status === 201) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error creating article:', err);
      setError('Failed to create article. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white py-4 shadow-md">
        <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-2xl font-bold">
              <span className="text-red-500">P</span>ublish
            </h1>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center mb-6 text-sm">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="text-gray-600 hover:text-red-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-red-700 to-red-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Create New Article</h2>
            <p className="text-red-100 text-sm mt-1">Fill in all required fields marked with an asterisk (*)</p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <div className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Article Title */}
            <div>
              <label htmlFor="title" className="block mb-2 font-medium text-gray-900">
                Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title"
                className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700"
                required
              />
            </div>
            
            {/* Category Selection */}
            <div>
              <label htmlFor="category" className="block mb-2 font-medium text-gray-900">
                Category <span className="text-red-600">*</span>
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700 bg-white"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Article Description */}
            <div>
              <label htmlFor="description" className="block mb-2 font-medium text-gray-900">
                Description <span className="text-red-600">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter article description"
                rows={6}
                className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700"
                required
              />
            </div>
            
            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block mb-2 font-medium text-gray-900">
                Tags
              </label>
              <div className="flex mb-2">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add tags and press Enter"
                  className="flex-1 px-4 py-3 rounded-l border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700"
                />
                <button 
                  type="button" 
                  onClick={addTag}
                  className="bg-red-700 hover:bg-red-800 text-white px-4 py-3 rounded-r"
                >
                  Add
                </button>
              </div>
              
              {selectedTags.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedTags.map((tag) => (
                    <span key={tag} className="inline-flex items-center bg-black text-white px-3 py-1 rounded-full text-sm">
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-white focus:outline-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  No tags added yet. Tags help improve article discoverability.
                </p>
              )}
            </div>
            
            {/* Image Upload */}
            <div>
              <label className="block mb-2 font-medium text-gray-900">Images</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 transition hover:border-red-700 bg-gray-50">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-1 text-sm text-gray-600">Drag and drop your images here</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                  <button
                    type="button"
                    className="mt-4 px-4 py-2 border border-red-700 text-red-700 rounded-md hover:bg-red-700 hover:text-white transition"
                    onClick={() => document.getElementById('fileInput')?.click()}
                  >
                    Browse Files
                  </button>
                  <input
                    id="fileInput"
                    type="file"
                    onChange={handleImageChange}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
              
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative h-32 rounded-lg border border-gray-300 overflow-hidden group">
                      <img 
                        src={url} 
                        alt={`Preview ${index}`} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300"></div>
                      <button 
                        type="button" 
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-60 hover:bg-red-700 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            
            {/* Submit Button */}
            <div className="flex justify-end border-t border-gray-200 pt-6">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={`px-8 py-3 rounded-md font-medium ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-700 hover:bg-red-800'
                  } text-white shadow-sm`}
                >
                  {isLoading ? 'Creating...' : 'Create Article'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateArticle;