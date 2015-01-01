"use strict";

var mongoose = require('mongoose'),
  Template = mongoose.model('Template'),
  ObjectId = require('mongoose').Types.ObjectId;

module.exports.show = function(req, res, next) {
  Template.findById(req.params.id, function(err, template) {
    if (err) {
      res.json(503, {
        error: "Something went wrong"
      });
    } else {
      res.json(template)
    }
  });
};

module.exports.index = function(req, res, next) {
  Template.find(function(err, templates) {
    if (err) {
      res.json(503, {
        error: "Something went wrong"
      });
    } else {
      res.json(templates);
    }
  });
};

module.exports.create = function(req, res, next) {
  var template = new Template();
  template.name = req.body.name;
  template.description = req.body.description;
  template.imageUrl = req.body.imageUrl;
  template.author = req.session.passport.user
  template.save(function(err, template) {
    if (err) {
      res.json(503, {
        error: err
      });
    } else {
      res.json(template);
    }
  });
};
