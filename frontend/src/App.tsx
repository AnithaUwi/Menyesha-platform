
import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import ComplaintForm from './components/ComplaintForm';
import Login from './components/Login';
import SignUp from './components/SignUp';
import CitizenDashboard from './components/CitizenDashboard';
import SectorDashboard from './components/SectorDashboard';
import InstitutionDashboard from './components/InstitutionDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import './App.css';

// Define the possible page types 
type PageType = 'home' | 'complaint' | 'login' | 'signup' | 'dashboard' | 'sector-admin' |'institution-admin' |'super-admin';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '') as PageType;
      setCurrentPage(hash || 'home');
    };

    window.addEventListener('popstate', handlePopState);
    
    // Set initial page from URL
    const initialHash = window.location.hash.replace('#', '') as PageType;
    if (initialHash && ['home', 'complaint', 'login', 'signup', 'dashboard','sector-admin','institution-admin','super-admin'].includes(initialHash)) {
      setCurrentPage(initialHash);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation function with proper typing
  const navigateTo = (page: PageType) => {
    setCurrentPage(page);
    window.location.hash = page;
  };

  const renderPage = () => {
    console.log('Rendering page:', currentPage);
    
    switch (currentPage) {
      case 'complaint':
        return <ComplaintForm />;
      case 'login':
        return <Login />;
      case 'signup':
        return <SignUp />;
      case 'dashboard':
        return <CitizenDashboard />;
      case 'sector-admin':
        return <SectorDashboard />;
      case 'institution-admin':
        return <InstitutionDashboard />;
      case 'super-admin':
        return <SuperAdminDashboard />;
      case 'home':
      default:
        return <LandingPage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;