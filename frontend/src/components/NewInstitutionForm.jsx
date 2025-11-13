import React, { useState } from 'react';
import axios from 'axios';

const NewInstitutionForm = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    // Admin Personal Details
    fullName: '',
    email: '',
    password: 'defaultPassword123',
    phone: '',
    
    // Role Selection - NEW FIELD
    role: 'institution_admin', // Default to institution admin
    
    // Institution Details  
    institutionName: '',
    institutionCode: '',
    institutionCategory: '',
    institutionAddress: '',
    institutionDescription: '',
    
    // Sector Details - NEW FIELDS
    sectorName: '',
    sectorCode: '',
    province: '',
    district: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const categories = [
    'Energy',
    'Water & Sanitation',
    'Security',
    'Infrastructure',
    'Education',
    'Health',
    'Development',
    'Transport',
    'Agriculture',
    'Other'
  ];

  const provinces = [
    'Kigali City',
    'Southern Province',
    'Northern Province', 
    'Eastern Province',
    'Western Province'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Admin validation
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    // Role-specific validation
    if (formData.role === 'institution_admin') {
      if (!formData.institutionName.trim()) newErrors.institutionName = 'Institution name is required';
      if (!formData.institutionCode.trim()) newErrors.institutionCode = 'Institution code is required';
      if (!formData.institutionCategory) newErrors.institutionCategory = 'Category is required';
    } else if (formData.role === 'sector_admin') {
      if (!formData.sectorName.trim()) newErrors.sectorName = 'Sector name is required';
      if (!formData.sectorCode.trim()) newErrors.sectorCode = 'Sector code is required';
      if (!formData.province) newErrors.province = 'Province is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log('📥 Sending data to backend:', formData);
      
      // Choose the correct API endpoint based on role
      const endpoint = formData.role === 'institution_admin' 
        ? 'http://localhost:5000/api/admin/create-institution'
        : 'http://localhost:5000/api/admin/create-sector';
      
      const response = await axios.post(endpoint, formData);
      
      console.log('✅ Backend response:', response.data);
      
      if (response.data.success) {
        const roleName = formData.role === 'institution_admin' ? 'Institution' : 'Sector';
        setMessage({ type: 'success', text: `${roleName} admin created successfully!` });
        
        // Notify parent component with real data from backend
        onSave(response.data.data);
        
        // Clear form and close modal after success
        setTimeout(() => {
          handleReset();
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('❌ API Error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create admin account';
      setMessage({ 
        type: 'error', 
        text: errorMessage 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      password: 'defaultPassword123',
      phone: '',
      role: 'institution_admin',
      institutionName: '',
      institutionCode: '',
      institutionCategory: '',
      institutionAddress: '',
      institutionDescription: '',
      sectorName: '',
      sectorCode: '',
      province: '',
      district: ''
    });
    setErrors({});
    setMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Register New Admin</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 text-sm mt-1">
            Create a new institution or sector admin account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message && (
            <div className={`p-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {message.text}
            </div>
          )}

          {/* Admin Details Section */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Admin Personal Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="admin@institution.rw"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+250 788 123 456"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="institution_admin">Institution Admin</option>
                  <option value="sector_admin">Sector Admin</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.role === 'institution_admin' 
                    ? 'Manages institution-wide complaints' 
                    : 'Manages sector-specific complaints'}
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Password
                </label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                  placeholder="Default password"
                />
                <p className="text-xs text-gray-500 mt-1">Admin can change this after first login</p>
              </div>
            </div>
          </div>

          {/* Institution Details Section - Show only for institution admin */}
          {formData.role === 'institution_admin' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Institution Details</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Institution Name *
                    </label>
                    <input
                      type="text"
                      name="institutionName"
                      value={formData.institutionName}
                      onChange={handleChange}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.institutionName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Rwanda Energy Group"
                    />
                    {errors.institutionName && <p className="text-red-500 text-xs mt-1">{errors.institutionName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Institution Code *
                    </label>
                    <input
                      type="text"
                      name="institutionCode"
                      value={formData.institutionCode}
                      onChange={handleChange}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.institutionCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., REG"
                      maxLength="10"
                    />
                    {errors.institutionCode && <p className="text-red-500 text-xs mt-1">{errors.institutionCode}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="institutionCategory"
                    value={formData.institutionCategory}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.institutionCategory ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.institutionCategory && <p className="text-red-500 text-xs mt-1">{errors.institutionCategory}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="institutionAddress"
                    value={formData.institutionAddress}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Kigali, Rwanda"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="institutionDescription"
                    value={formData.institutionDescription}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the institution's role and responsibilities..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sector Details Section - Show only for sector admin */}
          {formData.role === 'sector_admin' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Sector Details</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sector Name *
                    </label>
                    <input
                      type="text"
                      name="sectorName"
                      value={formData.sectorName}
                      onChange={handleChange}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.sectorName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Nyarugenge Sector"
                    />
                    {errors.sectorName && <p className="text-red-500 text-xs mt-1">{errors.sectorName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sector Code *
                    </label>
                    <input
                      type="text"
                      name="sectorCode"
                      value={formData.sectorCode}
                      onChange={handleChange}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.sectorCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., NYAR"
                      maxLength="10"
                    />
                    {errors.sectorCode && <p className="text-red-500 text-xs mt-1">{errors.sectorCode}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province *
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.province ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Province</option>
                      {provinces.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                    {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Nyarugenge District"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : `Create ${formData.role === 'institution_admin' ? 'Institution' : 'Sector'} Admin`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewInstitutionForm;