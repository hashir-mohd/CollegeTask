import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSharedData } from '../../services/apiService';
import type { Student } from '../../types';
import StudentTable from './StudentTable';
import LoadingSpinner from '../ui/LoadingSpinner';

const SharePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailFilter, setEmailFilter] = useState('');

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      setError(null);
      getSharedData(token)
        .then(data => {
          setStudents(data);
        })
        .catch(err => {
          console.error('Failed to fetch shared data:', err);
          setError(err.message || 'Failed to load data. The link may be invalid or expired.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setError('No share token provided in the URL.');
      setIsLoading(false);
    }
  }, [token]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Shared Student Data</h1>
      </header>
      
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <LoadingSpinner size="12" />
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!isLoading && !error && students.length > 0 && (
        <>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Filter by email..."
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="w-full max-w-md mx-auto block px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <StudentTable students={students} emailFilter={emailFilter} />
        </>
      )}
      
      {!isLoading && !error && students.length === 0 && (
         <p className="text-center text-gray-500 py-10 text-lg">No data found for this share link.</p>
      )}
    </div>
  );
};

export default SharePage;