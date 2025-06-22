import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { setUser } from '../../store/authSlice';
import * as authController from '../../services/authController';
import type { APITokenResponse } from '../../types'; 
import LoadingSpinner from '../ui/LoadingSpinner';
import CopyToClipboardButton from '../ui/CopyToClipboardButton';

const AdminPanelPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user); 

  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isGeneratingLinkLocal, setIsGeneratingLinkLocal] = useState(false);
  const [shareLinkErrorLocal, setShareLinkErrorLocal] = useState<string | null>(null);
  
  const handleGenerateLink = async (retryAttempt = false) => {
    setShareLinkErrorLocal(null);
    setShareLink(null); 
    setIsGeneratingLinkLocal(true);
    
    if (!user?.accessToken) {
        setShareLinkErrorLocal('Not authenticated. Please log in.');
        setIsGeneratingLinkLocal(false);
        if (!retryAttempt) dispatch(setUser(null));
        return;
    }

    try {
      const currentAccessToken = user.accessToken;
      const generatedLink = await authController.generateAndBuildShareLink(currentAccessToken);
      setShareLink(generatedLink);
    } catch (err: any) {
      const errorMessage = (err.message || 'Could not generate share link.').toLowerCase();
      if (!retryAttempt && (errorMessage.includes('401') || errorMessage.includes('expired') || errorMessage.includes('invalid token') || errorMessage.includes('unauthorized'))) {
        if (user?.refreshToken) {
          try {
            setShareLinkErrorLocal('Your session may have expired. Attempting to refresh...');
            const newTokens = await authController.refreshAndStoreTokens(user.refreshToken);
            dispatch(setUser(newTokens));
            setShareLinkErrorLocal('Session refreshed. Please try generating the link again.'); 
            await handleGenerateLink(true); 
            return;
          } catch (refreshErr: any) {
            setShareLinkErrorLocal(`Failed to refresh session: ${refreshErr.message}. Please log in again.`);
            dispatch(setUser(null));
          }
        } else {
          setShareLinkErrorLocal('Session expired and no refresh token found. Please log in again.');
          dispatch(setUser(null));
        }
      } else {
        setShareLinkErrorLocal(err.message || 'Could not generate share link.');
        if (retryAttempt && (errorMessage.includes('401') || errorMessage.includes('expired'))) {
           dispatch(setUser(null)); 
        }
      }
    } finally {
      setIsGeneratingLinkLocal(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Admin Panel</h2>
        
        <div className="space-y-4 sm:space-y-0 sm:flex sm:space-x-4 justify-center mb-8">
          <button
            onClick={() => handleGenerateLink(false)}
            disabled={isGeneratingLinkLocal || !user} 
            aria-busy={isGeneratingLinkLocal}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-150 ease-in-out disabled:bg-gray-400"
          >
            {isGeneratingLinkLocal ? (
              <span className="flex items-center justify-center">
                <LoadingSpinner size="5" color="white" />
                <span className="ml-2">Generating...</span>
              </span>
            ) : (
              'Generate Shareable Link'
            )}
          </button>
        </div>

        {shareLinkErrorLocal && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
            <strong className="font-bold">Link Generation Error: </strong> {shareLinkErrorLocal}
          </div>
        )}
        
        {shareLink && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Your Shareable Link:</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-3 rounded-md border border-gray-300 shadow-sm">
              <input 
                type="text" 
                value={shareLink} 
                readOnly 
                className="flex-grow p-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-gray-100 focus:outline-none w-full sm:w-auto"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <CopyToClipboardButton textToCopy={shareLink} />
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Anyone with this link can view the shared student data without needing to log in. This link is valid for 30 days according to backend policy.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanelPage;