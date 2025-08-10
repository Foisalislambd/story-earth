const express = require('express');
const { Op } = require('sequelize');
const { Bookmark, Story, User } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's bookmarks
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { collection, search } = req.query;

    const whereClause = { userId: req.user.id };
    
    if (collection) {
      whereClause.collectionName = collection;
    }

    let searchWhere = {};
    if (search) {
      searchWhere = {
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { excerpt: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const bookmarks = await Bookmark.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Story,
          as: 'story',
          where: searchWhere,
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
      bookmarks: bookmarks.rows,
      pagination: {
        page,
        limit,
        total: bookmarks.count,
        pages: Math.ceil(bookmarks.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ message: 'Error fetching bookmarks' });
  }
});

// Get user's bookmark collections
router.get('/collections', auth, async (req, res) => {
  try {
    const collections = await Bookmark.findAll({
      where: { userId: req.user.id },
      attributes: ['collectionName'],
      group: ['collectionName'],
      raw: true
    });

    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => {
        const count = await Bookmark.count({
          where: {
            userId: req.user.id,
            collectionName: collection.collectionName
          }
        });
        return {
          name: collection.collectionName,
          count
        };
      })
    );

    res.json({ collections: collectionsWithCounts });
  } catch (error) {
    console.error('Error fetching bookmark collections:', error);
    res.status(500).json({ message: 'Error fetching bookmark collections' });
  }
});

// Add bookmark
router.post('/', auth, async (req, res) => {
  try {
    const { storyId, collectionName, notes, tags } = req.body;

    // Check if story exists
    const story = await Story.findByPk(storyId);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Check if bookmark already exists
    const existingBookmark = await Bookmark.findOne({
      where: {
        userId: req.user.id,
        storyId
      }
    });

    if (existingBookmark) {
      return res.status(409).json({ message: 'Story already bookmarked' });
    }

    const bookmark = await Bookmark.create({
      userId: req.user.id,
      storyId,
      collectionName: collectionName || 'Default',
      notes: notes || '',
      tags: tags || []
    });

    // Update story bookmarks count
    await Story.increment('bookmarksCount', { where: { id: storyId } });

    const bookmarkWithStory = await Bookmark.findByPk(bookmark.id, {
      include: [
        {
          model: Story,
          as: 'story',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'avatar']
            }
          ]
        }
      ]
    });

    res.status(201).json(bookmarkWithStory);
  } catch (error) {
    console.error('Error creating bookmark:', error);
    res.status(500).json({ message: 'Error creating bookmark' });
  }
});

// Update bookmark
router.put('/:id', auth, async (req, res) => {
  try {
    const { collectionName, notes, tags } = req.body;
    
    const bookmark = await Bookmark.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    await bookmark.update({
      collectionName: collectionName || bookmark.collectionName,
      notes: notes !== undefined ? notes : bookmark.notes,
      tags: tags || bookmark.tags
    });

    const updatedBookmark = await Bookmark.findByPk(bookmark.id, {
      include: [
        {
          model: Story,
          as: 'story',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'avatar']
            }
          ]
        }
      ]
    });

    res.json(updatedBookmark);
  } catch (error) {
    console.error('Error updating bookmark:', error);
    res.status(500).json({ message: 'Error updating bookmark' });
  }
});

// Remove bookmark
router.delete('/:id', auth, async (req, res) => {
  try {
    const bookmark = await Bookmark.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    const storyId = bookmark.storyId;
    await bookmark.destroy();

    // Update story bookmarks count
    await Story.decrement('bookmarksCount', { where: { id: storyId } });

    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ message: 'Error removing bookmark' });
  }
});

// Remove bookmark by story ID
router.delete('/story/:storyId', auth, async (req, res) => {
  try {
    const bookmark = await Bookmark.findOne({
      where: {
        storyId: req.params.storyId,
        userId: req.user.id
      }
    });

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    await bookmark.destroy();

    // Update story bookmarks count
    await Story.decrement('bookmarksCount', { where: { id: req.params.storyId } });

    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ message: 'Error removing bookmark' });
  }
});

// Check if story is bookmarked
router.get('/check/:storyId', auth, async (req, res) => {
  try {
    const bookmark = await Bookmark.findOne({
      where: {
        storyId: req.params.storyId,
        userId: req.user.id
      }
    });

    res.json({ isBookmarked: !!bookmark, bookmark });
  } catch (error) {
    console.error('Error checking bookmark:', error);
    res.status(500).json({ message: 'Error checking bookmark' });
  }
});

module.exports = router;