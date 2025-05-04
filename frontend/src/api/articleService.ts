import axios from 'axios';
import { Article } from '../types';

const API_URL = 'http://localhost:5000/api';

export const fetchArticle = async (id: string): Promise<Article> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/articles/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching article:", error);
    throw error;
  }
};

export const updateArticle = async (id: string, articleData: Partial<Article>) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/articles/${id}`, articleData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error updating article:", error);
    return { success: false, error: 'Failed to update article' };
  }
};