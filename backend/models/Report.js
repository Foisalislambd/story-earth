const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reporterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  contentType: {
    type: DataTypes.ENUM('story', 'comment', 'user', 'series'),
    allowNull: false
  },
  contentId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  reason: {
    type: DataTypes.ENUM(
      'spam', 'harassment', 'inappropriate_content', 
      'copyright_infringement', 'misinformation', 
      'violence', 'hate_speech', 'other'
    ),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'resolved', 'dismissed'),
    defaultValue: 'pending'
  },
  moderatorId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  moderatorNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  actionTaken: {
    type: DataTypes.ENUM('none', 'warning', 'content_removed', 'user_suspended', 'user_banned'),
    allowNull: true
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['reporterId'] },
    { fields: ['contentType', 'contentId'] },
    { fields: ['status'] },
    { fields: ['reason'] },
    { fields: ['moderatorId'] },
    { fields: ['createdAt'] }
  ]
});

Report.associate = (models) => {
  Report.belongsTo(models.User, {
    foreignKey: 'reporterId',
    as: 'reporter'
  });
  
  Report.belongsTo(models.User, {
    foreignKey: 'moderatorId',
    as: 'moderator'
  });
};

module.exports = Report;