import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store/store';
import { setUser } from './store/authSlice';
import * as authController from './services/authController';
import type { APITokenResponse } from './types';

import LoginPage from './components/auth/LoginPage';
import AdminPanelPage from './components/admin/AdminPanelPage';
import SharePage from './components/share/SharePage';
import Navbar from './components/ui/Navbar';
import ProtectedRoute from './components/ui/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

const AppContent: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.authStatus);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      setIsInitializing(true);
      try {
        const storedTokens: APITokenResponse | null = authController.getTokensFromStorage();
        if (storedTokens) {
          dispatch(setUser(storedTokens));
        } else {
          dispatch(setUser(null));
        }
      } catch (error) {
        console.error("Initialization error:", error);
        authController.clearTokensFromStorage(); 
        dispatch(setUser(null));
      } finally {
        setIsInitializing(false);
      }
    };
    initialize();
  }, [dispatch]);

  if (isInitializing) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <LoadingSpinner size="12" />
      </div>
    );
  }
  
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/share/:token" element={<SharePage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminPanelPage />} />
          </Route>
          
          <Route 
            path="/" 
            element={
              isAuthenticated ? <Navigate to="/admin" replace /> : <Navigate to="/login" replace />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
    </>
  );
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <AppContent />
      </div>
    </BrowserRouter>
  );
};

export default App;