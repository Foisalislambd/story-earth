const logger = {
  error: (message, error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(message, error);
    }
  },
  log: (message) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(message);
    }
  },
  info: (message) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(message);
    }
  }
};

module.exports = logger;