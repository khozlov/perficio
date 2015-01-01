'use strict';

var mongoose = require('mongoose'),
  Achievement = mongoose.model('Achievement'),
  Template = mongoose.model('Template'),
  ObjectId = require('mongoose').Types.ObjectId;

module.exports.create = function(req, res, next) {
  Template.findById(req.body.templateId, function(err, template) {
    if (err) {
      res.status(503).json({
        error: "Something went wrong"
      });
    } else {
      if (template === null) {
        res.status(404).json({
          error: "Template not found"
        });
      } else {
        Achievement.findOne({
          owner: req.body.ownerId,
          grantedBy: req.session.passport.user,
          template: req.body.templateId
        }, function(err, achievement) {
          if (err) {
            res.status(503).json({
              error: "Something went wrong"
            });
          } else {
            if (achievement !== null) {
              res.status(409).json({
                error: "You already granted this chievement to this person"
              });
            } else {
              achievement = Achievement.findOne({
                owner: req.body.ownerId,
                template: req.body.templateId
              }, function(err, achievement) {
                if (err) {
                  res.status(503).json({
                    error: "Something went wrong"
                  });
                } else {
                  if (achievement != null) {
                    achievement.grantedBy.push(req.session.passport.user);
                  } else {
                    achievement = new Achievement();
                    achievement.owner = req.body.ownerId;
                    achievement.grantedBy = req.session.passport.user;
                    achievement.template = req.body.templateId;
                    achievement.name = template.name;
                    achievement.description = template.description;
                    achievement.imageUrl = template.imageUrl;
                  }
                  achievement.save(function(err, achievement) {
                    if (err) {
                      res.status(503).json({
                        error: "Something went wrong"
                      });
                    } else {
                      res.json(achievement);
                    }
                  });
                }
              });
            }
          }
        });
      }
    }
  });
};

module.exports.index = function(req, res, next) {
  var sortOrder = req.body.sort || 'name';
  Achievement.findByUser(req.body.ownerId, sortOrder, function(err, achievements) {
    if (err) {
      res.status(503).json({
        error: "Something went wrong"
      });
    } else {
      res.json(achievements);
    }
  });
}
