const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Username is required' },
      len: {
        args: [3, 20],
        msg: 'Username must be between 3 and 20 characters'
      },
      is: {
        args: /^[a-zA-Z0-9_]+$/,
        msg: 'Username can only contain letters, numbers, and underscores'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Email is required' },
      isEmail: { msg: 'Please provide a valid email' }
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase());
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Password is required' },
      len: {
        args: [6, 255],
        msg: 'Password must be at least 6 characters long'
      }
    }
  },
  avatar: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  bio: {
    type: DataTypes.TEXT,
    defaultValue: '',
    validate: {
      len: {
        args: [0, 500],
        msg: 'Bio must be less than 500 characters'
      }
    }
  },
  storiesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  },
  defaultScope: {
    attributes: { exclude: ['password'] }
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password'] }
    }
  }
});

// Instance method to compare passwords
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Define associations
User.associate = (models) => {
  // Self-referencing many-to-many for followers/following
  User.belongsToMany(models.User, {
    through: 'UserFollowers',
    as: 'Followers',
    foreignKey: 'followingId',
    otherKey: 'followerId'
  });
  
  User.belongsToMany(models.User, {
    through: 'UserFollowers',
    as: 'Following',
    foreignKey: 'followerId',
    otherKey: 'followingId'
  });
  
  // User has many stories
  User.hasMany(models.Story, {
    foreignKey: 'authorId',
    as: 'stories'
  });
};

module.exports = User;