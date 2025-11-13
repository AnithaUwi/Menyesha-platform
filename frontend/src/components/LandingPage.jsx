// LandingPage.jsx - Fixed navigation
import React from 'react';

const LandingPage = (props) => {
  const { onNavigate } = props;

  return (
    <div className="min-h-screen bg-gradient-to-br from-menyesha-blue to-blue-800">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 text-white">
        <div className="text-2xl font-bold">Menyesha</div>
        <div className="space-x-4">
          <button 
            onClick={() => onNavigate('complaint')}
            className="px-4 py-2 rounded-lg border border-white hover:bg-white hover:text-menyesha-blue transition"
          >
            Submit Complaint
          </button>
          <button 
            onClick={() => onNavigate('login')}
            className="px-4 py-2 rounded-lg bg-menyesha-gold text-white hover:bg-orange-600 transition"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center text-white py-20 px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Let Us Know, Let's Fix It Together
        </h1>
        <p className="text-xl mb-8 max-w-2xl">
          Report public service issues in your community. Track resolution progress. Build a better Rwanda.
          <br />
          <button 
            onClick={() => onNavigate('signup')}
            className="text-menyesha-gold hover:underline font-semibold mt-2"
          >
            Create a citizen account to track your complaints
          </button>
        </p>
        
        {/* Big Complaint Button */}
        <button 
          onClick={() => onNavigate('complaint')}
          className="bg-menyesha-gold text-white text-xl px-8 py-4 rounded-lg hover:bg-orange-600 transition transform hover:scale-105 mb-8"
        >
          Submit a Complaint
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-4xl">
          <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-2">Report Issues</h3>
            <p>Potholes, garbage, water problems, broken streetlights</p>
          </div>
          <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
            <p>See real-time updates on your complaint status</p>
          </div>
          <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-2">Build Community</h3>
            <p>Work with local officials to improve your area</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;