const express = require('express');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: { 
          message: existingUser.email === email 
            ? 'Email already registered' 
            : 'Username already taken' 
        }
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({
        error: { message: messages.join(', ') }
      });
    }
    
    res.status(500).json({
      error: { message: 'Server error during registration' }
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: { message: 'Email and password are required' }
      });
    }

    // Find user with password included
    const user = await User.scope('withPassword').findOne({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({
        error: { message: 'Invalid email or password' }
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({
        error: { message: 'Invalid email or password' }
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    delete user.dataValues.password;

    res.json({
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: { message: 'Server error during login' }
    });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          association: 'Followers',
          attributes: ['id', 'username', 'avatar']
        },
        {
          association: 'Following',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    });

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: { message: 'Server error fetching profile' }
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    const updates = {};

    if (username !== undefined) updates.username = username;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;

    // Check if username is taken (if changing)
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({
          error: { message: 'Username already taken' }
        });
      }
    }

    await req.user.update(updates);

    res.json({
      message: 'Profile updated successfully',
      user: req.user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({
        error: { message: messages.join(', ') }
      });
    }
    
    res.status(500).json({
      error: { message: 'Server error updating profile' }
    });
  }
});

// Follow/Unfollow user
router.post('/follow/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({
        error: { message: 'You cannot follow yourself' }
      });
    }

    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({
        error: { message: 'User not found' }
      });
    }

    const currentUser = await User.findByPk(currentUserId);
    const isFollowing = await currentUser.hasFollowing(targetUser);

    if (isFollowing) {
      await currentUser.removeFollowing(targetUser);
      res.json({ message: 'User unfollowed successfully', following: false });
    } else {
      await currentUser.addFollowing(targetUser);
      res.json({ message: 'User followed successfully', following: true });
    }
  } catch (error) {
    console.error('Follow/unfollow error:', error);
    res.status(500).json({
      error: { message: 'Server error during follow/unfollow' }
    });
  }
});

// Get user by username
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({
      where: { username },
      include: [
        {
          association: 'stories',
          where: { isPublished: true },
          required: false,
          attributes: ['id', 'title', 'excerpt', 'slug', 'coverImage', 'publishedAt', 'viewsCount', 'likesCount']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        error: { message: 'User not found' }
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: { message: 'Server error fetching user' }
    });
  }
});

module.exports = router;