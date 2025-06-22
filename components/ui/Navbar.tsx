import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { setUser } from '../../store/authSlice';
import * as authController from '../../services/authController';

const Navbar: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.authStatus);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    authController.clearTokensFromStorage();
    dispatch(setUser(null));
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-semibold hover:text-gray-300">
          Student Data Share
        </Link>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/admin" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Admin Panel</Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;