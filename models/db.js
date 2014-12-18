var mongoose = require('mongoose'),
  config = require('config'),
  dbURI = 'mongodb://' + config.get('mongoUri');

mongoose.connect(dbURI, {
  user: config.get('mongoUser'),
  pass: config.get('mongoPassword')
});
process.on('SIGINT', function() {
  mongoose.connection.close(function() {
    process.exit(0);
  });
});
