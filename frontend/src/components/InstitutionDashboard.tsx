// components/InstitutionDashboard.jsx
import React, { useState } from 'react';

const InstitutionDashboard = () => {
  // Mock data for REG (Rwanda Energy Group) institution
  const [institutionStats] = useState({
    totalComplaints: 47,
    resolvedThisMonth: 18,
    inProgress: 22,
    avgResolutionTime: "3.2 days",
    institutionName: "Rwanda Energy Group (REG)",
    institutionCode: "REG"
  });

  const [complaints] = useState([
    {
      id: 1,
      title: "Power Outage in Remera",
      description: "No electricity for 6 hours in Remera sector",
      location: "Remera, Gasabo",
      category: "Power Supply",
      submittedBy: "Jean Claude",
      submittedDate: "2024-01-15",
      status: "In Progress",
      priority: "HIGH",
      assignedSector: "Remera"
    },
    {
      id: 2,
      title: "Street Light Repair",
      description: "Multiple street lights not working on main road",
      location: "Kicukiro Center",
      category: "Public Lighting",
      submittedBy: "Alice M.",
      submittedDate: "2024-01-14",
      status: "Submitted",
      priority: "MEDIUM",
      assignedSector: "Kicukiro"
    },
    {
      id: 3,
      title: "Electric Meter Installation",
      description: "Request for new electric meter installation",
      location: "Nyarugenge Downtown",
      category: "Meter Services",
      submittedBy: "Robert D.",
      submittedDate: "2024-01-13",
      status: "Resolved",
      priority: "LOW",
      assignedSector: "Nyarugenge"
    },
    {
      id: 4,
      title: "High Electricity Bill",
      description: "Unusually high electricity bill this month",
      location: "Gisozi, Gasabo",
      category: "Billing",
      submittedBy: "Marie A.",
      submittedDate: "2024-01-12",
      status: "In Progress",
      priority: "MEDIUM",
      assignedSector: "Gasabo"
    },
    {
      id: 5,
      title: "Transformer Maintenance",
      description: "Transformer making unusual noises",
      location: "Kacyiru, Gasabo",
      category: "Infrastructure",
      submittedBy: "Paul R.",
      submittedDate: "2024-01-11",
      status: "Submitted",
      priority: "HIGH",
      assignedSector: "Gasabo"
    }
  ]);

  const [statusFilter, setStatusFilter] = useState('All Status');
  const [priorityFilter, setPriorityFilter] = useState('All Priority');

  // Navigation function
  const navigateTo = (page: string) => {
    window.location.hash = page;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Navigation */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Institution Admin Dashboard</h1>
          <p className="text-gray-600">{institutionStats.institutionName}</p>
        </div>
        <button 
          onClick={() => navigateTo('home')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          ← Back to Home
        </button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
      </div>

      {/* Recent Complaints Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Energy-Related Complaints</h2>
          <p className="text-gray-600 text-sm">Managing power, lighting, and energy service complaints</p>
        </div>

        {/* Filters */}
        <div className="p-4 border-b flex gap-4">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-2"
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
          >
            <option>All Priority</option>
            <option>LOW</option>
            <option>MEDIUM</option>
            <option>HIGH</option>
            <option>URGENT</option>
          </select>
        </div>

        {/* Complaints Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium">COMPLAINT</th>
                <th className="text-left p-3 font-medium">CATEGORY</th>
                <th className="text-left p-3 font-medium">SECTOR</th>
                <th className="text-left p-3 font-medium">SUBMITTED BY</th>
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
                  <td className="p-3">{complaint.category}</td>
                  <td className="p-3">{complaint.assignedSector}</td>
                  <td className="p-3">{complaint.submittedBy}</td>
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
                      <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                      <button className="text-green-600 hover:text-green-800 text-sm">Update</button>
                      <button className="text-purple-600 hover:text-purple-800 text-sm">Assign</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InstitutionDashboard;