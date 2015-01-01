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
    unique: true,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  }
});

achievementSchema.plugin(timestamps);

achievementSchema.statics.findByUser = function(userId, sortOrder, callback) {
  this.find({
    owner: userId
  }).sort(sortOrder).populate('grantedBy', 'name photoUrl').exec(callback);
}

mongoose.model('Achievement', achievementSchema);
