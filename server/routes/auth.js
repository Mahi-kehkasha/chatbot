const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/login', async (req, res) => {
  console.log('Login attempt received:', req.body);
  try {
    await login(req, res);
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', register);

module.exports = router;
