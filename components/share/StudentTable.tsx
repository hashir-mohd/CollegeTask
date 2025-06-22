import React from 'react';
import type { Student } from '../../types';

interface StudentTableProps {
  students: Student[];
  emailFilter: string;
}

const StudentTable: React.FC<StudentTableProps> = ({ students, emailFilter }) => {
  const filteredStudents = students.filter(student =>
    student.email.toLowerCase().includes(emailFilter.toLowerCase()) 
  );

  if (students.length === 0) {
    return <p className="text-center text-gray-500 py-4">No student data available.</p>;
  }
  
  if (filteredStudents.length === 0 && emailFilter) {
     return <p className="text-center text-gray-500 py-4">No students match your filter criteria.</p>;
  }

  return (
    <div className="overflow-x-auto shadow-lg rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Roll No
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              First Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredStudents.map((student, index) => (
            <tr key={student.roll_no || index} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.roll_no}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.first_name}</td> 
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.last_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;