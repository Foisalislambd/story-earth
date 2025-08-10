const express = require('express');
const { Share, Story, User } = require('../models');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Record a story share
router.post('/', async (req, res) => {
  try {
    const { storyId, platform, referrer } = req.body;
    const userId = req.user?.id || null;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    // Check if story exists and is published
    const story = await Story.findOne({
      where: {
        id: storyId,
        isPublished: true
      }
    });

    if (!story) {
      return res.status(404).json({ message: 'Story not found or not published' });
    }

    // Check if sharing is allowed for this story
    if (!story.allowSharing) {
      return res.status(403).json({ message: 'Sharing is disabled for this story' });
    }

    // Create share record
    const share = await Share.create({
      userId,
      storyId,
      platform,
      ipAddress,
      userAgent,
      referrer
    });

    // Update story shares count
    await Story.increment('sharesCount', { where: { id: storyId } });

    res.status(201).json({
      message: 'Share recorded successfully',
      share: {
        id: share.id,
        platform: share.platform,
        createdAt: share.createdAt
      }
    });
  } catch (error) {
    logger.error('Error recording share:', error);
    res.status(500).json({ message: 'Error recording share' });
  }
});

// Get share statistics for a story
router.get('/story/:storyId/stats', async (req, res) => {
  try {
    const { storyId } = req.params;

    // Check if story exists
    const story = await Story.findByPk(storyId);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Get share statistics by platform
    const shareStats = await Share.findAll({
      where: { storyId },
      attributes: [
        'platform',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['platform'],
      raw: true
    });

    // Get total shares
    const totalShares = await Share.count({
      where: { storyId }
    });

    // Get recent shares (last 10)
    const recentShares = await Share.findAll({
      where: { storyId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.json({
      totalShares,
      sharesByPlatform: shareStats,
      recentShares
    });
  } catch (error) {
    logger.error('Error fetching share stats:', error);
    res.status(500).json({ message: 'Error fetching share statistics' });
  }
});

// Get user's sharing history
router.get('/user/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const shares = await Share.findAndCountAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Story,
          as: 'story',
          attributes: ['id', 'title', 'slug', 'excerpt'],
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'avatar']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      shares: shares.rows,
      pagination: {
        page,
        limit,
        total: shares.count,
        pages: Math.ceil(shares.count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching user share history:', error);
    res.status(500).json({ message: 'Error fetching share history' });
  }
});

// Get trending stories based on shares
router.get('/trending', async (req, res) => {
  try {
    const { timeframe = '7d', limit = 10 } = req.query;
    
    // Calculate date threshold based on timeframe
    const now = new Date();
    let dateThreshold;
    
    switch (timeframe) {
      case '1d':
        dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const trendingStories = await Story.findAll({
      where: {
        isPublished: true,
        publishedAt: {
          [Op.gte]: dateThreshold
        }
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Share,
          as: 'shares',
          where: {
            createdAt: {
              [Op.gte]: dateThreshold
            }
          },
          required: false
        }
      ],
      order: [
        [sequelize.literal('shares_count'), 'DESC'],
        ['likesCount', 'DESC'],
        ['viewsCount', 'DESC']
      ],
      limit: parseInt(limit)
    });

    res.json({ trendingStories });
  } catch (error) {
    logger.error('Error fetching trending stories:', error);
    res.status(500).json({ message: 'Error fetching trending stories' });
  }
});

// Get share analytics for author's stories
router.get('/analytics', auth, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    // Calculate date threshold
    const now = new Date();
    let dateThreshold;
    
    switch (timeframe) {
      case '7d':
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateThreshold = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get user's stories
    const userStories = await Story.findAll({
      where: { authorId: req.user.id },
      attributes: ['id']
    });

    const storyIds = userStories.map(story => story.id);

    if (storyIds.length === 0) {
      return res.json({
        totalShares: 0,
        sharesByPlatform: [],
        sharesByStory: [],
        sharesOverTime: []
      });
    }

    // Get total shares for user's stories
    const totalShares = await Share.count({
      where: {
        storyId: { [Op.in]: storyIds },
        createdAt: { [Op.gte]: dateThreshold }
      }
    });

    // Get shares by platform
    const sharesByPlatform = await Share.findAll({
      where: {
        storyId: { [Op.in]: storyIds },
        createdAt: { [Op.gte]: dateThreshold }
      },
      attributes: [
        'platform',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['platform'],
      raw: true
    });

    // Get shares by story
    const sharesByStory = await Share.findAll({
      where: {
        storyId: { [Op.in]: storyIds },
        createdAt: { [Op.gte]: dateThreshold }
      },
      include: [
        {
          model: Story,
          as: 'story',
          attributes: ['id', 'title', 'slug']
        }
      ],
      attributes: [
        'storyId',
        [sequelize.fn('COUNT', sequelize.col('Share.id')), 'count']
      ],
      group: ['storyId', 'story.id'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 10
    });

    res.json({
      totalShares,
      sharesByPlatform,
      sharesByStory,
      timeframe
    });
  } catch (error) {
    logger.error('Error fetching share analytics:', error);
    res.status(500).json({ message: 'Error fetching share analytics' });
  }
});

module.exports = router;