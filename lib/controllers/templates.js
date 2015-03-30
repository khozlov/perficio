"use strict";

var mongoose = require('mongoose'),
  Template = mongoose.model('Template'),
  Achievement = mongoose.model('Achievement');

module.exports.show = function(req, res) {
  Template.findById(req.params.id, function(err, template) {
    if (err || template === null || (template.private && !req.isAuthenticated())) {
      res.status(404).json({
        error: "Template not found"
      });
    } else {
      res.json(template);
    }
  });
};

module.exports.index = function(req, res) {
  var query = Template.where();
  if (!req.isAuthenticated()) {
    query.where({
      private: false
    });
  }
  query.exec(function(err, templates) {
    if (err) {
      res.status(503).json({
        error: "Something went wrong"
      });
    } else {
      res.json(templates);
    }
  });
};

module.exports.count = function(req, res) {
  var query = Template.where();
  if (!req.isAuthenticated()) {
    query.count({
      private: false
    });
  }
  query.count(function(err, count) {
    if (err) {
      res.status(503).json({
        error: "Something went wrong"
      });
    } else {
      res.status(200).json({
        'count': count
      });
    }
  });
};

module.exports.achievementsCount = function(req, res) {
  Template.findById(req.params.id, function(err, template) {
    if (err || template === null || (template.private && !req.isAuthenticated())) {
      res.status(404).json({
        error: "Template not found"
      });
    } else {
      Achievement.count({
        template: template._id
      }, function(err, count) {
        if (err) {
          res.status(503).json({
            error: "Something went wrong"
          });
        } else {
          res.json({
            'count': count
          });
        }
      });
    }
  });
};

// TODO: Add proper error handling (duplicate name etc.)
module.exports.create = function(req, res) {
  var template = new Template();
  template.name = req.body.name;
  template.description = req.body.description;
  template.imageUrl = req.body.imageUrl;
  template.private = req.body.private;
  template.tags = req.body.tags;
  template.author = req.session.passport.user;
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
