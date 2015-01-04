"use strict";

var mongoose = require('mongoose'),
  timestamps = require('mongoose-timestamp');

var userSchema = mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  photoUrl: String,
  admin: Boolean,
});

userSchema.plugin(timestamps);

mongoose.model('User', userSchema);
