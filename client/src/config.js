const isDevelopment = process.env.NODE_ENV === 'development';

const config = {
  API_URL: isDevelopment
    ? 'http://localhost:5001'
    : 'https://chatbot-mk-api.onrender.com',
  SOCKET_URL: isDevelopment
    ? 'http://localhost:5001'
    : 'https://chatbot-mk-api.onrender.com',
};

export default config;
