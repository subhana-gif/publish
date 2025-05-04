// context/ArticleContext.tsx - Article context for managing article state
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Article {
  id: string;
  userId: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  category: string;
  createdAt: Date;
  likes: number;
  dislikes: number;
  blocks: number;
  author: string;
}

interface ArticleContextType {
  articles: Article[];
  userArticles: Article[];
  createArticle: (article: Omit<Article, 'id' | 'createdAt' | 'likes' | 'dislikes' | 'blocks'>) => void;
  updateArticle: (id: string, article: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
  likeArticle: (id: string) => void;
  dislikeArticle: (id: string) => void;
  blockArticle: (id: string) => void;
  getArticleById: (id: string) => Article | undefined;
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

export const ArticleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const { user } = useAuth();

  // Mock data for articles
  useEffect(() => {
    const mockArticles = [
      {
        id: '1',
        userId: '456',
        title: 'Understanding TypeScript',
        description: 'A deep dive into TypeScript and its features',
        image: 'https://via.placeholder.com/300',
        tags: ['Programming', 'TypeScript', 'JavaScript'],
        category: 'Technology',
        createdAt: new Date(),
        likes: 15,
        dislikes: 2,
        blocks: 0,
        author: 'Jane Doe'
      },
      {
        id: '2',
        userId: '789',
        title: 'The Future of AI',
        description: 'Exploring the possibilities and implications of artificial intelligence',
        image: 'https://via.placeholder.com/300',
        tags: ['AI', 'Future', 'Technology'],
        category: 'Science',
        createdAt: new Date(),
        likes: 28,
        dislikes: 3,
        blocks: 1,
        author: 'John Smith'
      },
      {
        id: '3',
        userId: '123',
        title: 'Healthy Eating Habits',
        description: 'Tips for maintaining a balanced diet',
        image: 'https://via.placeholder.com/300',
        tags: ['Health', 'Food', 'Lifestyle'],
        category: 'Health',
        createdAt: new Date(),
        likes: 42,
        dislikes: 5,
        blocks: 0,
        author: 'Test User'
      }
    ];
    
    setArticles(mockArticles);
  }, []);

  // Get articles created by the current user
  const userArticles = articles.filter(article => article.userId === user?.id);

  const createArticle = (article: Omit<Article, 'id' | 'createdAt' | 'likes' | 'dislikes' | 'blocks'>) => {
    const newArticle: Article = {
      ...article,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      likes: 0,
      dislikes: 0,
      blocks: 0
    };
    
    setArticles([...articles, newArticle]);
  };

  const updateArticle = (id: string, updatedArticle: Partial<Article>) => {
    setArticles(articles.map(article => 
      article.id === id ? { ...article, ...updatedArticle } : article
    ));
  };

  const deleteArticle = (id: string) => {
    setArticles(articles.filter(article => article.id !== id));
  };

  const likeArticle = (id: string) => {
    setArticles(articles.map(article => 
      article.id === id ? { ...article, likes: article.likes + 1 } : article
    ));
  };

  const dislikeArticle = (id: string) => {
    setArticles(articles.map(article => 
      article.id === id ? { ...article, dislikes: article.dislikes + 1 } : article
    ));
  };

  const blockArticle = (id: string) => {
    setArticles(articles.map(article => 
      article.id === id ? { ...article, blocks: article.blocks + 1 } : article
    ));
  };

  const getArticleById = (id: string) => {
    return articles.find(article => article.id === id);
  };

  return (
    <ArticleContext.Provider value={{ 
      articles, 
      userArticles,
      createArticle, 
      updateArticle, 
      deleteArticle, 
      likeArticle, 
      dislikeArticle, 
      blockArticle,
      getArticleById
    }}>
      {children}
    </ArticleContext.Provider>
  );
};

export const useArticles = () => {
  const context = useContext(ArticleContext);
  if (context === undefined) {
    throw new Error('useArticles must be used within an ArticleProvider');
  }
  return context;
};


