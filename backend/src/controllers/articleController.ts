import { Request, Response } from 'express';
import Article from '../models/article';
import User from '../models/user';
import path from 'path';
import { Types } from 'mongoose';  // Add this import at the top
const fs = require('fs').promises;

interface MulterRequest extends Request {
  files?: Express.Multer.File[];
}

interface UpdateArticleBody {
  title: string;
  description: string;
  category: string;
  tags: string | string[];
}

export const createArticle = async (req: MulterRequest, res: Response) => {
  const { title, description, category, tags } = req.body;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const imagePath = req.file ? path.basename(req.file.path) : '';

  try {
    const newArticle = new Article({
      author: req.user.id,
      title,
      description,
      category,
      tags: typeof tags === 'string' ? JSON.parse(tags) : tags,
      images: imagePath,  // Now just a single image path
    });

    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getUserArticles = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const articles = await Article.find({ author: req.user.id })
      .sort({ createdAt: -1 });
    res.json(articles);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateArticle = async (req: MulterRequest, res: Response) => {
  try {
    const { title, description, category, tags }: UpdateArticleBody = req.body;
    const articleId = req.params.id;

    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.id;

    // Find and verify article
    let article = await Article.findOne({ _id: articleId, author: userId });
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Process tags
    const tagsArray = Array.isArray(tags) ? tags : tags.split(',').map((tag: string) => tag.trim());

    // Handle image (store new image if uploaded, otherwise keep the old one)
    let image = article.images; // Default to existing image if no new one is uploaded

    if (req.file) {
      // If a new image is uploaded, use the new image path
      image = path.basename(req.file.path);
    }

    // Update article fields only if new data is provided
    article.title = title ?? article.title;
    article.description = description ?? article.description;
    article.category = category ?? article.category;
    article.tags = tagsArray.length > 0 ? tagsArray : article.tags;
    article.images = image; // Store the image path (single image)

    await article.save();
    res.json(article);
  } catch (error: any) {
    console.error('Error updating article:', error); // Log error for debugging
    res.status(400).json({ error: error.message });
  }
};

// Delete an article
export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const article = await Article.findOneAndDelete({
      _id: req.params.id,
      author: req.user?.id
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Delete associated images from storage
    // Import and use fs/promises to handle file deletions
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    
    if (article.images) {
      try {
        const imageName = path.basename(article.images);
        await fs.unlink(path.join(uploadDir, imageName))
          .catch((err: any) => console.error(`Failed to delete image ${imageName}:`, err));
      } catch (err) {
        console.error('Error deleting article image:', err);
      }
    }

    res.json({ message: 'Article deleted successfully' });
  } catch (error:any) {
    res.status(500).json({ error: error.message });
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

export const uploadImages = async (req: Request, res: Response) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files were uploaded' });
    }

    const files = req.files as Express.Multer.File[];
    const imageUrls = files.map(file => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`
    }));

    res.status(200).json({ 
      success: true,
      imageUrls: imageUrls.map(img => img.path) 
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ message: 'Server error during image upload' });
  }
};


