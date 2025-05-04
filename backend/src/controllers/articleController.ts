import { Request, Response } from 'express';
import Article from '../models/article';
import User from '../models/user';
import { Multer } from 'multer';
import path from 'path';
import { Types } from 'mongoose';  // Add this import at the top

interface MulterRequest extends Request {
  files?: Express.Multer.File[];
}


export const createArticle = async (req: MulterRequest, res: Response) => {
  const { title, description, category, tags } = req.body;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const imagePaths = req.files ? req.files.map(file => path.basename(file.path)) : [];

  try {
    const newArticle = new Article({
      author: req.user.id,
      title,
      description,
      category,
      tags: typeof tags === 'string' ? JSON.parse(tags) : tags,
      images: imagePaths,
    });

    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getFilteredArticles = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const preferences = user.preferences || [];

    const articlesWithAuthors = await Article.find({
      blockedBy: { $ne: userId },
      category: { $in: preferences }
    }).sort({ createdAt: -1 }) 
    .populate({
      path: 'author',
      model: 'User', 
      select: 'firstName lastName profileImage  ',
      options: { strictPopulate: false } 
    })
    .lean();

    res.json(articlesWithAuthors);
  } catch (error) {
    console.error("Failed to fetch filtered articles", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const likeArticle = async (req:Request, res:Response) => {
  try {
    const articleId = req.params.id;
    const userId = req.user?.id;
    
    // Check if article exists and is not blocked by user
    const article = await Article.findOne({
      _id: articleId,
      blockedBy: { $ne: userId }
    });
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found or blocked' });
    }
    
    // Update like count
    article.likes += 1;
    await article.save();
    
    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Dislike an article
export const dislikeArticle = async (req:Request, res:Response) => {
  try {
    const articleId = req.params.id;
    const userId = req.user?.id;
    
    // Check if article exists and is not blocked by user
    const article = await Article.findOne({
      _id: articleId,
      blockedBy: { $ne: userId }
    });
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found or blocked' });
    }
    
    // Update dislike count
    article.dislikes += 1;
    await article.save();
    
    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Block an article (hide it from user's feed)
export const blockArticle = async (req: Request, res: Response) => {
  try {
    const articleId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if article exists
    const article = await Article.findById(articleId);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // Convert userId to ObjectId and check if it's already in blockedBy array
    const userObjectId = new Types.ObjectId(userId);
    if (!article.blockedBy.includes(userObjectId)) {
      article.blockedBy.push(userObjectId);
      await article.save();
    }
    
    res.json({ message: 'Article blocked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Remove like from article
export const removeLike = async (req:Request, res:Response) => {
  try {
    const articleId = req.params.id;
    const userId = req.user?.id;
    
    const article = await Article.findOne({
      _id: articleId,
      blockedBy: { $ne: userId }
    });
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found or blocked' });
    }
    
    article.likes = Math.max(0, article.likes - 1);
    await article.save();
    
    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Remove dislike from article
export const removeDislike = async (req:Request, res:Response) => {
  try {
    const articleId = req.params.id;
    const userId = req.user?.id;
    
    const article = await Article.findOne({
      _id: articleId,
      blockedBy: { $ne: userId }
    });
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found or blocked' });
    }
    
    article.dislikes = Math.max(0, article.dislikes - 1);
    await article.save();
    
    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const searchArticles = async (req: Request, res: Response) => {
  try {
      const { query } = req.query;
      
      if (!query) {
          return res.status(400).json({ message: 'Search query is required' });
      }

      const searchQuery = {
          $or: [
              { title: { $regex: query as string, $options: 'i' } },
              { tags: { $regex: query as string, $options: 'i' } }
          ]
      };

      const articles = await Article.find(searchQuery)
          .populate('author', 'firstName lastName profileImage role')
          .sort({ createdAt: -1 });

      res.json(articles);
  } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ message: 'Server error during search' });
  }
};