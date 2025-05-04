import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Share2, X, Calendar, Eye, ArrowRight, Tag } from 'lucide-react';
import React from 'react';
import ConfirmationModal from './confirmmodal';

interface ArticlesPageProps {
  searchQuery?: string;
}

interface Author {
  profileImage: string;
  role: string;
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

interface Article {
  _id: string;
  author: Author;
  title: string;
  description: string;
  category: string;
  tags: string[];
  images: string[];
  likes: number;
  dislikes: number;
  blockedBy: string[];
  createdAt?: string;
}

export default function ArticlesPage({ searchQuery }: ArticlesPageProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        let url = 'http://localhost:5000/api/articles/articles';
        if (searchQuery) {
          url = `http://localhost:5000/api/articles/search?query=${encodeURIComponent(searchQuery)}`;
        }
  
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        
        const data = await response.json();
        setArticles(data);
      } catch (err) {
        setError('Failed to fetch articles');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, [searchQuery]); // Add these dependencies
  const getInteractionStatus = (articleId: string) => {
    return localStorage.getItem(`article_${articleId}_interaction`);
  };

// Update the handleLike and handleDislike functions to work with any article
const handleLike = async (articleId: string, e?: React.MouseEvent) => {
  if (e) e.stopPropagation();
  
  const interactionKey = `article_${articleId}_interaction`;
  const previousInteraction = localStorage.getItem(interactionKey);
  
  try {
    const token = localStorage.getItem('token');
    
    // If previously disliked, remove the dislike first
    if (previousInteraction === 'dislike') {
      await fetch(`http://localhost:5000/api/articles/${articleId}/removedislike`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Toggle like state
    if (previousInteraction !== 'like') {
      // Add like
      await fetch(`http://localhost:5000/api/articles/${articleId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      localStorage.setItem(interactionKey, 'like');
      
      setArticles(articles.map(article => {
        if (article._id === articleId) {
          return {
            ...article,
            likes: article.likes + 1,
            dislikes: previousInteraction === 'dislike' ? article.dislikes - 1 : article.dislikes
          };
        }
        return article;
      }));
      
      // Update selected article if it's the one being liked
      if (selectedArticle?._id === articleId) {
        setSelectedArticle({
          ...selectedArticle,
          likes: selectedArticle.likes + 1,
          dislikes: previousInteraction === 'dislike' ? selectedArticle.dislikes - 1 : selectedArticle.dislikes
        });
      }
    } else {
      // Remove like
      await fetch(`http://localhost:5000/api/articles/${articleId}/removelike`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      localStorage.removeItem(interactionKey);
      
      setArticles(articles.map(article => 
        article._id === articleId 
          ? { ...article, likes: article.likes - 1 } 
          : article
      ));
      
      if (selectedArticle?._id === articleId) {
        setSelectedArticle({
          ...selectedArticle,
          likes: selectedArticle.likes - 1
        });
      }
    }
  } catch (err) {
    console.error('Failed to like article:', err);
  }
};

const handleDislike = async (articleId: string, e?: React.MouseEvent) => {
  if (e) e.stopPropagation();
  
  const interactionKey = `article_${articleId}_interaction`;
  const previousInteraction = localStorage.getItem(interactionKey);
  
  try {
    const token = localStorage.getItem('token');
    
    // If previously liked, remove the like first
    if (previousInteraction === 'like') {
      await fetch(`http://localhost:5000/api/articles/${articleId}/removelike`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Toggle dislike state
    if (previousInteraction !== 'dislike') {
      // Add dislike
      await fetch(`http://localhost:5000/api/articles/${articleId}/dislike`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      localStorage.setItem(interactionKey, 'dislike');
      
      setArticles(articles.map(article => {
        if (article._id === articleId) {
          return {
            ...article,
            dislikes: article.dislikes + 1,
            likes: previousInteraction === 'like' ? article.likes - 1 : article.likes
          };
        }
        return article;
      }));
      
      // Update selected article if it's the one being disliked
      if (selectedArticle?._id === articleId) {
        setSelectedArticle({
          ...selectedArticle,
          dislikes: selectedArticle.dislikes + 1,
          likes: previousInteraction === 'like' ? selectedArticle.likes - 1 : selectedArticle.likes
        });
      }
    } else {
      // Remove dislike
      await fetch(`http://localhost:5000/api/articles/${articleId}/removedislike`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      localStorage.removeItem(interactionKey);
      
      setArticles(articles.map(article => 
        article._id === articleId 
          ? { ...article, dislikes: article.dislikes - 1 } 
          : article
      ));
      
      if (selectedArticle?._id === articleId) {
        setSelectedArticle({
          ...selectedArticle,
          dislikes: selectedArticle.dislikes - 1
        });
      }
    }
  } catch (err) {
    console.error('Failed to dislike article:', err);
  }
};
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingBlockId, setPendingBlockId] = useState<string | null>(null);
  
  const handleBlock = (articleId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPendingBlockId(articleId);
    setShowConfirm(true);
  };
  
  const confirmBlock = async () => {
    if (!pendingBlockId) return;
    const token = localStorage.getItem('token');
  
    try {
      const response = await fetch(`http://localhost:5000/api/articles/${pendingBlockId}/block`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) throw new Error('Failed to block article');
  
      setArticles(articles.filter(article => article._id !== pendingBlockId));
      if (selectedArticle && selectedArticle._id === pendingBlockId) closeModal();
    } catch (err) {
      console.error('Failed to block article:', err);
    } finally {
      setShowConfirm(false);
      setPendingBlockId(null);
    }
  };
    const openArticleModal = (article: Article) => {
    setSelectedArticle(article);
    setShowModal(true);
    console.log(`Viewed article: ${article._id}`);
  };


  const closeModal = () => {
    setShowModal(false);
    setSelectedArticle(null);
  };
  
  const handleShareArticle = (articleId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Generate a shareable link
    const shareableLink = `http://yourdomain.com/articles/${articleId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        alert("Shareable link copied to clipboard!");
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };
  
  const filterByCategory = (category: string) => {
    setActiveCategory(category);
    console.log(`Filter by category: ${category}`);
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">{error}</p>
          <p className="text-sm mt-2">Please try refreshing the page or contact support if the issue persists.</p>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center py-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No articles found</h2>
          <p className="text-gray-600">Try adjusting your preferences or check back later for new content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="container mx-auto px-4 py-6">
        
      {articles.length > 0 && (
  <div 
    className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 cursor-pointer hover:shadow-md transition-shadow duration-300"
    onClick={() => openArticleModal(articles[0])}
  >
    <div className="md:flex">
      {/* Image Section */}
      <div className="md:flex-shrink-0 md:w-2/5 relative">
        {articles[0].images && articles[0].images.length > 0 ? (
          <img 
            src={`http://localhost:5000/uploads/${articles[0].images[0]}`} 
            alt={articles[0].title}
            className="h-56 w-full object-cover md:h-full"
          />
        ) : (
          <div className="h-56 md:h-full w-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/50 to-transparent w-full p-4">
          <span className="text-white text-sm font-medium">{articles[0].category}</span>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-6 md:w-3/5 flex flex-col">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <div className="flex items-center mr-4">
            <Calendar size={14} className="mr-1.5 text-gray-400" />
            <span className="text-xs">{formatDate(articles[0].createdAt)}</span>
          </div>
          {articles[0].tags?.length > 0 && (
            <div className="flex items-center">
              <Tag size={14} className="mr-1.5 text-gray-400" />
              <span className="text-xs">{articles[0].tags[0]}</span>
            </div>
          )}
        </div>
        
        <h2 className="font-bold text-xl mb-3 text-gray-900 hover:text-blue-600 transition-colors">
          {articles[0].title}
        </h2>
        
        <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
          {articles[0].description.length > 150 
            ? `${articles[0].description.substring(0, 150)}...`
            : articles[0].description}
        </p>
        
        <button 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 self-start flex items-center transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            openArticleModal(articles[0]);
          }}
        >
          Read more
          <ArrowRight size={14} className="ml-1" />
        </button>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
            {articles[0].author?.profileImage ? (
    <img 
      src={articles[0].author.profileImage} 
      alt="Author" 
      className="h-8 w-8 rounded-full mr-3 object-cover" 
    />
  ) : (
    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-3 text-sm font-semibold text-white">
      {articles[0].author?.firstName?.[0]?.toUpperCase() || 'U'}
    </div>
  )}              <div>
                <p className="text-sm font-medium text-gray-900">
                  {articles[0].author?.firstName || 'Unknown'} {articles[0].author?.lastName || 'Author'}
                </p>
                <p className="text-xs text-gray-500">
                  {articles[0].author?.role || 'Writer'}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(articles[0]._id, e);
                }}
                className={`flex items-center ${getInteractionStatus(articles[0]._id) === 'like' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'} transition-colors`}
              >
                <ThumbsUp size={16} className="mr-1.5" />
                <span className="text-xs font-medium">{articles[0].likes}</span>
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDislike(articles[0]._id, e);
                }}
                className={`flex items-center ${getInteractionStatus(articles[0]._id) === 'dislike' ? 'text-red-500' : 'text-gray-500 hover:text-red-500'} transition-colors`}
              >
                <ThumbsDown size={16} className="mr-1.5" />
                <span className="text-xs font-medium">{articles[0].dislikes}</span>
              </button>              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleShareArticle(articles[0]._id, e);
                }}
                className="text-gray-500 hover:text-blue-600 transition-colors"
                title="Share article"
              >
                <Share2 size={16} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleBlock(articles[0]._id, e);
                }}
                className="text-gray-500 hover:text-red-500 transition-colors"
                title="Hide this article"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
        
        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {articles.slice(1).map((article) => (
            <div 
              key={article._id} 
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
              onClick={() => openArticleModal(article)}
            >
              {article.images && article.images.length > 0 ? (
                <div className="h-40 overflow-hidden">
                  <img 
                    src={`http://localhost:5000/uploads/${article.images[0]}`} 
                    alt={article.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="h-40 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">No image</span>
                </div>
              )}
              
              <div className="p-3">
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {article.category}
                  </span>
                  <span className="mx-1 text-xs">•</span>
                  <span className="text-xs">{formatDate(article.createdAt)}</span>
                </div>
                
                <h2 className="text-base font-semibold mb-1 line-clamp-2 text-gray-900 hover:text-blue-600 transition-colors">
                  {article.title}
                </h2>
                
                <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                  {article.description}
                </p>
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div className="flex space-x-3">
  <button 
    onClick={(e) => handleLike(article._id, e)}
    className={`flex items-center ${
      getInteractionStatus(article._id) === 'like' 
        ? 'text-blue-600' 
        : 'text-gray-500 hover:text-blue-600'
    } transition-colors`}
  >
    <ThumbsUp size={14} className="mr-1" />
    <span className="text-xs">{article.likes}</span>
  </button>
  
  <button 
    onClick={(e) => handleDislike(article._id, e)}
    className={`flex items-center ${
      getInteractionStatus(article._id) === 'dislike' 
        ? 'text-red-500' 
        : 'text-gray-500 hover:text-red-500'
    } transition-colors`}
  >
    <ThumbsDown size={14} className="mr-1" />
    <span className="text-xs">{article.dislikes}</span>
  </button>
</div>                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={(e) => handleShareArticle(article._id, e)}
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                      title="Copy shareable link"
                    >
                      <Share2 size={14} />
                    </button>
                    
                    <button 
                      onClick={(e) => handleBlock(article._id, e)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                      title="Hide this article"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmationModal
  isOpen={showConfirm}
  message="Are you sure you want to block this article? You won't see it again."
  onConfirm={confirmBlock}
  onCancel={() => setShowConfirm(false)}
/>
      
      {/* Article Modal */}
      {showModal && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-screen overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-3 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900 truncate pr-4">{selectedArticle.title}</h2>
              <button 
                onClick={closeModal} 
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-grow">
              {selectedArticle.images && selectedArticle.images.length > 0 && (
                <img 
                  src={`http://localhost:5000/uploads/${selectedArticle.images[0]}`} 
                  alt={selectedArticle.title}
                  className="w-full h-64 object-cover"
                />
              )}
              
              <div className="p-4">
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {selectedArticle.category}
                  </span>
                  <span className="mx-2">•</span>
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    <span>{formatDate(selectedArticle.createdAt)}</span>
                  </div>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{selectedArticle.title}</h1>
                
                <div className="flex items-center mb-4 pb-3 border-b border-gray-200">
                {articles[0].author?.profileImage ? (
    <img 
      src={articles[0].author.profileImage} 
      alt="Author" 
      className="h-8 w-8 rounded-full mr-3 object-cover" 
    />
  ) : (
    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-3 text-sm font-semibold text-white">
      {articles[0].author?.firstName?.[0]?.toUpperCase() || 'U'}
    </div>
  )}                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedArticle.author?.firstName || 'Unknown'} {selectedArticle.author?.lastName || 'Author'}
                    </p>
                    {selectedArticle.author?.role && (
                      <p className="text-xs text-gray-500">{selectedArticle.author.role}</p>
                    )}
                  </div>
                </div>                
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                    {selectedArticle.description}
                  </p>
                                  </div>
                
                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs hover:bg-gray-200 cursor-pointer transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Engagement section */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center justify-between">
                <div className="flex gap-3">
  <button 
    onClick={() => handleLike(selectedArticle._id)}
    className={`flex items-center justify-center border rounded-md px-3 py-1 transition-colors ${
      getInteractionStatus(selectedArticle._id) === 'like'
        ? 'bg-blue-50 border-blue-200 text-blue-600'
        : 'bg-white border-gray-200 text-gray-500 hover:bg-blue-50 hover:border-blue-200'
    }`}
  >
    <ThumbsUp size={16} className="mr-2" />
    <span>{selectedArticle.likes}</span>
  </button>
  
  <button 
    onClick={() => handleDislike(selectedArticle._id)}
    className={`flex items-center justify-center border rounded-md px-3 py-1 transition-colors ${
      getInteractionStatus(selectedArticle._id) === 'dislike'
        ? 'bg-red-50 border-red-200 text-red-500'
        : 'bg-white border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-200'
    }`}
  >
    <ThumbsDown size={16} className="mr-2" />
    <span>{selectedArticle.dislikes}</span>
  </button>
</div>                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleShareArticle(selectedArticle._id)}
                      className="flex items-center justify-center bg-white border border-gray-200 rounded-md px-3 py-1 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                      title="Copy shareable link"
                    >
                      <Share2 size={16} className="mr-2 text-blue-600" />
                      <span>Share</span>
                    </button>
                    
                    <button 
                      onClick={() => handleBlock(selectedArticle._id)}
                      className="flex items-center text-gray-500 hover:text-red-500"
                    >
                      <X size={16} className="mr-1" />
                      <span>Block</span>
                    </button>
                  </div>
                </div>
                  </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}