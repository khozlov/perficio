"use strict";

var helper = require('../test_helper'),
  chai = require('chai'),
  sinon = require('sinon'),
  sinonChai = require('sinon-chai'),
  expect = require('chai').expect,
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Template = mongoose.model('Template'),
  Achievement = mongoose.model('Achievement'),
  user1, user2, template1, template2, achievement1, achievement2, achievement3;

describe("user model", function() {
  beforeEach(function(done) {
    user1 = new User({
      'name': 'Han Solo',
      'email': 'han.solo@rebelion.com',
      'photoUrl': 'dummyUrl'
    });
    user2 = new User({
      'name': 'Jewbacka',
      'email': 'fury@rebelion.com',
      'photoUrl': 'anotherDummyUrl'
    });
    template1 = new Template({
      'name': 'Gold medal',
      'description': 'For achieveiving something',
      'imageUrl': 'someUrl',
      'author': user1
    });
    template2 = new Template({
      'name': 'Bronze medal',
      'description': 'For achieveiving something else',
      'imageUrl': 'someOtherUrl',
      'author': user2
    });
    achievement1 = new Achievement({
      'name': 'Gold medal',
      'description': 'For achieveiving something',
      'imageUrl': 'someUrl',
      'owner': user1,
      'template': template1,
      'grantedBy': [user2]
    });
    achievement2 = new Achievement({
      'name': 'Bronze medal',
      'description': 'For achieveiving something else',
      'imageUrl': 'someOtherUrl',
      'owner': user2,
      'template': template2,
      'grantedBy': [user1]
    });
    achievement3 = new Achievement({
      'name': 'Gold medal',
      'description': 'For achieveiving something',
      'imageUrl': 'someUrl',
      'owner': user2,
      'template': template1,
      'grantedBy': [user1]
    });
    helper.clearDb(function() {
      user1.save(function() {
        user2.save(function() {
          template1.save(function() {
            template2.save(function() {
              achievement1.save(function() {
                achievement2.save(function() {
                  achievement3.save(done);
                });
              });
            });
          });
        });
      });
    });
  });

  describe('#toJSONExtended', function() {
    it('merges the passed object into the user', function() {
      var jsonUser = user1.toJSONExtended({
        photoUrl: 'someNewUrl',
        newProp: 'prop'
      });
      expect(jsonUser._id.toString()).to.equal(user1.id);
      expect(jsonUser.name).to.equal(user1.name);
      expect(jsonUser.email).to.equal(user1.email);
      expect(jsonUser.photoUrl).to.equal('someNewUrl');
      expect(jsonUser.newProp).to.equal('prop');
    });
  });

  describe('#getAchievementsAndTemplates', function() {
    it('gets achieved and unachieved achievements', function(done) {
      user1.getAchievementsAndTemplates(function(err, result) {
        expect(err).to.be.null;
        expect(result.achieved.length).to.equal(1);
        expect(result.achieved[0].id).to.equal(achievement1.id);
        expect(result.achieved[0].owner).to.be.undefined;
        expect(result.achieved[0].template.toString()).to.equal(template1.id);
        expect(result.achieved[0].grantedBy[0].name).to.equal('Jewbacka');
        expect(result.achieved[0].grantedBy[0].photoUrl).to.equal('anotherDummyUrl');
        expect(result.unachieved[0].id).to.equal(template2.id);
        expect(result.unachieved[0].owner).to.be.undefined;
        expect(result.unachieved[0].template).to.be.undefined;
        expect(result.unachieved[0].grantedBy).to.be.undefined;
        done();
      });
    });
  });

  describe('#getAchievements', function() {
    it('gets achieved achievements', function(done) {
      user1.getAchievements('name', function(err, result) {
        expect(err).to.be.null;
        expect(result.length).to.equal(1);
        expect(result[0].id).to.equal(achievement1.id);
        expect(result[0].owner).to.be.undefined;
        expect(result[0].template.toString()).to.equal(template1.id);
        expect(result[0].grantedBy[0].name).to.equal('Jewbacka');
        expect(result[0].grantedBy[0].photoUrl).to.equal('anotherDummyUrl');
        done();
      });
    });

    it('uses the order provided', function(done) {
      user2.getAchievements('-name', function(err, result) {
        expect(err).to.be.null;
        expect(result.length).to.equal(2);
        expect(result[0].id).to.equal(achievement3.id);
        expect(result[1].id).to.equal(achievement2.id);
        done();
      });
    });
  });

  describe('.verify', function() {
    it("returns an error message when user email doesn't match the pattern", function(done) {
      User.verify(null, null, {
        emails: [{
          value: 'test@test.com'
        }]
      }, function(err, user, messageObj) {
        expect(err).to.be.null;
        expect(user).to.be.false;
        expect(messageObj.message).to.eq("User's email doesn't match the required pattern");
        done();
      });
    });

    it("returns the user if it already exists", function(done) {
      User.verify(null, null, {
        emails: [{
          value: 'han.solo@rebelion.com'
        }]
      }, function(err, user, messageObj) {
        expect(err).to.be.null;
        expect(user.id).to.equal(user1.id);
        expect(messageObj).to.be.undefined;
        done();
      });
    });

    it("it creates a user if it doesn't exist and returns it", function(done) {
      User.verify(null, null, {
        emails: [{
          value: 'luke@rebelion.com'
        }],
        displayName: 'Luke Skywalker',
        _json: {
          picture: 'APicture'
        }
      }, function(err, user, messageObj) {
        expect(err).to.be.null;
        expect(user).to.be.ok;
        expect(user.email).to.equal('luke@rebelion.com');
        expect(user.name).to.equal('Luke Skywalker');
        expect(user.photoUrl).to.equal('APicture');
        expect(messageObj).to.be.undefined;
        User.findById(user.id, function(err, usr) {
          expect(user.id).to.equal(usr.id);
          done();
        })
      });
    });
  });
});
