const express = require('express');
const router = express.Router();
const { registerUser, authUser, getUserProfile, toggleFavorite, getFavorites, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateProfile);
router.post('/favorites/:id', protect, toggleFavorite);
router.get('/favorites', protect, getFavorites);

module.exports = router;
