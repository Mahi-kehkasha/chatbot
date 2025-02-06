const Message = require('../models/Message');

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const message = new Message({
      sender: req.user.userId,
      receiver: receiverId,
      content,
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user.userId, receiver: userId },
        { sender: userId, receiver: req.user.userId },
      ],
    }).sort('createdAt');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { sendMessage, getMessages };
