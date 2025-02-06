const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getContacts,
} = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.get('/contacts', auth, getContacts);

module.exports = router;
