var mongoose = require('mongoose'),
  timestamps = require('mongoose-timestamp');

var templateSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

templateSchema.plugin(timestamps);

mongoose.model('Template', templateSchema);
