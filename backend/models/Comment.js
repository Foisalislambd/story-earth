const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Comment content is required' },
      len: {
        args: [1, 1000],
        msg: 'Comment must be between 1 and 1000 characters'
      }
    }
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
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Comments',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['storyId'] },
    { fields: ['userId'] },
    { fields: ['parentId'] }
  ]
});

// Define associations
Comment.associate = (models) => {
  Comment.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'author'
  });
  
  Comment.belongsTo(models.Story, {
    foreignKey: 'storyId',
    as: 'story'
  });
  
  // Self-referencing for nested comments
  Comment.belongsTo(models.Comment, {
    foreignKey: 'parentId',
    as: 'parent'
  });
  
  Comment.hasMany(models.Comment, {
    foreignKey: 'parentId',
    as: 'replies'
  });
};

module.exports = Comment;