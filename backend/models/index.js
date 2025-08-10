const User = require('./User');
const Story = require('./Story');
const Like = require('./Like');
const Comment = require('./Comment');

const models = {
  User,
  Story,
  Like,
  Comment
};

// Initialize associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = models;