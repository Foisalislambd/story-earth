const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        error: { message: 'Access denied. No token provided.' } 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ 
        error: { message: 'Token is not valid.' } 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: { message: 'Token is not valid.' } 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: { message: 'Token has expired.' } 
      });
    }
    
    logger.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: { message: 'Server error during authentication.' } 
    });
  }
};

module.exports = auth;