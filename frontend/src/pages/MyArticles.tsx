// pages/ArticleView.tsx - Page for viewing an article with like/dislike/block functionality
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useArticles } from '../context/ArticleContex';

const ArticleView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getArticleById, likeArticle, dislikeArticle, blockArticle } = useArticles();
  const navigate = useNavigate();
  
  const [article, setArticle] = useState<any>(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [hasBlocked, setHasBlocked] = useState(false);

  useEffect(() => {
    if (id) {
      const foundArticle = getArticleById(id);
      if (foundArticle) {
        setArticle(foundArticle);
      } else {
        navigate('/dashboard');
      }
    }
  }, [id, getArticleById, navigate]);

  const handleLike = () => {
    if (id && !hasLiked) {
      likeArticle(id);
      setHasLiked(true);
      setHasDisliked(false);
      const updatedArticle = getArticleById(id);
      if (updatedArticle) {
        setArticle(updatedArticle);
      }
    }
  };

  const handleDislike = () => {
    if (id && !hasDisliked) {
      dislikeArticle(id);
      setHasDisliked(true);
      setHasLiked(false);
      const updatedArticle = getArticleById(id);
      if (updatedArticle) {
        setArticle(updatedArticle);
      }
    }
  };

  const handleBlock = () => {
    if (id && !hasBlocked) {
      if (window.confirm('Are you sure you want to block this article? Blocked articles will not appear in your feed.')) {
        blockArticle(id);
        setHasBlocked(true);
        const updatedArticle = getArticleById(id);
        if (updatedArticle) {
          setArticle(updatedArticle);
        }
        navigate('/dashboard');
      }
    }
  };

  if (!article) {
    return <div>Loading...</div>;
  }

  const isAuthor = user && user.id === article.userId;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back
        </button>
      </div>
      
      <img 
        src={article.image} 
        alt={article.title} 
        className="w-full h-64 object-cover rounded-lg mb-6"
      />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
        
        <div className="flex items-center text-gray-600 mb-6">
          <span className="mr-4">By {article.author}</span>
          <span className="mr-4">Category: {article.category}</span>
          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
        </div>
        
        <div className="mb-4 flex flex-wrap gap-2">
          {article.tags.map((tag: string, index: number) => (
            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="prose max-w-none mb-6">
          <p className="text-gray-700 whitespace-pre-line">{article.description}</p>
        </div>
        
        {!isAuthor && (
          <div className="flex items-center space-x-4 border-t pt-4">
            <button
              onClick={handleLike}
              className={`flex items-center px-4 py-2 rounded ${
                hasLiked ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              disabled={hasLiked}
            >
              <span className="mr-2">👍</span>
              <span>{article.likes}</span>
            </button>
            
            <button
              onClick={handleDislike}
              className={`flex items-center px-4 py-2 rounded ${
                hasDisliked ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              disabled={hasDisliked}
            >
              <span className="mr-2">👎</span>
              <span>{article.dislikes}</span>
            </button>
            
            <button
              onClick={handleBlock}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded"
              disabled={hasBlocked}
            >
              Block Article
            </button>
          </div>
        )}
        
        {isAuthor && (
          <div className="flex items-center space-x-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">👍 {article.likes}</span>
              <span className="text-gray-600">👎 {article.dislikes}</span>
              <span className="text-gray-600">🚫 {article.blocks}</span>
            </div>
            
            <div className="ml-auto">
              <button
                onClick={() => navigate(`/article/edit/${article.id}`)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded mr-2"
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleView;

