import React, { useState } from 'react';
import { Plus, Settings, LogOut, Search, FileText } from 'lucide-react';
import ArticlesPage from '../components/ArticleCard';

const Dashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Simple navigation function that works in browser environments
  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  const handleCreateArticle = () => {
    navigateTo('/createArticle');
  };

  const handleManageArticles = () => {
    navigateTo('/articlelist');
  };

  const handleSettings = () => {
    navigateTo('/settings');
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logging out...');
    // After logout, redirect to login page
    navigateTo('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };


  // Sample categories for the secondary navigation

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Primary Navigation */}
      <header className="bg-black text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold">
              <span className="text-red-500">P</span>ublish
            </h1>
            <nav className="hidden md:flex">
            </nav>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCreateArticle}
              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              title="Create New Article"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={handleManageArticles}
              className="bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 transition-colors"
              title="Manage My Articles"
            >
              <FileText size={20} />
            </button>
            <button
              onClick={handleSettings}
              className="bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 transition-colors"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Logo section */}
      <div className="bg-white py-8 border-b border-gray-200">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold">
            <span className="text-red-500">P</span>ublish
          </h1>
          <p className="text-gray-500 mt-2">Your publishing platform</p>
        </div>
      </div>

      {/* Search section */}
      <div className="container mx-auto py-6">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-red-500 focus:border-red-500"
                placeholder="Search articles..."
              />
            </div>
            <button
              type="submit"
              className="ml-3 inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <ArticlesPage searchQuery={searchQuery} />
    </div>  );
};

export default Dashboard;