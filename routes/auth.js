const express = require('express');
const { register, login } = require('../controllers/auth');

const router = express.Router();

// router.route('/register').post(register); => works just as the one below
router.post('/register', register);
router.post('/login', login);

module.exports = router;
