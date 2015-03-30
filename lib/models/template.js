"use strict";

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
  private: {
    type: Boolean,
    default: false
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [String]
});

templateSchema.plugin(timestamps);

module.exports = mongoose.model('Template', templateSchema);
