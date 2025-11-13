// Login.jsx - Updated version
import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Hardcoded Super Admin Credentials
  const SUPER_ADMIN_CREDENTIALS = {
    email: 'superadmin@menyesha.gov.rw',
    password: 'SuperAdmin123!'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Check for hardcoded super admin credentials first
      if (formData.email === SUPER_ADMIN_CREDENTIALS.email && 
          formData.password === SUPER_ADMIN_CREDENTIALS.password) {
        
        // Create super admin user object
        const superAdminUser = {
          id: 0, // Special ID for hardcoded super admin
          fullName: 'Menyesha Super Admin',
          email: SUPER_ADMIN_CREDENTIALS.email,
          role: 'super_admin'
        };

        // Store in localStorage
        localStorage.setItem('token', 'super-admin-hardcoded-token');
        localStorage.setItem('user', JSON.stringify(superAdminUser));
        
        setMessage({ type: 'success', text: 'Super Admin Login successful! Redirecting...' });
        
        // Redirect to super admin dashboard
        setTimeout(() => {
          window.location.href = '/#super-admin';
        }, 1500);
        return;
      }

      // Regular user login - your existing API call
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
        
        // Redirect based on role
        setTimeout(() => {
          if (response.data.user.role === 'citizen') {
            window.location.href = '/#dashboard';
          } else if (response.data.user.role === 'super_admin') {
            window.location.href = '/#super-admin';
          } else if (response.data.user.role === 'sector_admin') {
            window.location.href = '/#sector-admin';
          } else if (response.data.user.role === 'institution_admin') {
            window.location.href = '/#institution-admin';
          } else {
            window.location.href = '/dashboard';
          }
        }, 1500);
      }
    } catch (error) {
      setMessage({
        type: 'error', 
        text: error.response?.data?.error || 'Login failed. Please check your credentials.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const goToHome = () => {
    window.location.href = '/';
  };

  const goToSignUp = () => {
    window.location.href = '/signup';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <button
          onClick={goToHome}
          className="mb-6 text-menyesha-blue hover:underline flex items-center text-lg font-medium"
        >
          ← Back to Home
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-menyesha-blue text-center mb-2">
            Login to Menyesha
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Access your account to manage complaints
          </p>

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
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
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-menyesha-blue"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-menyesha-blue text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={goToSignUp}
                className="text-menyesha-blue hover:underline font-medium"
              >
                Sign up as citizen
              </button>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Demo Super Admin:</h3>
            <p className="text-sm text-yellow-700">
              Email: {SUPER_ADMIN_CREDENTIALS.email}<br/>
              Password: {SUPER_ADMIN_CREDENTIALS.password}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;