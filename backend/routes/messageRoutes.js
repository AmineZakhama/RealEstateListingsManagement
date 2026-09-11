const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getUnreadCount } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(sendMessage)
  .get(protect, getMessages);

router.get('/unread-count', protect, getUnreadCount);

module.exports = router;
