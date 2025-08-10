const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Story = sequelize.define('Story', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Title is required' },
      len: {
        args: [1, 200],
        msg: 'Title must be between 1 and 200 characters'
      }
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Content is required' },
      len: {
        args: [10, 50000],
        msg: 'Content must be between 10 and 50,000 characters'
      }
    }
  },
  excerpt: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  coverImage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      len: {
        args: [0, 50],
        msg: 'Category must be less than 50 characters'
      }
    }
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isDraft: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  visibility: {
    type: DataTypes.ENUM('public', 'unlisted', 'private'),
    defaultValue: 'public'
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  viewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  sharesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  bookmarksCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  readingTime: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true
  },
  contentType: {
    type: DataTypes.ENUM('story', 'poem', 'article', 'review'),
    defaultValue: 'story'
  },
  language: {
    type: DataTypes.STRING(5),
    defaultValue: 'en'
  },
  mature: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  allowComments: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  allowSharing: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  seriesId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Series',
      key: 'id'
    }
  },
  partNumber: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  collaborators: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  timestamps: true,
  hooks: {
    beforeSave: (story) => {
      // Generate excerpt if not provided
      if (!story.excerpt && story.content) {
        story.excerpt = story.content.substring(0, 300).replace(/<[^>]*>/g, '') + '...';
      }
      
      // Calculate reading time (average 200 words per minute)
      if (story.content) {
        const wordCount = story.content.split(/\s+/).length;
        story.readingTime = Math.ceil(wordCount / 200);
      }
      
      // Generate slug if not provided
      if (!story.slug && story.title) {
        story.slug = story.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 100) + '-' + Date.now();
      }
      
      // Set publishedAt when publishing
      if (story.isPublished && !story.publishedAt) {
        story.publishedAt = new Date();
      }
      
      // Update draft status
      if (story.isPublished) {
        story.isDraft = false;
      }
    }
  },
  indexes: [
    { fields: ['authorId'] },
    { fields: ['isPublished'] },
    { fields: ['publishedAt'] },
    { fields: ['category'] },
    { fields: ['tags'], using: 'gin' },
    { fields: ['visibility'] },
    { fields: ['contentType'] },
    { fields: ['seriesId'] },
    { fields: ['collaborators'], using: 'gin' },
    { fields: ['metadata'], using: 'gin' }
  ]
});

// Define associations
Story.associate = (models) => {
  // Story belongs to User (author)
  Story.belongsTo(models.User, {
    foreignKey: 'authorId',
    as: 'author'
  });
  
  // Story has many likes
  Story.hasMany(models.Like, {
    foreignKey: 'storyId',
    as: 'likes'
  });
  
  // Story has many comments
  Story.hasMany(models.Comment, {
    foreignKey: 'storyId',
    as: 'comments'
  });

  // Story has many bookmarks
  Story.hasMany(models.Bookmark, {
    foreignKey: 'storyId',
    as: 'bookmarks'
  });

  // Story has many shares
  Story.hasMany(models.Share, {
    foreignKey: 'storyId',
    as: 'shares'
  });

  // Story belongs to Series (optional)
  Story.belongsTo(models.Series, {
    foreignKey: 'seriesId',
    as: 'series'
  });

  // Story has many reading progress records
  Story.hasMany(models.ReadingProgress, {
    foreignKey: 'storyId',
    as: 'readingProgress'
  });

  // Story has many reports
  Story.hasMany(models.Report, {
    foreignKey: 'contentId',
    as: 'reports',
    scope: {
      contentType: 'story'
    }
  });
};

module.exports = Story;