const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Series = sequelize.define('Series', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Series title is required' },
      len: {
        args: [1, 200],
        msg: 'Series title must be between 1 and 200 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
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
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  totalParts: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  estimatedParts: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  mature: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
    beforeSave: (series) => {
      // Generate slug if not provided
      if (!series.slug && series.title) {
        series.slug = series.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 100) + '-' + Date.now();
      }
    }
  },
  indexes: [
    { fields: ['authorId'] },
    { fields: ['isPublished'] },
    { fields: ['category'] },
    { fields: ['tags'], using: 'gin' },
    { fields: ['collaborators'], using: 'gin' }
  ]
});

Series.associate = (models) => {
  Series.belongsTo(models.User, {
    foreignKey: 'authorId',
    as: 'author'
  });
  
  Series.hasMany(models.Story, {
    foreignKey: 'seriesId',
    as: 'stories'
  });

  Series.hasMany(models.SeriesFollower, {
    foreignKey: 'seriesId',
    as: 'followers'
  });
};

module.exports = Series;