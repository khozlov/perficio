"use strict";

var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Achievement = mongoose.model('Achievement'),
  Template = mongoose.model('Template'),
  ObjectId = require('mongoose').Types.ObjectId,
  async = require('async'),
  config = require('config'),
  mountPoint = config.get('mountPoint');

module.exports.show = function(req, res, next) {
  User.findById(req.params.id).select('-email').exec(function(err, usr) {
    if (err || usr === null) {
      res.status(404).json({
        error: "User not found"
      });
    } else {
      populateUserAchievements(usr, function(err, usr) {
        if (err) {
          res.status(503).json({
            error: "Something went wrong"
          });
        } else {
          populateUserUnachieved(usr, function(err, usr) {
            if (err) {
              res.status(503).json({
                error: "Something went wrong " + err
              });
            } else {
              res.json(usr);
            }
          });
        }
      });
    }
  });
};

module.exports.grant = function(req, res, next) {
  User.findById(req.params.id).exec(function(err, usr) {
    if (err || usr === null) {
      res.status(404).json({
        error: "User not found"
      });
    } else {
      Template.findById(req.params.templateId, function(err, template) {
        if (err || template === null) {
          res.status(404).json({
            error: "Template not found"
          });
        } else {
          Achievement.findOne({
            owner: req.params.id,
            grantedBy: req.session.passport.user,
            template: req.params.templateId
          }, function(err, achievement) {
            if (err) {
              res.status(503).json({
                error: "Something went wrong"
              });
            } else {
              if (achievement !== null) {
                res.status(409).json({
                  error: "You already granted this achievement to this person"
                });
              } else {
                achievement = Achievement.findOne({
                  owner: req.params.id,
                  template: req.params.templateId
                }, function(err, achievement) {
                  if (err) {
                    res.status(503).json({
                      error: "Something went wrong"
                    });
                  } else {
                    if (achievement != null) {
                      achievement.grantedBy.push(req.session.passport.user);
                      achievement.save(function(err, achievement) {
                        if (err) {
                          res.status(503).json({
                            error: "Something went wrong"
                          });
                        } else {
                          res.status(200).json(achievement);
                        }
                      });
                    } else {
                      achievement = new Achievement();
                      achievement.owner = req.params.id;
                      achievement.grantedBy.push(req.session.passport.user);
                      achievement.template = template;
                      achievement.name = template.name;
                      achievement.description = template.description;
                      achievement.imageUrl = template.imageUrl;
                      achievement.save(function(err, achievement) {
                        if (err) {
                          res.status(503).json({
                            error: "Something went wrong"
                          });
                        } else {
                          res.status(201).json(achievement);
                        }
                      });
                    }
                  }
                });
              }
            }
          });
        }
      });
    }
  });
};

module.exports.index = function(req, res, next) {
  User.find().select('name photoUrl').exec(function(err, users) {
    if (err) {
      res.status(503).json({
        error: "Something went wrong"
      });
    } else {
      async.mapLimit(users, 50, populateUserAchievements, function(err, plainUsers) {
        if (err) {
          res.status(503).json({
            error: "Something went wrong"
          });
        } else {
          res.json(plainUsers);
        }
      });
    }
  });
};

module.exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    redirect: mountPoint + '/auth/google',
    error: 'You must be logged in to perform this action'
  });
}

module.exports.ensureAdmin = function(req, res, next) {
  User.findById(req.session.passport.user, function(err, usr) {
    if (err || usr === null || !usr.admin) {
      res.status(401).json({
        redirect: mountPoint + '/auth/google',
        error: 'You must be logged in as admin to perform this action'
      });
    } else {
      next();
    }
  });
}

var populateUserAchievements = function(user, callback) {
  Achievement.findByUser(user.id, '-createdAt', function(err, achievements) {
    if (err) {
      callback(err);
    } else {
      user = user.toObject();
      user.achievements = achievements;
      callback(err, user);
    }
  });
}

var populateUserUnachieved = function(user, callback) {
  var achievedTemplateIds = user.achievements.map(function(a) {
    return a.template
  });
  Template.find().where('_id').nin(achievedTemplateIds).exec(function(err, templates) {
    if (err) {
      callback(err);
    } else {
      user.unachieved = templates;
      callback(err, user);
    }
  });
}
