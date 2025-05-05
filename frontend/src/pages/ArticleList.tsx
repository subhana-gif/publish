import { useState, useEffect } from "react";
import { Pencil, Trash, Eye, ThumbsUp, ThumbsDown, UserX, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { 
  getUserData, 
  getUserArticles, 
  deleteArticle, 
  updateArticle,  
} from '../services/api';
import React from "react";
import ConfirmationModal from "../components/confirmmodal";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: Date;
  profileImage: string | null;
  preferences: string[];
}

interface Article {
  _id: string;
  author: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  images: string; // Changed from string[] to string
  likes: number;
  dislikes: number;
  blockedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalLikes: 0,
    totalDislikes: 0,
    totalBlocks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    images: "",
  });
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 5;
  const [expandedDescriptions, setExpandedDescriptions] = useState<{[key: string]: boolean}>({});
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [userData, userArticles] = await Promise.all([
          getUserData(),
          getUserArticles()
        ]);
        
        setUser(userData);
        setArticles(userArticles);
        
        const initialExpandedState = userArticles.reduce((acc: {[key: string]: boolean}, article: { _id: string | number; }) => {
          acc[article._id] = false;
          return acc;
        }, {});
        setExpandedDescriptions(initialExpandedState);
        
        setStats({
          totalArticles: userArticles.length,
          totalLikes: userArticles.reduce((sum: any, article: { likes: any; }) => sum + article.likes, 0),
          totalDislikes: userArticles.reduce((sum: any, article: { dislikes: any; }) => sum + article.dislikes, 0),
          totalBlocks: userArticles.reduce((sum: any, article: { blockedBy: string | any[]; }) => sum + article.blockedBy.length, 0),
        });
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleDelete = (articleId: string) => {
    setArticleToDelete(articleId);
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return;
    
    try {
      setError(null);
      await deleteArticle(articleToDelete);
      
      const deletedArticle = articles.find(a => a._id === articleToDelete);
      if (deletedArticle) {
        setArticles(articles.filter(article => article._id !== articleToDelete));
        setStats({
          ...stats,
          totalArticles: stats.totalArticles - 1,
          totalLikes: stats.totalLikes - deletedArticle.likes,
          totalDislikes: stats.totalDislikes - deletedArticle.dislikes,
          totalBlocks: stats.totalBlocks - deletedArticle.blockedBy.length,
        });
      }
    } catch (err: any) {
      console.error("Error deleting article:", err);
      setError(err.message || "Failed to delete article. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setArticleToDelete(null);
    }
  };
  const handleEdit = (article: Article) => {
    setCurrentArticle(article);
    setFormData({
      title: article.title,
      description: article.description,
      category: article.category,
      tags: article.tags.join(", "),
      images: article.images,
    });
    setIsEditing(true);
    setUploadFiles([]);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type) || file.size > maxSize) {
      setError('Only JPG, PNG, or GIF images under 5MB are allowed');
      return;
    }

    setUploadFiles([file]);
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      images: previewUrl,
    }));
  };
    
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentArticle) return;
    
    try {
      setError(null);
      
      const formDataForUpdate = new FormData();
      
      // Append regular fields
      formDataForUpdate.append('title', formData.title);
      formDataForUpdate.append('description', formData.description);
      formDataForUpdate.append('category', formData.category);
      formDataForUpdate.append('tags', formData.tags.split(",").map(tag => tag.trim()).join(","));
      
      // Append new files
      if (uploadFiles.length > 0) {
        formDataForUpdate.append('image', uploadFiles[0]); // Only send the first image
      }
            
      // Make the request
      const updatedArticle = await updateArticle(currentArticle._id, formDataForUpdate);
      
      // Update state
      setArticles(articles.map(article => 
        article._id === currentArticle._id ? updatedArticle : article
      ));
      
      // Clean up and reset
      if (formData.images.startsWith('blob:')) {
        URL.revokeObjectURL(formData.images);
      }
      
      setIsEditing(false);
      setCurrentArticle(null);
      setUploadFiles([]);
      setFormData({
        title: "",
        description: "",
        category: "",
        tags: "",
        images: "",
      });
    } catch (err: any) {
      console.error("Error updating article:", err);
      setError(err.message || "Failed to update article. Please try again.");
    }
  };
  const toggleDescription = (articleId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));
  };

  const getTruncatedDescription = (description: string) => {
    return description.length > 100 ? description.substring(0, 100) + "..." : description;
  };
  
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(articles.length / articlesPerPage);
  
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Helper function to get proper image source
  const getImageSrc = (image: string) => {
    if (image.startsWith('blob:')) {
      return image; // For preview images
    }
   
    return `https://publish-read.duckdns.org/uploads/${image}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
<header className="bg-white shadow">
  <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center">
      {/* Left-aligned group (back button + heading) */}
      <div className="flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-800 hover:text-gray-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <h1 className="text-2xl font-bold ml-2">
          <span className="text-red-500">P</span>ublish
        </h1>
      </div>


<div className="flex items-center">
  <Link to="/settings" className="flex items-center">
    {user?.profileImage ? (
      <img 
        src={`https://publish-read.duckdns.org${user.profileImage}`} 
        alt="Profile" 
        className="h-10 w-10 rounded-full" 
      />
    ) : (
      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
        {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
      </div>
    )}
    <span className="ml-3 font-medium text-gray-900">
      {user?.firstName} {user?.lastName}
    </span>
  </Link>
</div>
    </div>
  </div>
</header>
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { icon: <Eye className="h-6 w-6 text-blue-600" />, value: stats.totalArticles, label: "Total Articles", bg: "bg-blue-100" },
              { icon: <ThumbsUp className="h-6 w-6 text-green-600" />, value: stats.totalLikes, label: "Total Likes", bg: "bg-green-100" },
              { icon: <ThumbsDown className="h-6 w-6 text-red-600" />, value: stats.totalDislikes, label: "Total Dislikes", bg: "bg-red-100" },
              { icon: <UserX className="h-6 w-6 text-gray-600" />, value: stats.totalBlocks, label: "Total Blocks", bg: "bg-gray-100" }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} p-3 rounded-full`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Your Articles</h2>
          
          {isEditing ? (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="text-lg font-semibold mb-4">Edit Article</h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['title', 'category'].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <input
                        type="text"
                        name={field}
                        value={formData[field as keyof typeof formData]}
                        onChange={handleFormChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    multiple
                    accept="image/*"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  
                  {formData.images.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[formData.images].map((image, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={getImageSrc(image)} 
                            alt="Preview" 
                            className="h-20 w-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                images: ""
                              }));
                            }}
                          >
                            <Trash className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setCurrentArticle(null);
                      setUploadFiles([]);
                      if (formData.images.startsWith('blob:')) {
URL.revokeObjectURL(formData.images);
                      }
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          ) : (
            articles.length > 0 ? (
              <div>
                <div className="space-y-4">
                  {currentArticles.map((article) => (
                    <div key={article._id} className="bg-white p-6 rounded-lg shadow">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-semibold">{article.title}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(article)}
                            className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(article._id)}
                            className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-gray-600">
                          {expandedDescriptions[article._id] 
                            ? article.description 
                            : getTruncatedDescription(article.description)}
                        </p>
                        {article.description.length > 100 && (
                          <button 
                            onClick={() => toggleDescription(article._id)}
                            className="text-blue-600 text-sm mt-1 hover:underline"
                          >
                            {expandedDescriptions[article._id] ? "Read Less" : "Read More"}
                          </button>
                        )}
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {article.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      {article.images.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {[article.images].flat().map((image, index) => (
                            <img 
                              key={index} 
                              src={getImageSrc(image)} 
                              alt={`Image for ${article.title}`} 
                              className="h-20 w-20 object-cover rounded"
                              onError={(e) => {
                                console.error("Failed to load image:", image);
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ))}
                        </div>
                      )}
                      <ConfirmationModal
  isOpen={isDeleteModalOpen}
  message="Are you sure you want to delete this article? This action cannot be undone."
  onConfirm={handleDeleteConfirm}
  onCancel={() => setIsDeleteModalOpen(false)}
/>
                      <div className="mt-4 flex justify-between text-sm text-gray-500">
                        <div className="flex space-x-4">
                          <div className="flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            <span>{article.likes}</span>
                          </div>
                          <div className="flex items-center">
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            <span>{article.dislikes}</span>
                          </div>
                          <div className="flex items-center">
                            <UserX className="h-4 w-4 mr-1" />
                            <span>{article.blockedBy.length}</span>
                          </div>
                        </div>
                        <div>
                          Last updated: {new Date(article.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center items-center space-x-2">
                    <button 
                      onClick={prevPage} 
                      disabled={currentPage === 1}
                      className={`p-2 rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      onClick={nextPage} 
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-500">You haven't created any articles yet.</p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}