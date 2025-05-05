// src/App.tsx
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import  CreateArticle  from './pages/CreateArticle'
import Settings from './pages/Settings'
import ArticleList from './pages/ArticleList'

const App: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/createArticle" element={<CreateArticle />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/articlelist" element={<ArticleList />} />
      </Routes>
    </div>
  )
}

export default App
