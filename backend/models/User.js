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
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  displayName: {
    type: DataTypes.STRING(100),
    allowNull: true
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
  website: {
    type: DataTypes.STRING(200),
    allowNull: true,
    validate: {
      isUrl: { msg: 'Website must be a valid URL' }
    }
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  socialLinks: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  storiesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  followersCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  followingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalLikes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalViews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isModerator: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'banned', 'deleted'),
    defaultValue: 'active'
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emailVerificationToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastActiveAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      notifications: {
        email: true,
        push: true,
        likes: true,
        comments: true,
        follows: true,
        stories: true
      },
      privacy: {
        showEmail: false,
        showLocation: true,
        allowMessages: true
      }
    }
  }
}, {
  timestamps: true,
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
      
      // Generate display name if not provided
      if (!user.displayName) {
        if (user.firstName && user.lastName) {
          user.displayName = `${user.firstName} ${user.lastName}`;
        } else if (user.firstName) {
          user.displayName = user.firstName;
        } else {
          user.displayName = user.username;
        }
      }
    }
  },
  defaultScope: {
    attributes: { exclude: ['password', 'emailVerificationToken'] }
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password'] }
    },
    withSecrets: {
      attributes: { include: ['password', 'emailVerificationToken'] }
    }
  },
  indexes: [
    { fields: ['email'] },
    { fields: ['username'] },
    { fields: ['status'] },
    { fields: ['isVerified'] },
    { fields: ['lastActiveAt'] }
  ]
});

// Instance method to compare passwords
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Define associations
User.associate = (models) => {
  // User has many stories
  User.hasMany(models.Story, {
    foreignKey: 'authorId',
    as: 'stories'
  });

  // User has many series
  User.hasMany(models.Series, {
    foreignKey: 'authorId',
    as: 'series'
  });

  // User has many likes
  User.hasMany(models.Like, {
    foreignKey: 'userId',
    as: 'likes'
  });

  // User has many comments
  User.hasMany(models.Comment, {
    foreignKey: 'userId',
    as: 'comments'
  });

  // User has many bookmarks
  User.hasMany(models.Bookmark, {
    foreignKey: 'userId',
    as: 'bookmarks'
  });

  // User has many shares
  User.hasMany(models.Share, {
    foreignKey: 'userId',
    as: 'shares'
  });

  // User has many reading progress records
  User.hasMany(models.ReadingProgress, {
    foreignKey: 'userId',
    as: 'readingProgress'
  });

  // User has many notifications
  User.hasMany(models.Notification, {
    foreignKey: 'userId',
    as: 'notifications'
  });

  // User has many reports (as reporter)
  User.hasMany(models.Report, {
    foreignKey: 'reporterId',
    as: 'reports'
  });

  // User has many moderated reports (as moderator)
  User.hasMany(models.Report, {
    foreignKey: 'moderatorId',
    as: 'moderatedReports'
  });

  // Following relationships
  User.hasMany(models.Follow, {
    foreignKey: 'followerId',
    as: 'following'
  });

  User.hasMany(models.Follow, {
    foreignKey: 'followingId',
    as: 'followers'
  });
};

module.exports = User;