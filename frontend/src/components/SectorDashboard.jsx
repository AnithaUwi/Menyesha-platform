// SectorDashboard.jsx
import React, { useState } from 'react';

const SectorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for sector admin
  const sectorData = {
    name: "Remera Sector",
    district: "Gasabo",
    province: "Kigali",
    adminName: "Sector Administrator"
  };

  const sectorStats = {
    totalComplaints: 47,
    newComplaints: 12,
    inProgress: 18,
    resolved: 15,
    avgResolutionTime: "3.2 days"
  };

  const recentComplaints = [
    {
      id: 1,
      title: "Pothole on KN 45 St",
      category: "Road Infrastructure",
      location: "Remera, Gasabo",
      status: "in_progress",
      submittedDate: "2024-01-15",
      citizen: "Jean Claude",
      priority: "high"
    },
    {
      id: 2,
      title: "Garbage Collection Delay",
      category: "Sanitation",
      location: "Gishushu, Remera",
      status: "submitted",
      submittedDate: "2024-01-14",
      citizen: "Marie A.",
      priority: "medium"
    },
    {
      id: 3,
      title: "Street Light Repair",
      category: "Public Utilities",
      location: "Amahoro Stadium Rd",
      status: "resolved",
      submittedDate: "2024-01-10",
      citizen: "Paul R.",
      priority: "medium"
    },
    {
      id: 4,
      title: "Drainage Blockage",
      category: "Infrastructure",
      location: "KG 11 Ave",
      status: "in_progress",
      submittedDate: "2024-01-13",
      citizen: "Alice M.",
      priority: "high"
    }
  ];

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
      default: return status;
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sector Admin Dashboard</h1>
                <p className="text-sm text-gray-600">{sectorData.name}, {sectorData.district}</p>
              </div>
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
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
                  </p>
                </div>
                <div className="flex space-x-3">
                  <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <option>All Status</option>
                    <option>Submitted</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                  <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <option>All Priority</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
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
                        <div className="text-sm text-gray-900">{complaint.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{complaint.citizen}</div>
                        <div className="text-sm text-gray-500">{complaint.submittedDate}</div>
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
                        <button className="text-menyesha-blue hover:text-blue-700 mr-3">
                          View
                        </button>
                        <button className="text-green-600 hover:text-green-700 mr-3">
                          Update
                        </button>
                        <button className="text-gray-600 hover:text-gray-700">
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                <p className="text-gray-500">Performance charts will be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectorDashboard;