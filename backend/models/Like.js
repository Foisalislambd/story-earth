const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Like = sequelize.define('Like', {
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
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'storyId']
    }
  ]
});

// Define associations
Like.associate = (models) => {
  Like.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  Like.belongsTo(models.Story, {
    foreignKey: 'storyId',
    as: 'story'
  });
};

module.exports = Like;