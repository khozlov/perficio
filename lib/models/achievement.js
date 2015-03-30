"use strict";

var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var achievementSchema = mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  grantedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  private: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String
  }
});

achievementSchema.plugin(timestamps);

module.exports = mongoose.model('Achievement', achievementSchema);
