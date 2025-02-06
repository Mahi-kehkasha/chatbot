const isDevelopment = process.env.NODE_ENV === 'development';
const prodUrl = 'https://chatbot-mk-api.onrender.com';
const devUrl = 'http://localhost:5001';

const config = {
  API_URL: isDevelopment ? devUrl : prodUrl,
  SOCKET_URL: isDevelopment ? devUrl : prodUrl,
  withCredentials: true,
};

export default config;
