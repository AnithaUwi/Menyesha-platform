const config = {
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://menyesha-backend.onrender.com'  
    : 'http://localhost:5000'
};

export default config;