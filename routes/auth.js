const express = require('express');
const { register, login, getMe } = require('../controllers/auth');

const router = express.Router();

// middleware to let us getMe
const { protect } = require('../middleware/auth');

// router.route('/register').post(register); => works just as the one below
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
