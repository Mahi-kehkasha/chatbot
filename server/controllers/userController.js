const User = require('../models/User');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, profilePicture } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username) user.username = username;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getContacts = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.userId } })
      .select('-password')
      .sort('username');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile, getContacts };
