const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Share = sequelize.define('Share', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  storyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Stories',
      key: 'id'
    }
  },
  platform: {
    type: DataTypes.ENUM('twitter', 'facebook', 'linkedin', 'reddit', 'whatsapp', 'telegram', 'email', 'copy_link', 'other'),
    allowNull: false
  },
  ipAddress: {
    type: DataTypes.INET,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  referrer: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['storyId'] },
    { fields: ['platform'] },
    { fields: ['createdAt'] }
  ]
});

Share.associate = (models) => {
  Share.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  Share.belongsTo(models.Story, {
    foreignKey: 'storyId',
    as: 'story'
  });
};

module.exports = Share;