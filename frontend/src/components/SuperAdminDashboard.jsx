import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewInstitutionForm from './NewInstitutionForm';
import { logout, getCurrentUser } from '../utils/auth';

const SuperAdminDashboard = () => {
  // Real data states
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalComplaints: 0,
    resolvedComplaints: 0,
    activeInstitutions: 0,
    activeSectors: 0,
    avgResolutionTime: "0 days",
    systemUptime: "99.8%"
  });

  const [institutions, setInstitutions] = useState([]);
  const [users, setUsers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState({
    stats: true,
    institutions: true,
    users: true
  });
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  // New states for modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isInstitutionModalOpen, setIsInstitutionModalOpen] = useState(false);

  // Navigation function
  const navigateTo = (page) => {
    window.location.href = `/#${page}`;
  };

  // Format numbers with commas for display
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      const response = await axios.get('http://localhost:5000/api/admin/dashboard-stats');
      if (response.data.success) {
        setSystemStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // Fetch institutions
  const fetchInstitutions = async () => {
    try {
      setLoading(prev => ({ ...prev, institutions: true }));
      const response = await axios.get('http://localhost:5000/api/admin/institutions');
      if (response.data.success) {
        setInstitutions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching institutions:', error);
      setError('Failed to load institutions');
    } finally {
      setLoading(prev => ({ ...prev, institutions: false }));
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      const response = await axios.get('http://localhost:5000/api/admin/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  // View User Details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  // View Institution Details
  const handleViewInstitution = (institution) => {
    setSelectedInstitution(institution);
    setIsInstitutionModalOpen(true);
  };

  // Toggle user status (activate/deactivate)
  const toggleUserStatus = async (userId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus === 'active' ? 'deactivate' : 'activate'} this user?`)) {
      return;
    }

    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await axios.put(`http://localhost:5000/api/admin/users/${userId}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        // Update local state 
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        ));
        
        // Add to recent activities
        const updatedUser = users.find(user => user.id === userId);
        const newActivity = {
          id: Date.now(),
          action: `User ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
          target: updatedUser?.email || 'User',
          admin: 'Super Admin',
          time: 'Just now'
        };
        setRecentActivities(prev => [newActivity, ...prev.slice(0, 4)]);
        
        // Refresh stats
        fetchDashboardStats();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Failed to update user status');
    }
  };

  // Toggle institution status
  const toggleInstitutionStatus = async (institutionId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus === 'active' ? 'disable' : 'enable'} this institution?`)) {
      return;
    }

    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      // Find the institution admin user for this institution
      const institutionAdmin = institutions.find(inst => inst.id === institutionId);
      
      if (!institutionAdmin) {
        setError('Institution admin not found');
        return;
      }

      // Use the institution admin's USER ID
      const response = await axios.put(`http://localhost:5000/api/admin/users/${institutionAdmin.id}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        // Update local state 
        setInstitutions(prev => prev.map(inst => 
          inst.id === institutionId ? { ...inst, status: newStatus } : inst
        ));
        
        // Add to recent activities
        const newActivity = {
          id: Date.now(),
          action: `Institution ${newStatus === 'active' ? 'Enabled' : 'Disabled'}`,
          target: institutionAdmin.name || 'Institution',
          admin: 'Super Admin',
          time: 'Just now'
        };
        setRecentActivities(prev => [newActivity, ...prev.slice(0, 4)]);
        
        // Refresh stats
        fetchDashboardStats();
      }
    } catch (error) {
      console.error('Error updating institution status:', error);
      setError('Failed to update institution status');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  // Handle adding new institution
  const handleAddInstitution = (newInstitution) => {
    // Add to institutions list
    const formattedInstitution = {
      id: newInstitution.id,
      name: newInstitution.institutionName,
      institutionCode: newInstitution.institutionCode,
      email: newInstitution.email,
      phone: newInstitution.phone,
      status: newInstitution.status,
      createdAt: newInstitution.createdAt
    };

    setInstitutions(prev => [formattedInstitution, ...prev]);
    
    // Add to recent activities
    const newActivity = {
      id: Date.now(),
      action: 'New Institution Registered',
      target: newInstitution.institutionName,
      admin: 'Super Admin',
      time: 'Just now'
    };
    setRecentActivities(prev => [newActivity, ...prev.slice(0, 4)]);

    // Refresh stats
    fetchDashboardStats();
  };

  // Load data when component mounts or tab changes
  useEffect(() => {
    fetchDashboardStats();

    if (activeTab === 'institutions') {
      fetchInstitutions();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  // Generate mock recent activities based on real data
  useEffect(() => {
    const generateActivities = () => {
      const activities = [];
      
      // Add institution creation activities
      institutions.slice(0, 3).forEach(inst => {
        activities.push({
          id: `inst-${inst.id}`,
          action: 'Institution Registered',
          target: inst.name,
          admin: 'Super Admin',
          time: 'Recently'
        });
      });

      // Add user registration activities
      users.slice(0, 2).forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          action: 'User Registered',
          target: user.email,
          admin: 'System',
          time: 'Recently'
        });
      });

      setRecentActivities(activities);
    };

    if (institutions.length > 0 || users.length > 0) {
      generateActivities();
    }
  }, [institutions, users]);

  // Get current user 
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Navigation */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Super Admin Dashboard</h1>
          <p className="text-gray-600">System-wide administration and monitoring</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigateTo('home')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
          </button>
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

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg border border-red-300">
          {error}
          <button 
            onClick={() => setError('')}
            className="float-right text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-6 border-b">
        <div className="flex space-x-4">
          {['overview', 'institutions', 'users', 'system'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-1 capitalize ${
                activeTab === tab 
                  ? 'border-b-2 border-blue-600 text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* System Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {loading.stats ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))
            ) : (
              <>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-gray-600 text-sm">Total Users</h3>
                  <p className="text-2xl font-bold">{formatNumber(systemStats.totalUsers)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-gray-600 text-sm">Total Complaints</h3>
                  <p className="text-2xl font-bold">{formatNumber(systemStats.totalComplaints)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-gray-600 text-sm">Resolved</h3>
                  <p className="text-2xl font-bold text-green-600">{formatNumber(systemStats.resolvedComplaints)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-gray-600 text-sm">Active Institutions</h3>
                  <p className="text-2xl font-bold">{formatNumber(systemStats.activeInstitutions)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-gray-600 text-sm">Active Sectors</h3>
                  <p className="text-2xl font-bold">{formatNumber(systemStats.activeSectors)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-gray-600 text-sm">System Uptime</h3>
                  <p className="text-2xl font-bold text-green-600">{systemStats.systemUptime}</p>
                </div>
              </>
            )}
          </div>

          {/* Recent Activities & Top Institutions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Recent System Activities</h2>
              </div>
              <div className="p-4">
                {recentActivities.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent activities</p>
                ) : (
                  recentActivities.map(activity => (
                    <div key={activity.id} className="border-b last:border-b-0 py-3">
                      <div className="flex justify-between">
                        <span className="font-medium">{activity.action}</span>
                        <span className="text-sm text-gray-500">{activity.time}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Target: {activity.target} • By: {activity.admin}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Institutions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Institutions</h2>
              </div>
              <div className="p-4">
                {loading.institutions ? (
                  // Loading skeletons
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="border-b last:border-b-0 py-3 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))
                ) : institutions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No institutions registered</p>
                ) : (
                  institutions.slice(0, 5).map(inst => (
                    <div key={inst.id} className="border-b last:border-b-0 py-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{inst.name}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          inst.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {inst.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Code: {inst.institutionCode} • {formatDate(inst.createdAt)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Institutions Tab */}
      {activeTab === 'institutions' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Manage Institutions</h2>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              + Add New Admin
            </button>
          </div>
          <div className="overflow-x-auto">
            {loading.institutions ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading institutions...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-medium">INSTITUTION</th>
                    <th className="text-left p-3 font-medium">CODE</th>
                    <th className="text-left p-3 font-medium">CONTACT</th>
                    <th className="text-left p-3 font-medium">STATUS</th>
                    <th className="text-left p-3 font-medium">CREATED</th>
                    <th className="text-left p-3 font-medium">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {institutions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">
                        No institutions found. Create your first institution admin.
                      </td>
                    </tr>
                  ) : (
                    institutions.map(inst => (
                      <tr key={inst.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{inst.name}</div>
                          {inst.institutionCategory && (
                            <div className="text-sm text-gray-600">{inst.institutionCategory}</div>
                          )}
                        </td>
                        <td className="p-3 font-mono text-sm">{inst.institutionCode}</td>
                        <td className="p-3">
                          <div className="text-sm">{inst.email}</div>
                          <div className="text-sm text-gray-600">{inst.phone}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            inst.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {inst.status}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {formatDate(inst.createdAt)}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleViewInstitution(inst)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View
                            </button>
                            <button 
                              onClick={() => toggleInstitutionStatus(inst.id, inst.status)}
                              className={`text-sm ${
                                inst.status === 'active' 
                                  ? 'text-red-600 hover:text-red-800' 
                                  : 'text-green-600 hover:text-green-800'
                              }`}
                            >
                              {inst.status === 'active' ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">User Management</h2>
          </div>
          <div className="overflow-x-auto">
            {loading.users ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading users...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-medium">USER</th>
                    <th className="text-left p-3 font-medium">ROLE</th>
                    <th className="text-left p-3 font-medium">INSTITUTION/SECTOR</th>
                    <th className="text-left p-3 font-medium">STATUS</th>
                    <th className="text-left p-3 font-medium">JOIN DATE</th>
                    <th className="text-left p-3 font-medium">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'institution_admin' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'sector_admin' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">
                          {user.institutionName && (
                            <div className="text-sm">{user.institutionName}</div>
                          )}
                          {user.sectorName && (
                            <div className="text-sm">{user.sectorName}</div>
                          )}
                          {!user.institutionName && !user.sectorName && (
                            <div className="text-sm text-gray-500">Citizen</div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleViewUser(user)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View
                            </button>
                            <button 
                              onClick={() => toggleUserStatus(user.id, user.status)}
                              className={`text-sm ${
                                user.status === 'active' 
                                  ? 'text-red-600 hover:text-red-800' 
                                  : 'text-green-600 hover:text-green-800'
                              }`}
                            >
                              {user.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">System Settings</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Auto-backup</span>
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Enabled</button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Email Notifications</span>
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Enabled</button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Maintenance Mode</span>
                  <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm">Disabled</button>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Run System Backup
                </button>
                <button className="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700">
                  Generate Monthly Report
                </button>
                <button 
                  onClick={() => setIsFormOpen(true)}
                  className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                >
                  Add New Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Institution Registration Form Modal */}
      <NewInstitutionForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleAddInstitution}
      />

      {/* User Details Modal */}
      {isUserModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">User Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="mt-1 text-gray-900">{selectedUser.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-gray-900">{selectedUser.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1 text-gray-900">{selectedUser.role.replace('_', ' ').toUpperCase()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`mt-1 px-2 py-1 rounded text-xs ${
                  selectedUser.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedUser.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Joined Date</label>
                <p className="mt-1 text-gray-900">{formatDate(selectedUser.createdAt)}</p>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Institution Details Modal */}
      {isInstitutionModalOpen && selectedInstitution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Institution Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Institution Name</label>
                <p className="mt-1 text-gray-900">{selectedInstitution.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Institution Code</label>
                <p className="mt-1 text-gray-900 font-mono">{selectedInstitution.institutionCode}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                <p className="mt-1 text-gray-900">{selectedInstitution.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-gray-900">{selectedInstitution.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <p className="mt-1 text-gray-900">{selectedInstitution.institutionCategory || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`mt-1 px-2 py-1 rounded text-xs ${
                  selectedInstitution.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedInstitution.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created</label>
                <p className="mt-1 text-gray-900">{formatDate(selectedInstitution.createdAt)}</p>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => setIsInstitutionModalOpen(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;