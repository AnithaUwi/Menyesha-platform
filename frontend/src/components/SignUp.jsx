// SignUp.jsx - Citizen registration with ID upload
import React, { useState } from 'react';
import axios from 'axios';

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    idType: '',
    idCard: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [idPreview, setIdPreview] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      setIsSubmitting(false);
      return;
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('fullName', formData.fullName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('password', formData.password);
      submitData.append('idType', formData.idType);
      if (formData.idCard) {
        submitData.append('idCard', formData.idCard);
      }

      // In SignUp.jsx - update the handleSubmit function
const response = await axios.post('http://localhost:5000/api/auth/register', submitData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'Account created successfully! Redirecting to login...'
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Registration failed. Please try again.'
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

  const handleIdUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 2MB for ID)
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'ID image should be less than 2MB' });
        return;
      }

      setFormData(prev => ({ ...prev, idCard: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setIdPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const goToHome = () => {
    window.location.href = '/';
  };

  const goToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={goToHome}
          className="mb-6 text-menyesha-blue hover:underline flex items-center text-lg font-medium"
        >
          ← Back to Home
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-menyesha-blue mb-2">
              Create Citizen Account
            </h2>
            <p className="text-gray-600">
              Join Menyesha to report and track community issues
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-menyesha-blue"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-menyesha-blue"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-menyesha-blue"
                    placeholder="+250 XXX XXX XXX"
                  />
                </div>
              </div>
            </div>

            {/* ID Verification (Optional) */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ID Verification (Optional)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload your ID card or passport for account verification. This helps ensure the security of our platform.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Type
                  </label>
                  <select
                    name="idType"
                    value={formData.idType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-menyesha-blue"
                  >
                    <option value="">Select ID Type (Optional)</option>
                    <option value="national_id">National ID</option>
                    <option value="passport">Passport</option>
                    <option value="driving_license">Driving License</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload ID Document
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload ID</span>
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 2MB)</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleIdUpload}
                        className="hidden" 
                      />
                    </label>
                  </div>
                  
                  {idPreview && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">ID Preview:</p>
                      <img 
                        src={idPreview} 
                        alt="ID Preview" 
                        className="max-w-xs rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-menyesha-blue"
                    placeholder="At least 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-menyesha-blue"
                    placeholder="Re-enter your password"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-menyesha-blue text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Citizen Account'}
              </button>
              
              <p className="mt-4 text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={goToLogin}
                  className="text-menyesha-blue hover:underline font-medium"
                >
                  Login here
                </button>
              </p>

              <p className="mt-2 text-xs text-gray-500">
                * Only citizens can self-register. Institution and sector administrators are registered by platform administrators for security purposes.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;