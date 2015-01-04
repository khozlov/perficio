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
  passport = require('passport'),
  GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  moment = require('moment'),
  config = require('config'),
  namespace = config.get('urlNamespace'),
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
    callbackURL: config.get('googleCallbackUrl')
  },
  function(accessToken, refreshToken, profile, done) {
    if (profile.emails[0].value.match(/@u2i\.com$/)) {
      User.findOne({
        email: profile.emails[0].value
      }, function(err, user) {
        if (!user) {
          var usr = new User();
          usr.name = profile.displayName;
          usr.email = profile.emails[0].value;
          usr.photoUrl = profile._json.picture;
          usr.save(function(err) {
            if (err) {
              done(null, false, {
                message: "User creation failed"
              });
            } else {
              done(err, user);
            }
          });
        } else {
          done(err, user);
        }
      });
    } else {
      done(null, false, {
        message: "User is not from the u2i domain"
      });
    }
  }
));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({
  secret: config.get('sessionSecret'),
  expires: moment().add(1, 'years').toDate(),
  path: namespace
}));
app.use(passport.initialize());
app.use(passport.session());

// User routes
app.use(namespace + '/users', users);
app.use(namespace + '/templates', templates);

app.route(namespace + '/auth/google').get(passport.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/plus.login',
    'email'
  ]
}));

app.route(namespace + '/auth/google/callback').get(passport.authenticate('google', {
  failureRedirect: namespace + '/'
}), function(req, res) {
  res.redirect(namespace + '/');
});

app.use(serveStatic('public', {
  'index': ['index.html']
}));

module.exports = app;
