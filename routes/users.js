var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Achievement = mongoose.model('Achievement'),
  Template = mongoose.model('Template'),
  ObjectId = require('mongoose').Types.ObjectId,
  async = require('async'),
  config = require('config'),
  namespace = config.get('urlNamespace');

module.exports.show = function(req, res, next) {
  User.findById(req.params.id, function(err, usr) {
    if (err) {
      res.json(503, {
        error: "Something went wrong"
      });
    } else {
      populateUserAchievements(usr, function(err, usr) {
        if (err) {
          res.json(503, {
            error: "Something went wrong"
          });
        } else {
          populateUserUnachieved(usr, function(err, usr) {
            if (err) {
              res.json(503, {
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

module.exports.current = function(req, res, next) {
  User.findById(req.session.passport.user, function(err, usr) {
    if (err) {
      res.json(503, {
        error: "Something went wrong"
      });
    } else {
      res.json(usr);
    }
  });
};

module.exports.index = function(req, res, next) {
  User.find().select('name photoUrl').exec(function(err, users) {
    if (err) {
      res.json(503, {
        error: "Something went wrong"
      });
    } else {
      async.mapLimit(users, 50, populateUserAchievements, function(err, plainUsers) {
        if (err) {
          res.json(503, {
            error: "Something went wrong"
          });
        } else {
          res.json(plainUsers);
        }
      });
    }
  });
};

module.exports.serialize = function(user, done) {
  done(null, user.id);
};

module.exports.deserialize = function(id, done) {
  User.findById(id, done);
};

module.exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.send(401, {
    redirect: namespace + '/auth/google',
    error: 'You must be logged in to perform this action'
  });
}

module.exports.ensureAdmin = function(req, res, next) {
  User.findById(req.session.passport.user, function(err, usr) {
    if (err || !usr || !usr.admin) {
      res.send(401, {
        redirect: namespace + '/auth/google',
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
