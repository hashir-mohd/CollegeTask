import { API_BASE_URL } from '../constants';
import type { Student } from '../types';

export async function apiCall(
  endpoint: string,
  options: RequestInit,
  token?: string | null
): Promise<Response> {
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {})
  };

  if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    let errorText = await response.text();
    try {
      errorData = JSON.parse(errorText);
    } catch (e) {
      errorData = { message: `HTTP error ${response.status}: ${errorText || response.statusText}` };
    }
    console.error('API Error:', errorData);
    throw new Error(errorData?.message || errorData?.detail || `API request failed with status ${response.status}`);
  }

  return response;
}

export const getSharedData = async (shareToken: string): Promise<Student[]> => {
  if (!shareToken || shareToken.trim() === '') {
    throw new Error("Share token is required to fetch data.");
  }
  
  const response = await apiCall(
    `/share?shareToken=${encodeURIComponent(shareToken)}`,
    { method: 'GET' }
  );

  const data = await response.json();
  return data as Student[];
};