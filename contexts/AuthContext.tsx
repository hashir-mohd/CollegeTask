import React, { createContext, useState, useEffect, useCallback, ReactNode, useContext, useRef } from 'react';
import { API_BASE_URL, TOKEN_REFRESH_THRESHOLD } from '../constants';
import type { LoginResponse, DecodedToken, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
  const [accessTokenExpiresAt, setAccessTokenExpiresAt] = useState<number | null>(Number(localStorage.getItem('accessTokenExpiresAt')));
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshTimeoutIdRef = useRef<number | null>(null);

  const parseJwt = <T,>(token: string): T | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload) as T;
    } catch (error) {
      console.error('Failed to parse JWT:', error);
      return null;
    }
  };

  // Forward declarations for mutually recursive functions
  let scheduleTokenRefreshFn: (expiresAt: number) => void;
  let setAuthSessionFn: (access: string, refresh: string) => void;
  let handleRefreshTokenFn: () => Promise<string | null>;

  const clearAuthData = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    setAccessTokenExpiresAt(null);
    setUserId(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessTokenExpiresAt');
    localStorage.removeItem('userId');
    if (refreshTimeoutIdRef.current) {
      clearTimeout(refreshTimeoutIdRef.current);
      refreshTimeoutIdRef.current = null;
    }
    setAuthError(null);
  }, []); // Dependencies are state setters (stable) and useRef (stable)

  scheduleTokenRefreshFn = useCallback((expiresAt: number) => {
    if (refreshTimeoutIdRef.current) {
      clearTimeout(refreshTimeoutIdRef.current);
    }
    const timeoutDuration = expiresAt - Date.now() - TOKEN_REFRESH_THRESHOLD;
    if (timeoutDuration > 0) {
      refreshTimeoutIdRef.current = setTimeout(() => handleRefreshTokenFn(), timeoutDuration) as unknown as number;
    }
  }, []); // This will be updated below once handleRefreshTokenFn is defined by its own useCallback

  setAuthSessionFn = useCallback((access: string, refresh: string) => {
    const decodedToken = parseJwt<DecodedToken>(access);
    if (decodedToken && decodedToken.exp) {
      const expiresAt = decodedToken.exp * 1000;
      setAccessToken(access);
      setRefreshToken(refresh);
      setAccessTokenExpiresAt(expiresAt);
      setUserId(decodedToken.user_id);

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('accessTokenExpiresAt', expiresAt.toString());
      localStorage.setItem('userId', decodedToken.user_id);
      
      scheduleTokenRefreshFn(expiresAt);
      setAuthError(null);
    } else {
      console.error("Invalid access token received or exp claim missing.");
      clearAuthData(); 
      setAuthError("Failed to process login token.");
    }
  }, [clearAuthData]); // scheduleTokenRefreshFn will be added as dep after its definition

  handleRefreshTokenFn = useCallback(async () => {
    const currentRefreshToken = localStorage.getItem('refreshToken'); 
    if (!currentRefreshToken) {
      clearAuthData();
      setIsLoadingAuth(false);
      return null;
    }

    setIsLoadingAuth(true);
    try {
      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      if (!response.ok) {
        if (response.status === 401) { 
          setAuthError("Session expired. Please log in again.");
        } else {
          setAuthError(`Failed to refresh session (HTTP ${response.status}). Please try logging in again.`);
        }
        throw new Error('Failed to refresh token');
      }
      
      const data = await response.json() as LoginResponse;
      setAuthSessionFn(data.accessToken, data.refreshToken); 
      setIsLoadingAuth(false);
      return data.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      clearAuthData();
      setIsLoadingAuth(false);
      // setAuthError might be set by clearAuthData or above, ensure it's appropriate
      if (!authError && !(error instanceof Error && error.message.includes('Session expired'))) {
         setAuthError("Failed to refresh session. Please log in again.");
      }
      return null;
    }
  }, [clearAuthData, authError]); // setAuthSessionFn will be added as dep after its definition

  // Re-assign useCallback definitions with full dependencies now that all functions are declared
  // This breaks the immediate circular dependency for useCallback definition
  const stableHandleRefreshToken = useCallback(handleRefreshTokenFn, [clearAuthData, setAuthSessionFn, authError]);
  const stableScheduleTokenRefresh = useCallback(scheduleTokenRefreshFn, [stableHandleRefreshToken]);
  const stableSetAuthSession = useCallback(setAuthSessionFn, [clearAuthData, stableScheduleTokenRefresh]);


  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedExpiresAt = localStorage.getItem('accessTokenExpiresAt');
    const storedUserId = localStorage.getItem('userId');

    if (storedAccessToken && storedRefreshToken && storedExpiresAt && storedUserId) {
      const expiresAtNum = Number(storedExpiresAt);
      if (expiresAtNum > Date.now()) {
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        setAccessTokenExpiresAt(expiresAtNum);
        setUserId(storedUserId);
        stableScheduleTokenRefresh(expiresAtNum);
      } else {
        stableHandleRefreshToken().catch(err => console.error("Initial refresh failed:", err));
      }
    }
    setIsLoadingAuth(false);
    
    return () => {
      if (refreshTimeoutIdRef.current) {
        clearTimeout(refreshTimeoutIdRef.current);
      }
    };
  }, [stableHandleRefreshToken, stableScheduleTokenRefresh]);


  const login = async (username_param: string, password_param: string) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username_param, password: password_param }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Login failed." }));
        setAuthError(errorData.message || `Login failed (HTTP ${response.status})`);
        throw new Error(errorData.message || 'Login failed');
      }
      const data = await response.json() as LoginResponse;
      stableSetAuthSession(data.accessToken, data.refreshToken);
    } catch (error) {
      console.error('Login error:', error);
      // clearAuthData(); // Might clear a useful authError from above
      if (!authError) setAuthError("An unexpected error occurred during login.");
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = useCallback(() => {
    clearAuthData();
  }, [clearAuthData]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const currentToken = localStorage.getItem('accessToken');
    const currentExpiresAt = Number(localStorage.getItem('accessTokenExpiresAt'));

    if (currentToken && currentExpiresAt && currentExpiresAt > Date.now() + TOKEN_REFRESH_THRESHOLD / 2) { 
      return currentToken;
    }
    return stableHandleRefreshToken();
  }, [stableHandleRefreshToken]);
  

  return (
    <AuthContext.Provider value={{ 
        isAuthenticated: !!accessToken, 
        isLoadingAuth, 
        userId, 
        login, 
        logout, 
        getAccessToken, 
        authError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};