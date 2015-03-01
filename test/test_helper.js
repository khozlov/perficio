"use strict";

if (process.env.NODE_ENV != 'test') {
  throw new Error("Tests need to be run with NODE_ENV set to test");
}

require('../lib/models/db');

var mongoose = require('mongoose'),
  async = require('async'),
  Keygrip = require('keygrip'),
  config = require('config'),
  factories = require('./factories.js');

module.exports.factories = factories;

module.exports.clearDb = function(done) {
  async.each(mongoose.modelNames(), function(name, callback) {
      mongoose.model(name).remove({}, callback);
    },
    done);
};

module.exports.idMap = function(array) {
  var map = {};
  array.forEach(function(element, index) {
    map[element._id] = index;
  });
  return map;
}

module.exports.sessionCookies = function(sessionContent) {
  var keys = new Keygrip([config.get('sessionSecret')]),
    sessionCookie = 'express:sess=' + (new Buffer(JSON.stringify(sessionContent)).toString('base64'));
  return sessionCookie + '; ' + 'express:sess.sig=' + keys.sign(sessionCookie) + ';';
}
