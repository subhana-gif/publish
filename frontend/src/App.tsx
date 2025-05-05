// src/App.tsx
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import  CreateArticle  from './pages/CreateArticle'
import Settings from './pages/Settings'
import ArticleList from './pages/ArticleList'
import PrivateRoute from './components/Protect'

const App: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Register" element={<Register />} />

<Route path="/dashboard" element={
  <PrivateRoute>
    <Dashboard />
  </PrivateRoute>
} />

<Route path="/createArticle" element={
  <PrivateRoute>
    <CreateArticle />
  </PrivateRoute>
} />

<Route path="/settings" element={
  <PrivateRoute>
    <Settings />
  </PrivateRoute>
} />

<Route path="/articlelist" element={
  <PrivateRoute>
    <ArticleList />
  </PrivateRoute>
} />
      </Routes>
    </div>
  )
}

export default App
