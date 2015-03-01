"use strict";

require('../lib/models/db');

var mongoose = require('mongoose'),
  Monky = require('monky'),
  monky = new Monky(mongoose);

monky.factory('User', {
  name: 'user#n',
  email: 'email#n@rebelion.com',
  photoUrl: 'www.photo.com/photo#n.jpg'
});
monky.factory('Template', {
  name: 'Medal #n',
  description: 'Super achievement number #n',
  imageUrl: 'www.image.com/image#n.jpg',
  author: monky.ref('User')
});
monky.factory('Achievement', {
  name: 'Medal #n',
  description: 'Super achievement number #n',
  imageUrl: 'www.image.com/image#n.jpg',
  owner: monky.ref('User'),
  grantedBy: [monky.ref('User')],
  template: monky.ref('Template')
});

module.exports = monky;
