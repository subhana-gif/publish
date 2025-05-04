import express, { Request, Response, NextFunction } from 'express';
import { createArticle, getFilteredArticles, likeArticle,dislikeArticle,blockArticle,removeLike,removeDislike, searchArticles } from '../controllers/articleController';
import verifyToken from '../middleware/auth';
import upload from '../middleware/uploads';

const router = express.Router();

router.post('/create', upload.array('images'),verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Type assertion to handle Multer request type
            const multerRequest = req as Request & { files: Express.Multer.File[] };
        await createArticle(multerRequest, res);
    } catch (error) {
        next(error);
    }
});

router.get('/articles', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getFilteredArticles(req, res);
    } catch (error) {
        next(error);
    }
});

router.post('/:id/like', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await likeArticle(req, res);
    } catch (error) {
        next(error);
    }
});

// Dislike an article
router.post('/:id/dislike', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await dislikeArticle(req, res);
    } catch (error) {
        next(error);
    }
});

// Block an article
router.post('/:id/block', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await blockArticle(req, res);
    } catch (error) {
        next(error);
    }
});

// Remove like from article
router.post('/:id/removelike', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await removeLike(req, res);
    } catch (error) {
        next(error);
    }
});

// Remove dislike from article
router.post('/:id/removedislike', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await removeDislike(req, res);
    } catch (error) {
        next(error);
    }
});

// In your backend routes (e.g., articles.ts)
router.get('/search', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await searchArticles(req, res);
    } catch (error) {
        next(error);
    }
});
  
export default router;
