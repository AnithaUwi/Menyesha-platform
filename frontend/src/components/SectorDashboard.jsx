// SectorDashboard.jsx - Updated with real backend data
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ComplaintDetailModal from './ComplaintDetailModal';
import { logout, getCurrentUser } from '../utils/auth';
const SectorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Real data states
  const [sectorData, setSectorData] = useState({
    name: "Loading...",
    district: "",
    province: "",
    adminName: "Loading..."
  });
   const [currentUser, setCurrentUser] = useState(null);
const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const [sectorStats, setSectorStats] = useState({
    totalComplaints: 0,
    newComplaints: 0,
    inProgress: 0,
    resolved: 0,
    avgResolutionTime: "0 days"
  });

  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState({
    stats: true,
    complaints: true
  });
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [priorityFilter, setPriorityFilter] = useState('All Priority');
    const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Fetch sector dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      const token = getToken();
      
      const response = await axios.get('http://localhost:5000/api/sector/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSectorStats(response.data.data);
        setSectorData({
          name: response.data.data.sectorName,
          district: response.data.data.district,
          province: response.data.data.province,
          adminName: response.data.data.adminName
        });
      }
    } catch (error) {
      console.error('Error fetching sector stats:', error);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // Fetch complaints for sector
  const fetchComplaints = async () => {
    try {
      setLoading(prev => ({ ...prev, complaints: true }));
      const token = getToken();
      
      // Build query parameters for filtering
      const params = {};
      if (statusFilter !== 'All Status') params.status = statusFilter;
      if (priorityFilter !== 'All Priority') params.priority = priorityFilter;

      const response = await axios.get('http://localhost:5000/api/sector/complaints', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: params
      });

      if (response.data.success) {
        setRecentComplaints(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching sector complaints:', error);
      setError('Failed to load complaints');
    } finally {
      setLoading(prev => ({ ...prev, complaints: false }));
    }
  };

  // View complaint details
 const handleViewComplaint = (complaintId) => {
    setSelectedComplaintId(complaintId);
    setIsModalOpen(true);
  };

  // Update complaint status
  const handleUpdateStatus = (complaintId, newStatus) => {
    // TODO: Implement status update
    console.log('Update status:', complaintId, newStatus);
    alert(`Status update feature coming soon!`);
  };

  const refreshData = () => {
  fetchDashboardStats();
  fetchComplaints();
};

  // Load data when component mounts
  useEffect(() => {
    fetchDashboardStats();
    fetchComplaints();
  }, []);

   useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Refetch complaints when filters change
  useEffect(() => {
    if (!loading.stats) { // Only refetch if initial load is done
      fetchComplaints();
    }
  }, [statusFilter, priorityFilter]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted': return 'Submitted';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      default: return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => window.location.hash = 'home'}
                className="text-menyesha-blue hover:underline flex items-center mr-6"
              >
                ← Back to Home
              </button>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;


              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sector Admin Dashboard</h1>
                <p className="text-sm text-gray-600">
                  {sectorData.name}, {sectorData.district}
                  {loading.stats && <span className="ml-2 text-gray-400">Loading...</span>}
                </p>

               
 
              </div>    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
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
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {sectorData.adminName}</span>
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                SA



                
              </div>

              
              

              
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg border border-red-300">
              {error}
              <button 
                onClick={() => setError('')}
                className="float-right text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {loading.stats ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-gray-300 rounded-md p-3"></div>
                      <div className="ml-5 w-0 flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
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
                          <dd className="text-lg font-semibold text-gray-900">{sectorStats.totalComplaints}</dd>
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
                          <dt className="text-sm font-medium text-gray-500 truncate">New Today</dt>
                          <dd className="text-lg font-semibold text-gray-900">{sectorStats.newComplaints}</dd>
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
                          <dd className="text-lg font-semibold text-gray-900">{sectorStats.inProgress}</dd>
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
                          <dd className="text-lg font-semibold text-gray-900">{sectorStats.resolved}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Avg. Resolution</dt>
                          <dd className="text-lg font-semibold text-gray-900">{sectorStats.avgResolutionTime}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['overview', 'complaints', 'analytics', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-menyesha-blue text-menyesha-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Complaints Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Complaints - {sectorData.name}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Manage and track complaints in your sector
                    {recentComplaints.length > 0 && ` • ${recentComplaints.length} complaint(s) found`}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    disabled={loading.complaints}
                  >
                    <option>All Status</option>
                    <option>Submitted</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                  <select 
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    disabled={loading.complaints}
                  >
                    <option>All Priority</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                  <button
                    onClick={fetchComplaints}
                    disabled={loading.complaints}
                    className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading.complaints ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              {loading.complaints ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading complaints...</p>
                </div>
              ) : recentComplaints.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No complaints found in your sector.</p>
                  <p className="text-sm mt-1">
                    {statusFilter !== 'All Status' || priorityFilter !== 'All Priority' 
                      ? 'Try changing your filters' 
                      : 'All complaints are handled and resolved!'}
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Complaint
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted By
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentComplaints.map((complaint) => (
                      <tr key={complaint.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{complaint.title}</div>
                            <div className="text-sm text-gray-500">{complaint.location}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{complaint.category || 'General'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{complaint.citizen}</div>
                          <div className="text-sm text-gray-500">{formatDate(complaint.submittedDate)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(complaint.submittedDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                            {getStatusText(complaint.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                            {complaint.priority.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => handleViewComplaint(complaint.id)}
                            className="text-menyesha-blue hover:text-blue-700 mr-3"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(complaint.id, 'in_progress')}
                            className="text-green-600 hover:text-green-700 mr-3"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h4>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  📊 Generate Sector Report
                </button>
                <button className="w-full text-left px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  👥 Manage Field Officers
                </button>
                <button className="w-full text-left px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  📧 Send Bulk Updates
                </button>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6 md:col-span-2">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Sector Performance</h4>
              <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">
                  {loading.stats ? 'Loading performance data...' : 'Performance charts will be displayed here'}
                </p>
<ComplaintDetailModal
        complaintId={selectedComplaintId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedComplaintId(null);
        }}
         onStatusUpdate={refreshData} 
      />

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectorDashboard;