"use strict";

var mongoose = require('mongoose'),
  Template = mongoose.model('Template'),
  Achievement = mongoose.model('Achievement');

module.exports.show = function(req, res, next) {
  Template.findById(req.params.id, function(err, template) {
    if (err || template === null) {
      res.status(404).json({
        error: "Template not found"
      });
    } else {
      res.json(template)
    }
  });
};

module.exports.index = function(req, res, next) {
  Template.find(function(err, templates) {
    if (err) {
      res.status(503).json({
        error: "Something went wrong"
      });
    } else {
      res.json(templates);
    };
  });
};


module.exports.achievementsCount = function(req, res, next) {
  Template.findById(req.params.id, function(err, template) {
    if (err || template === null) {
      res.status(404).json({
        error: "Template not found"
      });
    } else {
      Achievement.count({template: template._id}, function(err, count){
        if (err) {
          res.status(503).json({
            error: "Something went wrong"
          });
        } else {
          res.json({'count': count});
        };
      });
    };
  });
};

// TODO: Add proper error handling (duplicate name etc.)
module.exports.create = function(req, res, next) {
  var template = new Template();
  template.name = req.body.name;
  template.description = req.body.description;
  template.imageUrl = req.body.imageUrl;
  template.author = req.session.passport.user
  template.save(function(err, template) {
    if (err) {
      res.status(503).json({
        error: err
      });
    } else {
      res.status(201).json(template);
    }
  });
};
