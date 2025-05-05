import express, { Request, Response, NextFunction } from 'express';
import { createArticle, getFilteredArticles, likeArticle,dislikeArticle,
    getUserArticles,updateArticle,deleteArticle, blockArticle,uploadImages,removeLike,removeDislike, searchArticles } from '../controllers/articleController';
import verifyToken from '../middleware/auth';
import upload from '../middleware/uploads';

const router = express.Router();

router.post('/create', upload.single('image'),verifyToken, async (req: Request, res: Response, next: NextFunction) => {
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

router.get('/user', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getUserArticles(req, res);
    } catch (error) {
        next(error);
    }
});

// Update an article
router.put('/:id/update', verifyToken, upload.single('image'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Type assertion to handle Multer request type
        const multerRequest = req as Request & { files: Express.Multer.File[] };
        await updateArticle(multerRequest, res);
    } catch (error) {
        next(error);
    }
});

// Delete an article
router.delete('/:id/delete', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await deleteArticle(req, res);
    } catch (error) {
        next(error);
    }
});
  
export default router;
