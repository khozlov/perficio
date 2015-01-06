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
    callbackURL: 'http://' + config.get('domain') + mountPoint + config.get('googleCallbackUrl')
  },
  function(accessToken, refreshToken, profile, done) {
    if (profile.emails[0].value.match(config.get('userFilterRegexp'))) {
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
        message: "User's email doesn't match the required pattern"
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
  path: mountPoint === '' ? '/' : mountPoint
}));
app.use(passport.initialize());
app.use(passport.session());

// User routes
app.use(mountPoint + '/users', users);
app.use(mountPoint + '/templates', templates);

app.route(mountPoint + '/auth/google').get(passport.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/plus.login',
    'email'
  ]
}));

app.route(mountPoint + config.get('googleCallbackUrl')).get(passport.authenticate('google', {
  failureRedirect: mountPoint + '/'
}), function(req, res) {
  res.redirect(mountPoint + '/');
});

app.use(serveStatic('public', {
  'index': ['index.html']
}));

module.exports = app;
