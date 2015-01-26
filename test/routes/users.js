"use strict";

var helper = require('../test_helper'),
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = require('chai').expect,
  app = require('../../lib/app'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Template = mongoose.model('Template'),
  Achievement = mongoose.model('Achievement');

chai.use(chaiHttp);

describe('user routes', function() {

  var user1, user2, template1, template2, achievement1, achievement2, achievement3;

  //TODO: Refactor setup
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
      'owner': user1,
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

  describe("#index", function() {
    it("is a success", function(done) {
      chai.request(app)
        .get('/users')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done();
        });
    });

    it("returns all users", function(done) {
      chai.request(app)
        .get('/users')
        .end(function(err, res) {
          expect(res.body.length).to.equal(2);
          var userIdMap = helper.idMap(res.body);
          expect(res.body[userIdMap[user1.id]].name).to.equal('Han Solo');
          expect(res.body[userIdMap[user1.id]].photoUrl).to.equal('dummyUrl');
          expect(res.body[userIdMap[user1.id]].email).to.be.undefined;
          expect(res.body[userIdMap[user1.id]].achieved.length).to.equal(2);

          expect(res.body[userIdMap[user2.id]].name).to.equal('Jewbacka');
          expect(res.body[userIdMap[user2.id]].photoUrl).to.equal('anotherDummyUrl');
          expect(res.body[userIdMap[user2.id]].email).to.be.undefined;
          expect(res.body[userIdMap[user2.id]].achieved.length).to.equal(1);
          done();
        });
    });
  })

  describe("#show", function() {
    it("is a success", function(done) {
      chai.request(app)
        .get('/users/' + user2.id)
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done();
        });
    });

    it("returns the user", function(done) {
      chai.request(app)
        .get('/users/' + user2.id)
        .end(function(err, res) {
          expect(res.body.name).to.equal('Jewbacka');
          expect(res.body.photoUrl).to.equal('anotherDummyUrl');
          expect(res.body.email).to.be.undefined;
          expect(res.body.achieved.length).to.equal(1);
          expect(res.body.achieved[0]._id).to.equal(achievement3.id);
          expect(res.body.unachieved.length).to.equal(1);
          expect(res.body.unachieved[0]._id).to.equal(template2.id);
          done();
        });
    });

    it("returns 404 if the user is not found", function(done) {
      chai.request(app)
        .get('/users/trelemorele')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(404);
          done();
        });
    });
  })

  describe("#grant", function() {
    it("responds with 401 when user is not authenticated", function(done) {
      chai.request(app)
        .post('/users/trelemorele/grant/blablabla')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
          done();
        });
    });

    it("responds with 404 when user is not found", function(done) {
      chai.request(app)
        .post('/users/trelemorele/grant/' + template2.id)
        .set('Cookie', helper.sessionCookies({
          'passport': {
            'user': user1.id
          }
        }))
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(404);
          done();
        });
    });

    it("responds with 404 when template is not found", function(done) {
      chai.request(app)
        .post('/users/' + user2.id + '/grant/trelemorele')
        .set('Cookie', helper.sessionCookies({
          'passport': {
            'user': user1.id
          }
        }))
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(404);
          done();
        });
    });

    it("responds with 409 when trying to grant the achievement again", function(done) {
      chai.request(app)
        .post('/users/' + user2.id + '/grant/' + template1.id)
        .set('Cookie', helper.sessionCookies({
          'passport': {
            'user': user1.id
          }
        }))
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(409);
          Achievement.find({
            owner: user2.id,
            template: template1.id
          }, function(err, achievements) {
            expect(err).to.be.null;
            expect(achievements.length).to.equal(1);
            expect(achievements[0].grantedBy.toString()).to.equal([user1.id].toString());
            done();
          });
        });
    });

    it("grants the achievemnt if the user didn't have it", function(done) {
      Achievement.count({
        owner: user2.id,
        template: template2.id
      }, function(err, count) {
        expect(count).to.equal(0);
        chai.request(app)
          .post('/users/' + user2.id + '/grant/' + template2.id)
          .set('Cookie', helper.sessionCookies({
            'passport': {
              'user': user1.id
            }
          }))
          .end(function(err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(201);
            Achievement.find({
              owner: user2.id,
              template: template2.id
            }, function(err, achievements) {
              expect(err).to.be.null;
              expect(achievements.length).to.equal(1);
              expect(achievements[0].grantedBy.toString()).to.equal([user1.id].toString());
              done();
            });
          });
      });
    });

    it("returns the granted achievement", function(done) {
      chai.request(app)
        .post('/users/' + user2.id + '/grant/' + template2.id)
        .set('Cookie', helper.sessionCookies({
          'passport': {
            'user': user1.id
          }
        }))
        .end(function(err, res) {
          expect(err).to.be.null;
          Achievement.findOne({
            owner: user2.id,
            template: template2.id
          }, function(err, achievement) {
            expect(err).to.be.null;
            expect(res.body._id).to.equal(achievement.id.toString());
            expect(res.body.name).to.equal(achievement.name);
            expect(res.body.description).to.equal(achievement.description);
            expect(res.body.template).to.equal(achievement.template.toString());
            expect(res.body.owner).to.equal(achievement.owner.toString());
            expect(res.body.imageUrl).to.equal(achievement.imageUrl);
            expect(res.body.grantedBy.length).to.equal(1);
            expect(res.body.grantedBy[0]).to.equal(achievement.grantedBy[0].toString());
            done();
          });
        });
    });

    it("adds the user to granters list if the user already had the achievement", function(done) {
      Achievement.find({
        owner: user1.id,
        template: template1.id
      }, function(err, achievements) {
        expect(achievements.length).to.equal(1);
        expect(achievements[0].grantedBy.toString()).to.equal([user2.id].toString());
        chai.request(app)
          .post('/users/' + user1.id + '/grant/' + template1.id)
          .set('Cookie', helper.sessionCookies({
            'passport': {
              'user': user1.id
            }
          }))
          .end(function(err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            Achievement.find({
              owner: user1.id,
              template: template1.id
            }, function(err, achievements) {
              expect(err).to.be.null;
              expect(achievements.length).to.equal(1);
              expect(achievements[0].grantedBy.toString()).to.equal([user2.id, user1.id].toString());
              done();
            });
          });
      });
    });
  });
});
