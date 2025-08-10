const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Bookmark = sequelize.define('Bookmark', {
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
  storyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Stories',
      key: 'id'
    }
  },
  collectionName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Default'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['storyId'] },
    { fields: ['userId', 'storyId'], unique: true },
    { fields: ['collectionName'] }
  ]
});

Bookmark.associate = (models) => {
  Bookmark.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  Bookmark.belongsTo(models.Story, {
    foreignKey: 'storyId',
    as: 'story'
  });
};

module.exports = Bookmark;