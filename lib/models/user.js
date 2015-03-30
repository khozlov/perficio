"use strict";

var mongoose = require('mongoose'),
  timestamps = require('mongoose-timestamp'),
  config = require('config'),
  Template = require('./template'),
  Achievement = require('./achievement'),
  lodash = require('lodash');

var userSchema = mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  photoUrl: String,
  admin: Boolean,
});

userSchema.statics.verify = function(accessToken, refreshToken, profile, done) {
  var self = this;
  if (profile.emails[0].value.match(config.get('userFilterRegexp'))) {
    self.findOne({
      email: profile.emails[0].value
    }, function(err, user) {
      if (!user) {
        user = new self();
        user.name = profile.displayName;
        user.email = profile.emails[0].value;
        user.photoUrl = profile._json.picture;
        user.save(function(err) {
          if (err) {
            done(null, false, {
              message: "User creation failed"
            });
          } else {
            done(err, user);
          }
        });
      } else {
        if (user.photoUrl.match('googleusercontent\.com') && user.photoUrl != profile._json.picture) {
          user.photoUrl = profile._json.picture;
          user.save(function(err) {
            if (err) {
              done(null, false, {
                message: "User update failed"
              });
            } else {
              done(err, user);
            }
          });
        } else {
          done(err, user);
        }
      }
    });
  } else {
    done(null, false, {
      message: "User's email doesn't match the required pattern"
    });
  }
};

userSchema.methods.getAchievementsAndTemplates = function(includePrivate, callback) {
  this.getAchievements('name', includePrivate,
    function(err, achievements) {
      var query;
      if (err) {
        callback(err);
      } else {
        var achievedTemplateIds = achievements.map(function(a) {
          return a.template;
        });
        query = Template.find().sort('-name').where('_id').nin(achievedTemplateIds);
        if (!includePrivate) {
          query = query.where({
            private: false
          });
        }
        query.exec(function(err, templates) {
          if (err) {
            callback(err);
          } else {
            callback(null, {
              'achieved': achievements,
              'unachieved': templates
            });
          }
        });
      }
    });
};

userSchema.methods.getAchievements = function(sortOrder, includePrivate, callback) {
  var query = Achievement.where({
    owner: this.id
  });
  if (!includePrivate) {
    query = query.where({
      private: false
    })
  }
  query.select('-owner').sort(sortOrder).populate('grantedBy', 'name photoUrl').exec(callback);
};

userSchema.methods.toJSONExtended = function(extension) {
  var self = this;
  return self.toJSON({
    transform: function(doc, ret) {
      ret = lodash.extend(ret, extension);
    }
  });
};

userSchema.plugin(timestamps);

module.exports = mongoose.model('User', userSchema);
