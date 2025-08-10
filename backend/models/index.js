const User = require('./User');
const Story = require('./Story');
const Like = require('./Like');
const Comment = require('./Comment');
const Bookmark = require('./Bookmark');
const Share = require('./Share');
const Series = require('./Series');
const ReadingProgress = require('./ReadingProgress');
const Follow = require('./Follow');
const Notification = require('./Notification');
const Report = require('./Report');

const models = {
  User,
  Story,
  Like,
  Comment,
  Bookmark,
  Share,
  Series,
  ReadingProgress,
  Follow,
  Notification,
  Report
};

// Initialize associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = models;