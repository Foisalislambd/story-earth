const express = require('express');
const { Op } = require('sequelize');
const { Story, User, Like, Comment } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all published stories with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { category, tag, search, sortBy = 'publishedAt' } = req.query;

    const whereClause = { isPublished: true };
    
    if (category) {
      whereClause.category = category;
    }
    
    if (tag) {
      whereClause.tags = { [Op.contains]: [tag] };
    }
    
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
        { excerpt: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const orderOptions = {
      latest: [['publishedAt', 'DESC']],
      popular: [['likesCount', 'DESC'], ['viewsCount', 'DESC']],
      oldest: [['publishedAt', 'ASC']]
    };

    const stories = await Story.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar']
        }
      ],
      order: orderOptions[sortBy] || orderOptions.latest,
      limit,
      offset,
      distinct: true
    });

    res.json({
      stories: stories.rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(stories.count / limit),
        totalStories: stories.count,
        hasNext: page < Math.ceil(stories.count / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({
      error: { message: 'Server error fetching stories' }
    });
  }
});

// Get story by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const story = await Story.findOne({
      where: { slug, isPublished: true },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar', 'bio']
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'avatar']
            }
          ],
          where: { parentId: null },
          required: false,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!story) {
      return res.status(404).json({
        error: { message: 'Story not found' }
      });
    }

    // Increment view count
    await story.increment('viewsCount');

    res.json({ story });
  } catch (error) {
    console.error('Get story error:', error);
    res.status(500).json({
      error: { message: 'Server error fetching story' }
    });
  }
});

// Create new story
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, tags, category, isPublished } = req.body;

    const story = await Story.create({
      title,
      content,
      excerpt,
      coverImage,
      tags: tags || [],
      category,
      isPublished: isPublished || false,
      authorId: req.user.id
    });

    // Update user's story count
    if (isPublished) {
      await req.user.increment('storiesCount');
    }

    const storyWithAuthor = await Story.findByPk(story.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    });

    res.status(201).json({
      message: 'Story created successfully',
      story: storyWithAuthor
    });
  } catch (error) {
    console.error('Create story error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({
        error: { message: messages.join(', ') }
      });
    }
    
    res.status(500).json({
      error: { message: 'Server error creating story' }
    });
  }
});

// Update story
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, coverImage, tags, category, isPublished } = req.body;

    const story = await Story.findByPk(id);

    if (!story) {
      return res.status(404).json({
        error: { message: 'Story not found' }
      });
    }

    if (story.authorId !== req.user.id) {
      return res.status(403).json({
        error: { message: 'Access denied. You can only edit your own stories.' }
      });
    }

    const wasPublished = story.isPublished;
    
    await story.update({
      title,
      content,
      excerpt,
      coverImage,
      tags: tags || story.tags,
      category,
      isPublished
    });

    // Update user's story count if publication status changed
    if (!wasPublished && isPublished) {
      await req.user.increment('storiesCount');
    } else if (wasPublished && !isPublished) {
      await req.user.decrement('storiesCount');
    }

    const updatedStory = await Story.findByPk(story.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    });

    res.json({
      message: 'Story updated successfully',
      story: updatedStory
    });
  } catch (error) {
    console.error('Update story error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({
        error: { message: messages.join(', ') }
      });
    }
    
    res.status(500).json({
      error: { message: 'Server error updating story' }
    });
  }
});

// Delete story
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const story = await Story.findByPk(id);

    if (!story) {
      return res.status(404).json({
        error: { message: 'Story not found' }
      });
    }

    if (story.authorId !== req.user.id) {
      return res.status(403).json({
        error: { message: 'Access denied. You can only delete your own stories.' }
      });
    }

    // Update user's story count if story was published
    if (story.isPublished) {
      await req.user.decrement('storiesCount');
    }

    await story.destroy();

    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({
      error: { message: 'Server error deleting story' }
    });
  }
});

// Like/Unlike story
router.post('/:id/like', auth, async (req, res) => {
  try {
    const { id: storyId } = req.params;
    const userId = req.user.id;

    const story = await Story.findByPk(storyId);
    if (!story) {
      return res.status(404).json({
        error: { message: 'Story not found' }
      });
    }

    const existingLike = await Like.findOne({
      where: { userId, storyId }
    });

    if (existingLike) {
      await existingLike.destroy();
      await story.decrement('likesCount');
      res.json({ message: 'Story unliked', liked: false });
    } else {
      await Like.create({ userId, storyId });
      await story.increment('likesCount');
      res.json({ message: 'Story liked', liked: true });
    }
  } catch (error) {
    console.error('Like story error:', error);
    res.status(500).json({
      error: { message: 'Server error processing like' }
    });
  }
});

// Add comment to story
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { id: storyId } = req.params;
    const { content, parentId } = req.body;

    const story = await Story.findByPk(storyId);
    if (!story) {
      return res.status(404).json({
        error: { message: 'Story not found' }
      });
    }

    const comment = await Comment.create({
      content,
      userId: req.user.id,
      storyId,
      parentId: parentId || null
    });

    await story.increment('commentsCount');

    const commentWithAuthor = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment: commentWithAuthor
    });
  } catch (error) {
    console.error('Add comment error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({
        error: { message: messages.join(', ') }
      });
    }
    
    res.status(500).json({
      error: { message: 'Server error adding comment' }
    });
  }
});

// Get user's own stories (drafts + published)
router.get('/user/my-stories', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const stories = await Story.findAndCountAll({
      where: { authorId: req.user.id },
      order: [['updatedAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      stories: stories.rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(stories.count / limit),
        totalStories: stories.count
      }
    });
  } catch (error) {
    console.error('Get user stories error:', error);
    res.status(500).json({
      error: { message: 'Server error fetching user stories' }
    });
  }
});

module.exports = router;