import axios from 'axios';

const API_URL = 'http://localhost:5000/api';


const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data?.error || 'Something went wrong';
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(new Error('No response from server'));
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject(error);
    }
  }
);


export const getUserData = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const updatePersonalInfo = async (data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  profileImage?: File;
}) => {
  try {
    const formData = new FormData();
    
    // Append text fields if they exist
    if (data.firstName) formData.append('firstName', data.firstName);
    if (data.lastName) formData.append('lastName', data.lastName);
    if (data.email) formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.dob) formData.append('dob', data.dob);
    
    // Append image if it exists
    if (data.profileImage) {
      formData.append('profileImage', data.profileImage);
    }
    console.log('hit')
    const response = await api.patch('/settings/personal', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    console.log("response:",response)
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || error.response.data.error);
    } else {
      throw new Error(error.message || 'Failed to update profile');
    }
  }
};

// In your api.ts file
export const updatePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  try {
    const response = await api.patch('/settings/password', data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || error.response.data.error);
    } else {
      throw new Error(error.message || 'Failed to update password');
    }
  }
};
export const updatePreferences = async (data: {
  preferences: string[];
}) => {
  try{
  const response = await api.patch('/settings/preferences', data);
  return response.data;
  }catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || error.response.data.error);
    } else {
      throw new Error(error.message || 'Failed to update password');
    }
  }
};

export const login = async (loginData: { email?: string; phone?: string; password: string }) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, loginData);
    
    // Store the token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error during login:", error);
    return { success: false, error: 'Login failed' };
  }
};

export const register = async (userData: any) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error during registration:", error);
    return { success: false, error: 'Registration failed' };
  }
};

export const getArticles = async () => {
  try {
    const response = await axios.get(`${API_URL}/articles`);
    return response.data;
  } catch (error) {
    console.error("Error fetching articles", error);
    return [];
  }
};

export const createArticle = async (articleData: { title: string; content: string }) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/articles`, articleData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error creating article:", error);
    return { success: false, error: 'Failed to create article' };
  }
};

// services/authService.ts
export const registerUser = async (formData: FormData) => {
  const response = await axios.post(`${API_URL}/auth/register`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};


