const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM(
      'story_like', 'story_comment', 'story_share',
      'follow', 'unfollow',
      'story_published', 'series_updated',
      'comment_reply', 'mention',
      'milestone_reached', 'featured_story',
      'system_announcement'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actionUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  relatedUserId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  relatedStoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Stories',
      key: 'id'
    }
  },
  relatedCommentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Comments',
      key: 'id'
    }
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  timestamps: true,
  hooks: {
    beforeSave: (notification) => {
      if (notification.isRead && !notification.readAt) {
        notification.readAt = new Date();
      }
    }
  },
  indexes: [
    { fields: ['userId'] },
    { fields: ['type'] },
    { fields: ['isRead'] },
    { fields: ['createdAt'] },
    { fields: ['relatedUserId'] },
    { fields: ['relatedStoryId'] }
  ]
});

Notification.associate = (models) => {
  Notification.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  Notification.belongsTo(models.User, {
    foreignKey: 'relatedUserId',
    as: 'relatedUser'
  });
  
  Notification.belongsTo(models.Story, {
    foreignKey: 'relatedStoryId',
    as: 'relatedStory'
  });
  
  Notification.belongsTo(models.Comment, {
    foreignKey: 'relatedCommentId',
    as: 'relatedComment'
  });
};

module.exports = Notification;