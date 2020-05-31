const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // check headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // turn the req value into an array to grab only the token
    // split at the space

    // set TOKEN from Bearer token in header
    token = req.headers.authorization.split(' ')[1];

    // set TOKEN from cookie
  } else if (req.cookies.token) {
    token = req.cookies.token
  }

  // make sure token exists
  if (!token) {
    return next(new ErrorResponse(`Not authorized to access this route`, 401));
  }

  // if token exists, verify it
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // currently logged in user
    req.user = await User.findById(decodedToken.id);
    next();
  } catch (err) {
    return next(new ErrorResponse(`Not authorized to access this route`, 401));
  }
});

// grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `Role of ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
