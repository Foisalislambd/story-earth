const express = require('express');
const { Op } = require('sequelize');
const { Series, Story, User } = require('../models');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get all published series with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { category, search, sortBy = 'createdAt' } = req.query;

    const whereClause = { isPublished: true };
    
    if (category) {
      whereClause.category = category;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const orderOptions = {
      latest: [['createdAt', 'DESC']],
      oldest: [['createdAt', 'ASC']],
      alphabetical: [['title', 'ASC']],
      stories: [[{ model: Story, as: 'stories' }, 'createdAt', 'DESC']]
    };

    const series = await Series.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Story,
          as: 'stories',
          where: { isPublished: true },
          required: false,
          attributes: ['id', 'title', 'slug', 'excerpt', 'publishedAt', 'partNumber'],
          order: [['partNumber', 'ASC']]
        }
      ],
      order: orderOptions[sortBy] || orderOptions.latest,
      limit,
      offset,
      distinct: true
    });

    // Add story count and completion status to each series
    const seriesWithStats = series.rows.map(serie => {
      const seriesData = serie.toJSON();
      seriesData.storyCount = seriesData.stories.length;
      seriesData.isComplete = serie.isCompleted;
      return seriesData;
    });

    res.json({
      series: seriesWithStats,
      pagination: {
        page,
        limit,
        total: series.count,
        pages: Math.ceil(series.count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching series:', error);
    res.status(500).json({ message: 'Error fetching series' });
  }
});

// Get series by slug
router.get('/:slug', async (req, res) => {
  try {
    const series = await Series.findOne({
      where: { 
        slug: req.params.slug,
        isPublished: true 
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar', 'bio']
        },
        {
          model: Story,
          as: 'stories',
          where: { isPublished: true },
          required: false,
          attributes: [
            'id', 'title', 'slug', 'excerpt', 'coverImage', 
            'publishedAt', 'partNumber', 'readingTime', 'viewsCount', 
            'likesCount', 'commentsCount'
          ],
          order: [['partNumber', 'ASC']]
        }
      ]
    });

    if (!series) {
      return res.status(404).json({ message: 'Series not found' });
    }

    // Increment view count if not author
    const userId = req.user?.id;
    if (!userId || userId !== series.authorId) {
      // Note: You might want to implement view tracking for series too
    }

    res.json(series);
  } catch (error) {
    logger.error('Error fetching series:', error);
    res.status(500).json({ message: 'Error fetching series' });
  }
});

// Create new series
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      coverImage,
      category,
      tags,
      estimatedParts,
      mature
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ 
        message: 'Title and description are required' 
      });
    }

    const series = await Series.create({
      title,
      description,
      coverImage: coverImage || '',
      category: category || '',
      tags: tags || [],
      estimatedParts: estimatedParts || null,
      mature: mature || false,
      authorId: req.user.id,
      isPublished: false // Start as draft
    });

    const seriesWithAuthor = await Series.findByPk(series.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    });

    res.status(201).json(seriesWithAuthor);
  } catch (error) {
    logger.error('Error creating series:', error);
    res.status(500).json({ message: 'Error creating series' });
  }
});

// Update series
router.put('/:id', auth, async (req, res) => {
  try {
    const series = await Series.findOne({
      where: {
        id: req.params.id,
        authorId: req.user.id
      }
    });

    if (!series) {
      return res.status(404).json({ message: 'Series not found' });
    }

    const {
      title,
      description,
      coverImage,
      category,
      tags,
      estimatedParts,
      mature,
      isCompleted,
      isPublished
    } = req.body;

    await series.update({
      title: title || series.title,
      description: description || series.description,
      coverImage: coverImage !== undefined ? coverImage : series.coverImage,
      category: category !== undefined ? category : series.category,
      tags: tags || series.tags,
      estimatedParts: estimatedParts !== undefined ? estimatedParts : series.estimatedParts,
      mature: mature !== undefined ? mature : series.mature,
      isCompleted: isCompleted !== undefined ? isCompleted : series.isCompleted,
      isPublished: isPublished !== undefined ? isPublished : series.isPublished
    });

    const updatedSeries = await Series.findByPk(series.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Story,
          as: 'stories',
          attributes: ['id', 'title', 'slug', 'partNumber', 'publishedAt'],
          order: [['partNumber', 'ASC']]
        }
      ]
    });

    res.json(updatedSeries);
  } catch (error) {
    logger.error('Error updating series:', error);
    res.status(500).json({ message: 'Error updating series' });
  }
});

// Delete series
router.delete('/:id', auth, async (req, res) => {
  try {
    const series = await Series.findOne({
      where: {
        id: req.params.id,
        authorId: req.user.id
      }
    });

    if (!series) {
      return res.status(404).json({ message: 'Series not found' });
    }

    // Check if series has stories
    const storiesInSeries = await Story.count({
      where: { seriesId: series.id }
    });

    if (storiesInSeries > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete series that contains stories. Please remove all stories from the series first.' 
      });
    }

    await series.destroy();

    res.json({ message: 'Series deleted successfully' });
  } catch (error) {
    logger.error('Error deleting series:', error);
    res.status(500).json({ message: 'Error deleting series' });
  }
});

// Get user's series
router.get('/user/my-series', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const series = await Series.findAndCountAll({
      where: { authorId: req.user.id },
      include: [
        {
          model: Story,
          as: 'stories',
          attributes: ['id', 'title', 'partNumber', 'isPublished'],
          order: [['partNumber', 'ASC']]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    // Add story count to each series
    const seriesWithStats = series.rows.map(serie => {
      const seriesData = serie.toJSON();
      seriesData.storyCount = seriesData.stories.length;
      seriesData.publishedStoryCount = seriesData.stories.filter(story => story.isPublished).length;
      return seriesData;
    });

    res.json({
      series: seriesWithStats,
      pagination: {
        page,
        limit,
        total: series.count,
        pages: Math.ceil(series.count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching user series:', error);
    res.status(500).json({ message: 'Error fetching user series' });
  }
});

// Add story to series
router.post('/:id/stories', auth, async (req, res) => {
  try {
    const { storyId, partNumber } = req.body;

    const series = await Series.findOne({
      where: {
        id: req.params.id,
        authorId: req.user.id
      }
    });

    if (!series) {
      return res.status(404).json({ message: 'Series not found' });
    }

    // Check if story exists and belongs to user
    const story = await Story.findOne({
      where: {
        id: storyId,
        authorId: req.user.id
      }
    });

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Check if story is already in a series
    if (story.seriesId) {
      return res.status(400).json({ 
        message: 'Story is already part of a series' 
      });
    }

    // If no part number provided, assign next available
    let assignedPartNumber = partNumber;
    if (!assignedPartNumber) {
      const maxPart = await Story.max('partNumber', {
        where: { seriesId: series.id }
      });
      assignedPartNumber = (maxPart || 0) + 1;
    }

    // Update story with series info
    await story.update({
      seriesId: series.id,
      partNumber: assignedPartNumber
    });

    // Update series total parts if needed
    const storyCount = await Story.count({
      where: { seriesId: series.id }
    });
    
    if (!series.totalParts || storyCount > series.totalParts) {
      await series.update({ totalParts: storyCount });
    }

    res.json({ 
      message: 'Story added to series successfully',
      story: {
        id: story.id,
        title: story.title,
        partNumber: assignedPartNumber
      }
    });
  } catch (error) {
    logger.error('Error adding story to series:', error);
    res.status(500).json({ message: 'Error adding story to series' });
  }
});

// Remove story from series
router.delete('/:id/stories/:storyId', auth, async (req, res) => {
  try {
    const series = await Series.findOne({
      where: {
        id: req.params.id,
        authorId: req.user.id
      }
    });

    if (!series) {
      return res.status(404).json({ message: 'Series not found' });
    }

    const story = await Story.findOne({
      where: {
        id: req.params.storyId,
        seriesId: series.id,
        authorId: req.user.id
      }
    });

    if (!story) {
      return res.status(404).json({ 
        message: 'Story not found in this series' 
      });
    }

    // Remove story from series
    await story.update({
      seriesId: null,
      partNumber: null
    });

    // Update series total parts
    const storyCount = await Story.count({
      where: { seriesId: series.id }
    });
    
    await series.update({ totalParts: storyCount });

    res.json({ message: 'Story removed from series successfully' });
  } catch (error) {
    logger.error('Error removing story from series:', error);
    res.status(500).json({ message: 'Error removing story from series' });
  }
});

// Reorder stories in series
router.put('/:id/reorder', auth, async (req, res) => {
  try {
    const { storyOrder } = req.body; // Array of { storyId, partNumber }

    const series = await Series.findOne({
      where: {
        id: req.params.id,
        authorId: req.user.id
      }
    });

    if (!series) {
      return res.status(404).json({ message: 'Series not found' });
    }

    // Update part numbers for all stories
    for (const item of storyOrder) {
      await Story.update(
        { partNumber: item.partNumber },
        {
          where: {
            id: item.storyId,
            seriesId: series.id,
            authorId: req.user.id
          }
        }
      );
    }

    res.json({ message: 'Series order updated successfully' });
  } catch (error) {
    logger.error('Error reordering series:', error);
    res.status(500).json({ message: 'Error reordering series' });
  }
});

module.exports = router;