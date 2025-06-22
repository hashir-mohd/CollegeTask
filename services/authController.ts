import { API_BASE_URL } from '../constants';
import type { APITokenResponse, ShareTokenResponse } from '../types';
import { apiCall } from './apiService';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const clearTokensFromStorage = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const storeTokens = (apiTokens: APITokenResponse): APITokenResponse => {
  localStorage.setItem(ACCESS_TOKEN_KEY, apiTokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, apiTokens.refreshToken);
  return apiTokens;
};

export const loginAndStoreTokens = async (username_param: string, password_param: string): Promise<APITokenResponse> => {
  const response = await apiCall(
    '/login',
    {
      method: 'POST',
      body: JSON.stringify({ username: username_param, password: password_param }),
    }
  );
  const apiTokens = await response.json() as APITokenResponse;
  return storeTokens(apiTokens);
};

export const refreshAndStoreTokens = async (currentRefreshToken: string): Promise<APITokenResponse> => {
  try {
    const response = await apiCall(
      '/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      }
    );
    const apiTokens = await response.json() as APITokenResponse;
    return storeTokens(apiTokens);
  } catch (error: any) {
    clearTokensFromStorage();
    if (error.message && (error.message.includes('401') || error.message.includes('403') || error.message.toLowerCase().includes('invalid token') || error.message.toLowerCase().includes('token has expired'))) {
        throw new Error("Your session has expired or is invalid. Please log in again.");
    }
    throw error;
  }
};

export const getTokensFromStorage = (): APITokenResponse | null => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (accessToken && refreshToken) {
    return {
      accessToken,
      refreshToken,
    };
  }
  return null;
};

const fetchShareTokenInternal = async (accessToken: string): Promise<string> => {
  const response = await apiCall(
    '/share',
    { method: 'POST' },
    accessToken
  );
  const data = await response.json() as ShareTokenResponse; 
  
  if (!data || typeof data.shareToken !== 'string' || data.shareToken.trim() === '') {
    throw new Error("Received an invalid or empty share token string from the server.");
  }
  return data.shareToken.trim();
};

const buildShareLinkInternal = (shareToken: string): string => {
  return `${window.location.origin}/share/${shareToken}`;
};

export const generateAndBuildShareLink = async (accessToken: string): Promise<string> => {
    if (!accessToken) {
        throw new Error('Access token is required to generate a share link.');
    }
    const actualShareTokenString = await fetchShareTokenInternal(accessToken); 
    return buildShareLinkInternal(actualShareTokenString);
};