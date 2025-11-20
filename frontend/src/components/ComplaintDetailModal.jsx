import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

//StatusUpdate parameter
const ComplaintDetailModal = ({ complaintId, isOpen, onClose, onStatusUpdate }) => {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false); 
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Fetch complaint details
  const fetchComplaintDetails = async () => {
    if (!complaintId) return;
    
    try {
      setLoading(true);
      setError('');
      const token = getToken();
      
      const response = await axios.get(`${config.apiUrl}/api/complaints/${complaintId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setComplaint(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching complaint details:', error);
      setError('Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  //complaint status
  const updateComplaintStatus = async (newStatus) => {
    if (!complaintId) return;
    
    try {
      setUpdating(true);
      setError('');
      setSuccessMessage('');
      
      const token = getToken();
      
      const response = await axios.put(
        `http://localhost:5000/api/complaints/${complaintId}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccessMessage(`Status updated to ${getStatusText(newStatus)} successfully!`);
        
        // Refresh complaint data
        await fetchComplaintDetails();
        
        // Notify parent component to refresh dashboard
        if (onStatusUpdate) {
          onStatusUpdate();
        }
      }
    } catch (error) {
      console.error('Error updating complaint status:', error);
      setError('Failed to update status: ' + (error.response?.data?.error || error.message));
    } finally {
      setUpdating(false);
    }
  };

  // complaint priority
  const updateComplaintPriority = async (newPriority) => {
    if (!complaintId) return;
    
    try {
      setUpdating(true);
      setError('');
      setSuccessMessage('');
      
      const token = getToken();
      
      const response = await axios.put(
        `${config.apiUrl}/api/complaints/${complaintId}/status`,
        { priority: newPriority },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccessMessage(`Priority updated to ${newPriority.toUpperCase()} successfully!`);
        
        // Refresh complaint data
        await fetchComplaintDetails();
        
        // Notify parent component to refresh dashboard
        if (onStatusUpdate) {
          onStatusUpdate();
        }
      }
    } catch (error) {
      console.error('Error updating complaint priority:', error);
      setError('Failed to update priority: ' + (error.response?.data?.error || error.message));
    } finally {
      setUpdating(false);
    }
  };

  // Load complaint when modal opens
  useEffect(() => {
    if (isOpen && complaintId) {
      fetchComplaintDetails();
      setCurrentImageIndex(0); 
      setSuccessMessage(''); 
      setError('');    
    }
  }, [isOpen, complaintId]);

  // Handle image navigation
  const nextImage = () => {
    if (complaint?.evidenceImages?.length) {
      setCurrentImageIndex((prev) => 
        prev === complaint.evidenceImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (complaint?.evidenceImages?.length) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? complaint.evidenceImages.length - 1 : prev - 1
      );
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'resolved': return 'Resolved';
      case 'in_progress': return 'In Progress';
      case 'submitted': return 'Submitted';
      default: return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  //  Get next status options
  const getNextStatusOptions = (currentStatus) => {
    const statusFlow = {
      'submitted': ['in_progress', 'resolved'],
      'in_progress': ['submitted', 'resolved'],
      'resolved': ['in_progress', 'closed'],
      'closed': ['resolved']
    };
    
    return statusFlow[currentStatus] || [];
  };

  //  Get priority options
  const getPriorityOptions = () => {
    return ['low', 'medium', 'high', 'urgent'];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Complaint Details
            {complaint && (
              <span className={`ml-3 text-sm font-normal ${getStatusColor(complaint.status)} px-2 py-1 rounded`}>
                {getStatusText(complaint.status)}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="p-4 m-4 bg-green-100 text-green-800 rounded-lg border border-green-300">
             {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 m-4 bg-red-100 text-red-800 rounded-lg border border-red-300">
            {error}
            <button 
              onClick={() => setError('')}
              className="ml-4 text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading complaint details...</p>
          </div>
        )}

        {/* Complaint Details */}
        {complaint && !loading && (
          <div className="p-6 space-y-6">
            {/* Status & Priority Update Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status & Priority</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Update */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {getNextStatusOptions(complaint.status).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateComplaintStatus(status)}
                        disabled={updating}
                        className={`px-3 py-2 rounded text-sm font-medium ${
                          updating 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        Mark as {getStatusText(status)}
                      </button>
                    ))}
                    {complaint.status === 'resolved' && (
                      <button
                        onClick={() => updateComplaintStatus('closed')}
                        disabled={updating}
                        className={`px-3 py-2 rounded text-sm font-medium ${
                          updating 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                        }`}
                      >
                        Mark as Closed
                      </button>
                    )}
                  </div>
                </div>

                {/* Priority Update */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Priority
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {getPriorityOptions().map((priority) => (
                      <button
                        key={priority}
                        onClick={() => updateComplaintPriority(priority)}
                        disabled={updating || complaint.priority === priority}
                        className={`px-3 py-2 rounded text-sm font-medium ${
                          updating || complaint.priority === priority
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : getPriorityColor(priority).replace('bg-', 'bg-').replace('text-', 'text-')
                        }`}
                      >
                        Set {priority.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {updating && (
                <div className="mt-3 text-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto inline-block mr-2"></div>
                  <span className="text-sm text-gray-600">Updating...</span>
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <p className="mt-1 text-gray-900 font-medium">{complaint.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{complaint.description}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Specific Location</label>
                    <p className="mt-1 text-gray-900">{complaint.specificLocation}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Category</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`mt-1 inline-flex px-2 py-1 rounded text-xs font-medium ${getStatusColor(complaint.status)}`}>
                      {getStatusText(complaint.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <span className={`mt-1 inline-flex px-2 py-1 rounded text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="mt-1 text-gray-900">{complaint.category || 'General'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Institution</label>
                    <p className="mt-1 text-gray-900">{complaint.institution || 'Not assigned'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Province</label>
                  <p className="mt-1 text-gray-900">{complaint.province}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">District</label>
                  <p className="mt-1 text-gray-900">{complaint.district}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sector</label>
                  <p className="mt-1 text-gray-900">{complaint.sector}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cell</label>
                  <p className="mt-1 text-gray-900">{complaint.cell || 'Not specified'}</p>
                </div>
                {complaint.village && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Village</label>
                    <p className="mt-1 text-gray-900">{complaint.village}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Evidence Images */}
            {complaint.evidenceImages && complaint.evidenceImages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Evidence Photos</h3>
                <div className="relative">
                  {/* Image Carousel */}
                  <div className="bg-gray-100 rounded-lg p-4 flex justify-center items-center">
                    <img 
                      src={`${config.apiUrl}/uploads/complaints/${complaint.evidenceImages[currentImageIndex]}`}
                      alt={`Evidence ${currentImageIndex + 1}`}
                      className="max-h-64 max-w-full object-contain rounded"
                    />
                  </div>
                  
                  {/* Navigation Arrows */}
                  {complaint.evidenceImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                      >
                        ‹
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                      >
                        ›
                      </button>
                    </>
                  )}
                  
                  {/* Image Counter */}
                  {complaint.evidenceImages.length > 1 && (
                    <div className="text-center mt-2 text-sm text-gray-600">
                      Image {currentImageIndex + 1} of {complaint.evidenceImages.length}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submitted By Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Submitted By</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-gray-900">{complaint.submittedBy.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{complaint.submittedBy.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-gray-900">{complaint.submittedBy.phone}</p>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Submitted</label>
                  <p className="mt-1 text-gray-900">{formatDate(complaint.submittedAt)}</p>
                </div>
                {complaint.resolvedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resolved</label>
                    <p className="mt-1 text-gray-900">{formatDate(complaint.resolvedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {complaint && `Complaint ID: ${complaint.id}`}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

//  Default props for onStatusUpdate
ComplaintDetailModal.defaultProps = {
  onStatusUpdate: () => {}
};

export default ComplaintDetailModal;