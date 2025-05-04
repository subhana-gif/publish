// main.tsx or index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './style.css'
import { AuthProvider } from './context/AuthContext';
import { ArticleProvider } from './context/ArticleContex';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> {/* ✅ MUST wrap all routing logic */}
      <AuthProvider>
        <ArticleProvider>
          <App />
        </ArticleProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
