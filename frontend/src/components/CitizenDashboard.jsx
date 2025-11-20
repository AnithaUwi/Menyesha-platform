import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { logout, getCurrentUser } from '../utils/auth';

const CitizenDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [complaintStats, setComplaintStats] = useState({
    total: 0,
    submitted: 0,
    inProgress: 0,
    solved: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentUser, setCurrentUser] = useState(null);

   const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };
useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);
  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No authentication token found');
          return;
        }

        // Fetch citizen dashboard data
        const response = await axios.get('http://localhost:5000/api/dashboard/citizen', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setUserData(response.data.user);
          setComplaintStats(response.data.stats);
          setRecentComplaints(response.data.recentComplaints || []);
        } else {
          setError('Failed to load dashboard data');
        }

      } catch (error) {
        console.error('Dashboard error:', error);
        setError('Failed to load dashboard. Please try again.');
        
        // Fallback: Use stored user data if API fails
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUserData(JSON.parse(storedUser));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': 
      case 'solved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted': return 'Submitted';
      case 'in_progress': return 'In Progress';
      case 'resolved':
      case 'solved': return 'Resolved';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  const goToHome = () => {
    window.location.href = '/';
  };

  const goToComplaintForm = () => {
    window.location.href = '/#complaint';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-menyesha-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={goToHome}
            className="bg-menyesha-blue text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={goToHome}
                className="text-menyesha-blue hover:underline flex items-center mr-6"
              >
                ← Back to Home
              </button>



              <h1 className="text-2xl font-bold text-gray-900">Menyesha Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {userData?.fullName || 'User'}</span>
              <div className="w-8 h-8 bg-menyesha-blue rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {(userData?.fullName || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
  <button 
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>

          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
              {error} Showing limited data.
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-menyesha-blue rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Complaints</dt>
                      <dd className="text-lg font-semibold text-gray-900">{complaintStats.total}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Submitted</dt>
                      <dd className="text-lg font-semibold text-gray-900">{complaintStats.submitted}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                      <dd className="text-lg font-semibold text-gray-900">{complaintStats.inProgress}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Resolved</dt>
                      <dd className="text-lg font-semibold text-gray-900">{complaintStats.resolved || complaintStats.solved}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-8 flex space-x-4">
            <button
              onClick={goToComplaintForm}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-menyesha-gold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Submit New Complaint
            </button>
            
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-menyesha-blue">
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Edit Profile
            </button>
          </div>

          {/* Recent Complaints */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                My Recent Complaints
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Track the status of your submitted complaints
              </p>
            </div>
            
            {recentComplaints.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentComplaints.map((complaint) => (
                  <li key={complaint.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className={`h-2 w-2 rounded-full ${
                              complaint.status === 'submitted' ? 'bg-yellow-500' :
                              complaint.status === 'in_progress' ? 'bg-blue-500' :
                              complaint.status === 'resolved' || complaint.status === 'solved' ? 'bg-green-500' : 'bg-gray-500'
                            }`} />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {complaint.title}
                              </h4>
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                                {getStatusText(complaint.status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {complaint.description}
                            </p>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {complaint.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            {new Date(complaint.submittedDate || complaint.date).toLocaleDateString()}
                          </span>
                          <button className="text-menyesha-blue hover:text-blue-700 text-sm font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                      {complaint.institution && (
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {complaint.institution}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              // Empty State
              <div className="px-4 py-12 sm:px-6 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No complaints yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by submitting your first community issue.
                </p>
                <div className="mt-6">
                  <button
                    onClick={goToComplaintForm}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-menyesha-gold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    <svg className="mr-2 -ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Submit Your First Complaint
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;