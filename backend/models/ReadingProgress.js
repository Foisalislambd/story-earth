const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReadingProgress = sequelize.define('ReadingProgress', {
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
  progressPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  lastPosition: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  timeSpent: {
    type: DataTypes.INTEGER, // in seconds
    defaultValue: 0
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastReadAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  hooks: {
    beforeSave: (progress) => {
      if (progress.progressPercentage >= 100 && !progress.isCompleted) {
        progress.isCompleted = true;
        progress.completedAt = new Date();
      }
      progress.lastReadAt = new Date();
    }
  },
  indexes: [
    { fields: ['userId'] },
    { fields: ['storyId'] },
    { fields: ['userId', 'storyId'], unique: true },
    { fields: ['isCompleted'] },
    { fields: ['lastReadAt'] }
  ]
});

ReadingProgress.associate = (models) => {
  ReadingProgress.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  ReadingProgress.belongsTo(models.Story, {
    foreignKey: 'storyId',
    as: 'story'
  });
};

module.exports = ReadingProgress;