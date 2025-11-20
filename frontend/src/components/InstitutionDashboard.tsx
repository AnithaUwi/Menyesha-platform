
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ComplaintDetailModal from './ComplaintDetailModal';
import { logout, getCurrentUser } from '../utils/auth';
// TypeScript interfaces
interface InstitutionStats {
  totalComplaints: number;
  resolvedThisMonth: number;
  inProgress: number;
  avgResolutionTime: string;
  institutionName: string;
  institutionCode: string;
  systemUptime?: string;
  activeInstitutions?: number;
  activeSectors?: number;
}

interface Complaint {
  id: number;
  title: string;
  description: string;
  location: string;
  category: string;
  submittedBy: string;
  submittedDate: string;
  status: string;
  priority: string;
  assignedSector: string;
  evidenceImages?: string[];
}

interface LoadingState {
  stats: boolean;
  complaints: boolean;
}

const InstitutionDashboard = () => {
  // Real data states with proper typing
  const [institutionStats, setInstitutionStats] = useState<InstitutionStats>({
    totalComplaints: 0,
    resolvedThisMonth: 0,
    inProgress: 0,
    avgResolutionTime: "0 days",
    institutionName: "Loading...",
    institutionCode: ""
  });
   const [currentUser, setCurrentUser] = useState(null);
 const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };
    const [selectedComplaintId, setSelectedComplaintId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [priorityFilter, setPriorityFilter] = useState<string>('All Priority');
  const [loading, setLoading] = useState<LoadingState>({
    stats: true,
    complaints: true
  });
  const [error, setError] = useState<string>('');

  // Navigation function
  const navigateTo = (page: string) => {
    window.location.hash = page;
  };

  // Get token from localStorage
  const getToken = (): string => {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async (): Promise<void> => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      const token = getToken();
      
      const response = await axios.get('http://localhost:5000/api/institution/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setInstitutionStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // Fetch complaints
  const fetchComplaints = async (): Promise<void> => {
    try {
      setLoading(prev => ({ ...prev, complaints: true }));
      const token = getToken();
      
      // Build query parameters for filtering
      const params: any = {};
      if (statusFilter !== 'All Status') params.status = statusFilter;
      if (priorityFilter !== 'All Priority') params.priority = priorityFilter;

      const response = await axios.get('http://localhost:5000/api/institution/complaints', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: params
      });

      if (response.data.success) {
        setComplaints(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setError('Failed to load complaints');
    } finally {
      setLoading(prev => ({ ...prev, complaints: false }));
    }
  };

  // View complaint details
  const handleViewComplaint = (complaintId: number) => {
  setSelectedComplaintId(complaintId);
  setIsModalOpen(true);
};

  // Update complaint status
  const handleUpdateStatus = (complaintId: number, newStatus: string): void => {
    // Implement status update
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
    if (!loading.stats) { 
      fetchComplaints();
    }
  }, [statusFilter, priorityFilter]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Navigation */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Institution Admin Dashboard</h1>
          <p className="text-gray-600">{institutionStats.institutionName}</p>
          {institutionStats.institutionCode && (
            <p className="text-sm text-gray-500">Code: {institutionStats.institutionCode}</p>
          )}
        </div>
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

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {loading.stats ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : (
          <>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm">Total Complaints</h3>
              <p className="text-2xl font-bold">{institutionStats.totalComplaints}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm">Resolved This Month</h3>
              <p className="text-2xl font-bold text-green-600">{institutionStats.resolvedThisMonth}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm">In Progress</h3>
              <p className="text-2xl font-bold text-blue-600">{institutionStats.inProgress}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm">Avg. Resolution</h3>
              <p className="text-2xl font-bold">{institutionStats.avgResolutionTime}</p>
            </div>
          </>
        )}
      </div>

      {/* Recent Complaints Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Complaints Management</h2>
          <p className="text-gray-600 text-sm">
            Managing complaints for {institutionStats.institutionName}
            {complaints.length > 0 && ` • ${complaints.length} complaint(s) found`}
          </p>
        </div>

        {/* Filters */}
        <div className="p-4 border-b flex gap-4">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-2"
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
            className="border rounded px-3 py-2"
            disabled={loading.complaints}
          >
            <option>All Priority</option>
            <option>LOW</option>
            <option>MEDIUM</option>
            <option>HIGH</option>
            <option>URGENT</option>
          </select>
          
          {/* Refresh Button */}
          <button
            onClick={fetchComplaints}
            disabled={loading.complaints}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading.complaints ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Complaints Table */}
        <div className="overflow-x-auto">
          {loading.complaints ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No complaints found for your institution.</p>
              <p className="text-sm mt-1">
                {statusFilter !== 'All Status' || priorityFilter !== 'All Priority' 
                  ? 'Try changing your filters' 
                  : 'All complaints are handled and resolved!'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-medium">COMPLAINT</th>
                  <th className="text-left p-3 font-medium">CATEGORY</th>
                  <th className="text-left p-3 font-medium">SECTOR</th>
                  <th className="text-left p-3 font-medium">SUBMITTED BY</th>
                  <th className="text-left p-3 font-medium">DATE</th>
                  <th className="text-left p-3 font-medium">STATUS</th>
                  <th className="text-left p-3 font-medium">PRIORITY</th>
                  <th className="text-left p-3 font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{complaint.title}</div>
                      <div className="text-sm text-gray-600">{complaint.location}</div>
                    </td>
                    <td className="p-3">{complaint.category || 'General'}</td>
                    <td className="p-3">{complaint.assignedSector}</td>
                    <td className="p-3">{complaint.submittedBy}</td>
                    <td className="p-3 text-sm text-gray-600">
                      {formatDate(complaint.submittedDate)}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                        complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        complaint.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                        complaint.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        complaint.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewComplaint(complaint.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(complaint.id, 'in_progress')}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
  );
};

export default InstitutionDashboard;