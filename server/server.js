const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const socketio = require('socket.io');
const http = require('http');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const auth = require('./middleware/auth');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const { initializeDemoUsers } = require('./controllers/authController');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
});

app.use(
  cors({
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: true,
    optionsSuccessStatus: 204,
  })
);

// Add OPTIONS handling for preflight requests
app.options('*', cors());

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/messages', auth, messageRoutes);

// Connect to MongoDB with better error handling
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Add timeout
    family: 4, // Use IPv4, skip trying IPv6
  })
  .then(async () => {
    console.log('✓ Connected to MongoDB at:', process.env.MONGODB_URI);
    await initializeDemoUsers();
    console.log('✓ Demo users initialized');

    // Verify demo users
    const demoUser = await User.findOne({ email: 'john@demo.com' });
    if (demoUser) {
      console.log('✓ Demo users verified');
    } else {
      console.error('Demo users not found');
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Track online users
const onlineUsers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('login', async (userId) => {
    try {
      // Update user's online status in database
      await User.findByIdAndUpdate(userId, { isOnline: true });

      onlineUsers.set(userId, socket.id);
      socket.userId = userId; // Store userId in socket object
      io.emit('userOnline', userId);

      console.log(`User ${userId} is now online`);
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  });

  socket.on('sendMessage', async (data) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', data);
    }
  });

  socket.on('disconnect', async () => {
    try {
      if (socket.userId) {
        // Update user's online status and lastActive time in database
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastActive: new Date(),
        });

        onlineUsers.delete(socket.userId);
        io.emit('userOffline', socket.userId);
        console.log(`User ${socket.userId} is now offline`);
      }
    } catch (error) {
      console.error('Error updating offline status:', error);
    }
  });

  socket.on('typing', (data) => {
    const receiverSocketId = onlineUsers.get(data.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userTyping', socket.userId);
    }
  });

  socket.on('stopTyping', (data) => {
    const receiverSocketId = onlineUsers.get(data.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userStoppedTyping', socket.userId);
    }
  });

  socket.on('callUser', (data) => {
    io.to(onlineUsers.get(data.userToCall)).emit('callUser', {
      signal: data.signalData,
      from: data.from,
      isVideo: data.isVideo,
    });
  });

  socket.on('answerCall', (data) => {
    io.to(onlineUsers.get(data.to)).emit('callAccepted', data.signal);
  });
});

// Add periodic online status check
setInterval(async () => {
  try {
    const users = await User.find({ isOnline: true });
    for (const user of users) {
      const isStillConnected = onlineUsers.has(user._id.toString());
      if (!isStillConnected) {
        await User.findByIdAndUpdate(user._id, {
          isOnline: false,
          lastActive: new Date(),
        });
        io.emit('userOffline', user._id);
      }
    }
  } catch (error) {
    console.error('Error in status check:', error);
  }
}, 30000); // Check every 30 seconds

// Add demo users if they don't exist
async function generateDemoMessages() {
  const users = await User.find({});
  const messageTemplates = [
    'Hey! Just checked the latest deployment, everything looks good! 🚀',
    "Can you review the PR I just pushed? It's for the new authentication feature 🔐",
    'Great presentation in the morning standup! Really clear explanation 👏',
    "When's our next team meeting? Need to discuss the roadmap 📅",
    'Thanks for helping with the bug fix yesterday! Saved me hours 🙏',
    'The new UI looks amazing! Users will love it 😍',
    'Just updated the documentation. Can you take a look? 📚',
    "Sprint planning at 2 PM today, don't forget! ⏰",
    "I'm seeing some issues in production. Can we hop on a quick call? 🔧",
    'The client loved our latest feature demo! 🎉',
    'Need your input on the architecture decision 🤔',
    'Just pushed the hotfix. Can you verify on staging? 🔍',
    'Great job on hitting the milestone! 🎯',
    'Working from home today, but available on Slack 🏠',
    "Let's sync up on the project timeline tomorrow 📋",
  ];

  const Message = require('./models/Message');
  await Message.deleteMany({}); // Clear existing demo messages

  // Generate messages between users
  for (const sender of users) {
    for (const receiver of users) {
      if (sender._id.toString() !== receiver._id.toString()) {
        const numMessages = Math.floor(Math.random() * 5) + 1; // 1-5 messages

        for (let i = 0; i < numMessages; i++) {
          const message = new Message({
            sender: sender._id,
            receiver: receiver._id,
            content:
              messageTemplates[
                Math.floor(Math.random() * messageTemplates.length)
              ],
            read: Math.random() > 0.5,
            createdAt: new Date(
              Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
            ), // Random time in last 7 days
          });
          await message.save();
        }
      }
    }
  }
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add this at the top of server.js for better error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});
