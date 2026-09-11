const Message = require('../models/Message');
const Listing = require('../models/Listing');


const sendMessage = async (req, res) => {
  try {
    const { listingId, senderName, senderEmail, senderPhone, messageText } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const message = new Message({
      receiver: listing.agent,
      listing: listingId,
      senderName,
      senderEmail,
      senderPhone,
      message: messageText
    });

    const createdMessage = await message.save();
    res.status(201).json(createdMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.user._id })
      .populate('listing', 'title')
      .sort({ createdAt: -1 });
    
    // Mark them as read when fetched
    await Message.updateMany({ receiver: req.user._id, isRead: false }, { isRead: true });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user._id, isRead: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, getMessages, getUnreadCount };
