"use strict";

var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Achievement = mongoose.model('Achievement');

module.exports.social = function(req, res) {
  Achievement.findById(req.params.id).exec(function(err, achievement) {
    if (err || achievement === null) {
      res.status(404).json({
        error: "Achievement not found"
      });
    } else {
      console.log(req.params);
      res.render('achievements/social', {
        'achievement': achievement,
        redirectUrl: req.query.redirectUrl
      });
    }
  });
};
