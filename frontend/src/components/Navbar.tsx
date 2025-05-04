// components/Navbar.tsx - Navigation bar component
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="text-xl font-bold">ArticleHub</Link>
        
        {isAuthenticated ? (
          <div className="flex space-x-4">
            <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
            <Link to="/article/create" className="hover:text-blue-200">Create Article</Link>
            <Link to="/article/list" className="hover:text-blue-200">My Articles</Link>
            <Link to="/settings" className="hover:text-blue-200">Settings</Link>
            <button onClick={handleLogout} className="hover:text-blue-200">Logout</button>
          </div>
        ) : (
          <div className="flex space-x-4">
            <Link to="/login" className="hover:text-blue-200">Login</Link>
            <Link to="/signup" className="hover:text-blue-200">Signup</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

