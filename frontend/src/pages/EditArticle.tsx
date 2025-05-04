import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Article } from '../types';
import { fetchArticle, updateArticle } from '../api/articleService';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
  Chip,
  Autocomplete,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardMedia,
  IconButton
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { categories } from '../constants';
import React from 'react';

const ArticleEditPage = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadArticle = async () => {
      try {
        if (articleId) {
          const fetchedArticle = await fetchArticle(articleId);
          if (fetchedArticle.author.id !== currentUser?.id) {
            navigate('/dashboard');
            return;
          }
          setArticle(fetchedArticle);
          formik.setValues({
            title: fetchedArticle.title,
            description: fetchedArticle.description,
            category: fetchedArticle.category,
            tags: fetchedArticle.tags.join(', '),
            images: fetchedArticle.images
          });
        }
      } catch (err) {
        setError('Failed to load article');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [articleId, currentUser, navigate]);

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required').max(100, 'Title is too long'),
    description: Yup.string().required('Description is required'),
    category: Yup.string().required('Category is required'),
    tags: Yup.string(),
    images: Yup.array().of(Yup.string().url('Invalid image URL'))
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      category: '',
      tags: '',
      images: [] as string[]
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (!articleId) return;
        
        const updatedArticle = {
          title: values.title,
          description: values.description,
          category: values.category,
          tags: values.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
          images: values.images
        };

        await updateArticle(articleId, updatedArticle);
        setSnackbarMessage('Article updated successfully');
        setSnackbarOpen(true);
        navigate('/articles');
      } catch (err) {
        setError('Failed to update article');
        console.error(err);
      }
    }
  });

  const handleAddImage = () => {
    formik.setFieldValue('images', [...formik.values.images, '']);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...formik.values.images];
    newImages.splice(index, 1);
    formik.setFieldValue('images', newImages);
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formik.values.images];
    newImages[index] = value;
    formik.setFieldValue('images', newImages);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!article) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>Article not found</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit Article
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="title"
              name="title"
              label="Title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              multiline
              rows={6}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                name="category"
                value={formik.values.category}
                label="Category"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.category && Boolean(formik.errors.category)}
              >
                {categories.map((category: string) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="tags"
              name="tags"
              label="Tags (comma separated)"
              value={formik.values.tags}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.tags && Boolean(formik.errors.tags)}
              helperText={formik.touched.tags && formik.errors.tags}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Images
            </Typography>
            <Button
              variant="outlined"
              onClick={handleAddImage}
              sx={{ mb: 2 }}
            >
              Add Image URL
            </Button>

            {formik.values.images.map((image, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={10}>
                    <TextField
                      fullWidth
                      label={`Image URL ${index + 1}`}
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      onBlur={formik.handleBlur}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
                {image && (
                  <Card sx={{ mt: 1, maxWidth: 300 }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={image}
                      alt={`Preview ${index + 1}`}
                    />
                  </Card>
                )}
              </Box>
            ))}
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                onClick={() => navigate('/articles')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!formik.isValid || formik.isSubmitting}
              >
                {formik.isSubmitting ? <CircularProgress size={24} /> : 'Update Article'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ArticleEditPage;