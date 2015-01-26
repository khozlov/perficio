"use strict";

var config = require('config'),
  express = require('express'),
  router = express.Router(),
  mountPoint = config.get('mountPoint');

module.exports = function(passport) {
  router.route('/google').get(passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login',
      'email'
    ]
  }));
  router.route('/google/callback').get(passport.authenticate('google', {
    failureRedirect: mountPoint + '/'
  }), function(req, res) {
    res.redirect(mountPoint + '/')
  });
  return router;
}
