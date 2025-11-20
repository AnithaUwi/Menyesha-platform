
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const ComplaintForm = () => {
  const [formData, setFormData] = useState({
    // Problem details
    description: '',
    specific_location: '',
    
    // Rwanda location hierarchy
    province_id: '',
    district_id: '',
    sector_id: '',
    cell_id: '',
    village_id: '',
    
    // Institution
    institution_id: '',
    
    // Contact information (for anonymous users)
    anonymous_full_name: '',
    anonymous_email: '',
    anonymous_phone: '',
    
    // Evidence
    image_proof: null
  });

  const [locations, setLocations] = useState({
    provinces: [],
    districts: [],
    sectors: [],
    cells: [],
    villages: []
  });

  const [institutions, setInstitutions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  // Sample Rwanda location data (keep this as it's fine)
  const rwandaData = {
    provinces: [
      { id: 1, name: 'Kigali' },
      { id: 2, name: 'Southern' },
      { id: 3, name: 'Western' },
      { id: 4, name: 'Northern' },
      { id: 5, name: 'Eastern' }
    ],
    districts: [
      // Kigali districts
      { id: 1, name: 'Nyarugenge', province_id: 1 },
      { id: 2, name: 'Gasabo', province_id: 1 },
      { id: 3, name: 'Kicukiro', province_id: 1 },
      // Southern districts
      { id: 4, name: 'Muhanga', province_id: 2 },
      { id: 5, name: 'Huye', province_id: 2 },
    ],
    sectors: [
      // Gasabo sectors
      { id: 1, name: 'Remera', district_id: 2 },
      { id: 2, name: 'Gisozi', district_id: 2 },
      { id: 3, name: 'Kimironko', district_id: 2 },
      { id: 4, name: 'Kacyiru', district_id: 2 },
      // Kicukiro sectors
      { id: 5, name: 'Gikondo', district_id: 3 },
      { id: 6, name: 'Niboye', district_id: 3 },
    ],
    cells: [
      { id: 1, name: 'Gishushu', sector_id: 1 },
      { id: 2, name: 'Jabana', sector_id: 1 },
      { id: 3, name: 'Nyabugogo', sector_id: 1 },
    ],
    villages: [
      { id: 1, name: 'Gishushu I', cell_id: 1 },
      { id: 2, name: 'Gishushu II', cell_id: 1 },
    ]
  };

  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // Fetch REAL institutions from backend
  const fetchInstitutions = async () => {
    try {
      setLoadingInstitutions(true);
      console.log(' Fetching institutions from backend...');
      
      const response = await axios.get(`${config.apiUrl}/api/admin/all-institutions`);
      
      if (response.data.success) {
        setInstitutions(response.data.data);
        console.log(' Loaded institutions:', response.data.data);
      }
    } catch (error) {
      console.error(' Error fetching institutions:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load institutions. Please refresh the page.'
      });
    } finally {
      setLoadingInstitutions(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(user));
    }

    // Load location data
    setLocations(rwandaData);
    
    //  Load REAL institutions from backend
    fetchInstitutions();
  }, []);


  const handleProvinceChange = (provinceId) => {
    const filteredDistricts = rwandaData.districts.filter(d => d.province_id == provinceId);
    setLocations(prev => ({
      ...prev,
      districts: filteredDistricts,
      sectors: [],
      cells: [],
      villages: []
    }));
    setFormData(prev => ({
      ...prev,
      province_id: provinceId,
      district_id: '',
      sector_id: '',
      cell_id: '',
      village_id: ''
    }));
  };

  const handleDistrictChange = (districtId) => {
    const filteredSectors = rwandaData.sectors.filter(s => s.district_id == districtId);
    setLocations(prev => ({
      ...prev,
      sectors: filteredSectors,
      cells: [],
      villages: []
    }));
    setFormData(prev => ({
      ...prev,
      district_id: districtId,
      sector_id: '',
      cell_id: '',
      village_id: ''
    }));
  };

  const handleSectorChange = (sectorId) => {
    const filteredCells = rwandaData.cells.filter(c => c.sector_id == sectorId);
    setLocations(prev => ({
      ...prev,
      cells: filteredCells,
      villages: []
    }));
    setFormData(prev => ({
      ...prev,
      sector_id: sectorId,
      cell_id: '',
      village_id: ''
    }));
  };

  const handleCellChange = (cellId) => {
    const filteredVillages = rwandaData.villages.filter(v => v.cell_id == cellId);
    setLocations(prev => ({
      ...prev,
      villages: filteredVillages
    }));
    setFormData(prev => ({
      ...prev,
      cell_id: cellId,
      village_id: ''
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({
          type: 'error',
          text: 'Image size should be less than 5MB'
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setMessage({
          type: 'error',
          text: 'Please upload an image file'
        });
        return;
      }

      setFormData(prev => ({ ...prev, image_proof: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      
      // Clear any previous error messages
      setMessage('');
    }
  };

  //  Handle form submission 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Validate required fields
    if (!formData.image_proof) {
      setMessage({
        type: 'error',
        text: 'Please upload a photo of the problem as evidence'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add complaint data
      submitData.append('description', formData.description);
      submitData.append('specificLocation', formData.specific_location);
      
      // Add location data (convert IDs to names)
      const provinceName = locations.provinces.find(p => p.id == formData.province_id)?.name || '';
      const districtName = locations.districts.find(d => d.id == formData.district_id)?.name || '';
      const sectorName = locations.sectors.find(s => s.id == formData.sector_id)?.name || '';
      const cellName = locations.cells.find(c => c.id == formData.cell_id)?.name || '';
      const villageName = locations.villages.find(v => v.id == formData.village_id)?.name || '';
      
      submitData.append('province', provinceName);
      submitData.append('district', districtName);
      submitData.append('sector', sectorName);
      submitData.append('cell', cellName || '');
      submitData.append('village', villageName || '');
      
      // Get institution NAME from selected institution
      const selectedInstitution = institutions.find(i => i.id == formData.institution_id);
      if (selectedInstitution) {
        submitData.append('institution', selectedInstitution.name);
        submitData.append('category', selectedInstitution.category || 'General');
      } else {
        submitData.append('institution', '');
        submitData.append('category', 'General');
      }
      
      // Add image evidence
      if (formData.image_proof) {
        submitData.append('evidenceImages', formData.image_proof);
      }

      // Add anonymous user info if not logged in
      if (!isLoggedIn) {
        submitData.append('anonymousName', formData.anonymous_full_name || '');
        submitData.append('anonymousEmail', formData.anonymous_email || '');
        submitData.append('anonymousPhone', formData.anonymous_phone || '');
      }

      // Get auth token if logged in
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      };

      // Add authorization header if user is logged in
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      console.log('🔄 Sending complaint to backend...');

      // Send to backend
      const response = await axios.post(
        `${config.apiUrl}/api/complaints`,
        submitData,
        config
      );

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: ` ${response.data.message} ${isLoggedIn ? 'You can track it in your dashboard.' : 'Please save your email for status updates.'}`
        });

        // Reset form
        setFormData({
          description: '',
          specific_location: '',
          province_id: '',
          district_id: '',
          sector_id: '',
          cell_id: '',
          village_id: '',
          institution_id: '',
          anonymous_full_name: '',
          anonymous_email: '',
          anonymous_phone: '',
          image_proof: null
        });
        setImagePreview('');
        
        console.log(' Complaint submitted successfully:', response.data);
      }

    } catch (error) {
      console.error(' Complaint submission error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to submit complaint. Please try again.';
      
      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Function to go back to landing page
  const goToHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button  to go to landing page */}
        <button
          onClick={goToHome}
          className="mb-6 text-menyesha-blue hover:underline flex items-center text-lg font-medium"
        >
          ← Back to Home
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-menyesha-blue mb-2">
              Report a Community Issue
            </h2>
            <p className="text-gray-600">
              {isLoggedIn 
                ? `Welcome, ${userData?.fullName}! Your complaint will be saved to your account.`
                : 'Submit anonymously or create an account to track your complaints'
              }
            </p>
          </div>

          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* existing form sections */}
            {/* Problem Details Section */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Problem Details</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Problem Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-menyesha-blue"
                    placeholder="Describe the issue in detail (e.g., large pothole on main road, garbage pile-up for 2 weeks, broken streetlight causing safety issues...)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specific Location Details *
                  </label>
                  <input
                    type="text"
                    name="specific_location"
                    value={formData.specific_location}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-menyesha-blue"
                    placeholder="Exact location details (e.g., Near Simba Supermarket, next to the roundabout, in front of house number 25...)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo Evidence *
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                          </svg>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageChange}
                          required
                          className="hidden" 
                        />
                      </label>
                    </div>
                    
                    {imagePreview && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-w-xs rounded-lg border border-gray-300"
                        />
                      </div>
                    )}
                    
                    {!formData.image_proof && (
                      <p className="text-sm text-red-600">
                        * A photo is required as evidence for your complaint
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Rwanda Location Hierarchy Section  */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Location in Rwanda</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Province */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province *
                  </label>
                  <select
                    name="province_id"
                    value={formData.province_id}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-menyesha-blue"
                  >
                    <option value="">Select Province</option>
                    {locations.provinces.map(province => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District *
                  </label>
                  <select
                    name="district_id"
                    value={formData.district_id}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    required
                    disabled={!formData.province_id}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-menyesha-blue disabled:bg-gray-100"
                  >
                    <option value="">Select District</option>
                    {locations.districts.map(district => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sector *
                  </label>
                  <select
                    name="sector_id"
                    value={formData.sector_id}
                    onChange={(e) => handleSectorChange(e.target.value)}
                    required
                    disabled={!formData.district_id}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-menyesha-blue disabled:bg-gray-100"
                  >
                    <option value="">Select Sector</option>
                    {locations.sectors.map(sector => (
                      <option key={sector.id} value={sector.id}>
                        {sector.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cell */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cell
                  </label>
                  <select
                    name="cell_id"
                    value={formData.cell_id}
                    onChange={(e) => handleCellChange(e.target.value)}
                    disabled={!formData.sector_id}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-menyesha-blue disabled:bg-gray-100"
                  >
                    <option value="">Select Cell (Optional)</option>
                    {locations.cells.map(cell => (
                      <option key={cell.id} value={cell.id}>
                        {cell.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Village */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Village
                  </label>
                  <select
                    name="village_id"
                    value={formData.village_id}
                    onChange={handleChange}
                    disabled={!formData.cell_id}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-menyesha-blue disabled:bg-gray-100"
                  >
                    <option value="">Select Village (Optional)</option>
                    {locations.villages.map(village => (
                      <option key={village.id} value={village.id}>
                        {village.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/*  Institution Dropdown with REAL data */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Related Institution
                  </label>
                  <select
                    name="institution_id"
                    value={formData.institution_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-menyesha-blue"
                    disabled={loadingInstitutions}
                  >
                    <option value="">Select Institution (Optional)</option>
                    {loadingInstitutions ? (
                      <option value="" disabled>Loading institutions...</option>
                    ) : (
                      institutions.map(institution => (
                        <option key={institution.id} value={institution.id}>
                          {institution.name} - {institution.category}
                        </option>
                      ))
                    )}
                  </select>
                  {loadingInstitutions && (
                    <p className="text-xs text-gray-500 mt-1">Loading registered institutions...</p>
                  )}
                  {!loadingInstitutions && institutions.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">No institutions registered yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Section (for anonymous users) - KEEP EXISTING */}
            {!isLoggedIn && (
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Contact Information</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Provide your contact details to receive updates about your complaint. 
                  Or <a href="/register" className="text-menyesha-blue hover:underline">create an account</a> to track all your complaints.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="anonymous_full_name"
                      value={formData.anonymous_full_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-menyesha-blue"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="anonymous_email"
                      value={formData.anonymous_email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-menyesha-blue"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="anonymous_phone"
                      value={formData.anonymous_phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-menyesha-blue"
                      placeholder="+250 XXX XXX XXX"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-menyesha-gold text-white text-lg px-12 py-4 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
              
              <p className="mt-4 text-sm text-gray-500">
                * Required fields. {isLoggedIn 
                  ? 'Your complaint will be saved to your account dashboard.' 
                  : 'You will receive status updates via email.'
                }
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;