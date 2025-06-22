import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { setUser } from '../../store/authSlice';
import * as authController from '../../services/authController';
import type { APITokenResponse } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  
  const dispatch: AppDispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.authStatus);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);
    setIsLoadingLocal(true);

    if (!username || !password) {
      setErrorLocal("Username and password are required.");
      setIsLoadingLocal(false);
      return;
    }
    try {
      const tokens: APITokenResponse = await authController.loginAndStoreTokens(username, password);
      dispatch(setUser(tokens));
    } catch (err: any) {
      setErrorLocal(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoadingLocal(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setErrorLocal(null); }}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              aria-describedby={errorLocal ? "login-error" : undefined}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrorLocal(null); }}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              aria-describedby={errorLocal ? "login-error" : undefined}
            />
          </div>
          {errorLocal && ( 
            <p id="login-error" className="text-sm text-red-600 text-center" role="alert">{errorLocal}</p>
          )}
          <div>
            <button
              type="submit"
              disabled={isLoadingLocal}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              aria-live="polite"
            >
              {isLoadingLocal ? <LoadingSpinner size="5" color="white" /> : 'Log In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;