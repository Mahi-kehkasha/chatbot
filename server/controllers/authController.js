const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Move demoUsers inside an async function
const initializeDemoUsers = async () => {
  const demoUsers = [
    {
      username: 'John Doe',
      email: 'john@demo.com',
      password: await bcrypt.hash('demo123', 12),
      profilePicture: `https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff&size=128`,
      role: 'Senior Developer',
      status: '🚀 Working on new features',
    },
    {
      username: 'Sarah Smith',
      email: 'sarah@demo.com',
      password: await bcrypt.hash('demo123', 12),
      profilePicture: `https://ui-avatars.com/api/?name=Sarah+Smith&background=7C3AED&color=fff&size=128`,
      role: 'Product Manager',
      status: '📊 Planning sprint',
    },
  ];

  // Create demo users
  for (const user of demoUsers) {
    await User.findOneAndUpdate({ email: user.email }, user, { upsert: true });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login, initializeDemoUsers };
