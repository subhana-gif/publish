import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isEmail, setIsEmail] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!identifier) {
      setError(isEmail ? 'Email is required' : 'Phone number is required');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    
    if (isEmail && !identifier.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const loginData = isEmail 
        ? { email: identifier, password } 
        : { phone: identifier, password };
        
      const response = await login(loginData);
      if (response.success) {
        navigate('/dashboard');
      } else {
        setError(response.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleIdentifierType = () => {
    setIsEmail(!isEmail);
    setIdentifier('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border-2 border-red-600">
        <h2 className="text-3xl font-bold mb-6 text-black text-center">Sign In</h2>
        
        <div className="flex mb-6">
          <button
            className={`flex-1 p-2 text-center font-medium ${isEmail ? 'bg-red-600 text-white' : 'bg-gray-200 text-black'}`}
            onClick={() => isEmail ? null : toggleIdentifierType()}
          >
            Email
          </button>
          <button
            className={`flex-1 p-2 text-center font-medium ${!isEmail ? 'bg-red-600 text-white' : 'bg-gray-200 text-black'}`}
            onClick={() => isEmail ? toggleIdentifierType() : null}
          >
            Phone
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded border border-red-200">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            {isEmail ? 'Email Address' : 'Phone Number'}
          </label>
          <input
            type={isEmail ? "email" : "tel"}
            placeholder={isEmail ? "name@example.com" : "1234567890"}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>
        
        <button 
          onClick={handleLogin} 
          disabled={loading}
          className="w-full p-3 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition duration-200 flex justify-center"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        
        <div className="mt-4 text-center">
          <a href="/forgot-password" className="text-red-600 hover:text-red-800">
            Forgot password?
          </a>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-red-600 font-medium hover:text-red-800">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;