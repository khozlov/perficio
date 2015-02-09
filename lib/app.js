"use strict";

require('./models/db');
require('./models/user');
require('./models/achievement');
require('./models/template');

var express = require('express'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  session = require('cookie-session'),
  logger = require('morgan'),
  app = express(),
  users = require('./routes/users'),
  templates = require('./routes/templates'),
  auth = require('./routes/auth'),
  passport = require('passport'),
  GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  moment = require('moment'),
  config = require('config'),
  mountPoint = config.get('mountPoint'),
  serveStatic = require('serve-static');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, done);
});

passport.use(new GoogleStrategy({
    clientID: config.get('googleClientId'),
    clientSecret: config.get('googleClientSecret'),
    callbackURL: 'http://' + config.get('domain') + mountPoint + '/auth/google/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    User.verify(accessToken, refreshToken, profile, done)
  }
));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({
  secret: config.get('sessionSecret'),
  overwrite: true,
  expires: moment().add(1, 'years').toDate(),
  name: 'perficio.sid',
  path: mountPoint === '' ? '/' : mountPoint
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(mountPoint + '/users', users);
app.use(mountPoint + '/templates', templates);
app.use(mountPoint + '/auth', auth(passport));

app.use(serveStatic('public', {
  'index': ['index.html']
}));

module.exports = app;
