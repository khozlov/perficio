"use strict";

var helper = require('../test_helper'),
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = require('chai').expect,
  app = require('../../lib/app'),
  mongoose = require('mongoose'),
  Achievement = mongoose.model('Achievement');

chai.use(chaiHttp);

describe('user routes', function() {
  describe("#index", function() {
    var users;

    before(function(done) {
      helper.clearDb(function() {
        helper.factories.createList('User', 2, function(err, createdUsers) {
          users = createdUsers;
          helper.factories.create('Template', {
            author: createdUsers[0]
          }, function(err, createdTemplate1) {
            helper.factories.create('Template', {
              author: createdUsers[1],
              private: true
            }, function(err, createdTemplate2) {
              helper.factories.create('Achievement', {
                owner: createdUsers[0],
                grantedBy: [createdUsers[1]],
                template: createdTemplate1
              }, function() {
                helper.factories.create('Achievement', {
                  owner: createdUsers[0],
                  grantedBy: [createdUsers[0]],
                  template: createdTemplate2,
                  private: true
                }, function() {
                  helper.factories.create('Achievement', {
                    owner: createdUsers[1],
                    grantedBy: [createdUsers[0]],
                    template: createdTemplate1
                  }, done);
                });
              });
            });
          });
        });
      });
    });

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
          var userIdMap = helper.idMap(res.body),
            resUser1 = res.body[userIdMap[users[0].id]],
            resUser2 = res.body[userIdMap[users[1].id]];
          expect(res.body.length).to.equal(2);
          expect(resUser1.name).to.equal(users[0].name);
          expect(resUser1.photoUrl).to.equal(users[0].photoUrl);
          expect(resUser1.email).to.be.undefined;

          expect(resUser2.name).to.equal(users[1].name);
          expect(resUser2.photoUrl).to.equal(users[1].photoUrl);
          expect(resUser2.email).to.be.undefined;
          done();
        });
    });

    it("includes private and public achievements if the user is logged in", function(done) {
      chai.request(app)
        .get('/users')
        .set('Cookie', helper.sessionCookies({
          'passport': {
            'user': users[0].id
          }
        }))
        .end(function(err, res) {
          var userIdMap = helper.idMap(res.body),
            resUser1 = res.body[userIdMap[users[0].id]],
            resUser2 = res.body[userIdMap[users[1].id]];
          expect(resUser1.achieved.length).to.equal(2);
          expect(resUser2.achieved.length).to.equal(1);
          done();
        });
    });

    it("includes only public achievements if the user is not logged in", function(done) {
      chai.request(app)
        .get('/users')
        .end(function(err, res) {
          var userIdMap = helper.idMap(res.body),
            resUser1 = res.body[userIdMap[users[0].id]],
            resUser2 = res.body[userIdMap[users[1].id]];
          expect(resUser1.achieved.length).to.equal(1);
          expect(resUser2.achieved.length).to.equal(1);
          done();
        });
    });
  });

  describe("#show", function() {
    var user, template, privateTemplates, achievement, privateAchievement;

    before(function(done) {
      helper.clearDb(function() {
        helper.factories.create('User', function(err, createdUser) {
          user = createdUser;
          helper.factories.create('Template', function(err, createdTemplate) {
            template = createdTemplate;
            helper.factories.createList('Template', 2, {
              private: true
            }, function(err, createdTemplates) {
              privateTemplates = createdTemplates;
              helper.factories.create('Achievement', {
                owner: createdUser,
                grantedBy: [createdUser],
                template: createdTemplate
              }, function(err, createdAchievement) {
                achievement = createdAchievement;
                helper.factories.create('Achievement', {
                  owner: createdUser,
                  grantedBy: [createdUser],
                  template: createdTemplates[0],
                  private: true
                }, function(err, createdAchievement) {
                  privateAchievement = createdAchievement;
                  done();
                });
              });
            });
          });
        });
      });
    });

    it("is a success", function(done) {
      chai.request(app)
        .get('/users/' + user.id)
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done();
        });
    });

    it("returns the user", function(done) {
      chai.request(app)
        .get('/users/' + user.id)
        .end(function(err, res) {
          expect(res.body.name).to.equal(user.name);
          expect(res.body.photoUrl).to.equal(user.photoUrl);
          expect(res.body.email).to.be.undefined;
          done();
        });
    });

    it("includes private and public achievments if the user is logged in", function(done) {
      chai.request(app)
        .get('/users/' + user.id)
        .set('Cookie', helper.sessionCookies({
          'passport': {
            'user': user.id
          }
        }))
        .end(function(err, res) {
          expect(res.body.achieved.length).to.equal(2);
          expect(res.body.achieved[0]._id).to.equal(achievement.id);
          expect(res.body.achieved[1]._id).to.equal(privateAchievement.id);
          expect(res.body.unachieved.length).to.equal(1);
          expect(res.body.unachieved[0]._id).to.equal(privateTemplates[1].id);
          done();
        });
    });

    it("includes only public achievments if the user is not logged in", function(done) {
      chai.request(app)
        .get('/users/' + user.id)
        .end(function(err, res) {
          expect(res.body.achieved.length).to.equal(1);
          expect(res.body.achieved[0]._id).to.equal(achievement.id);
          expect(res.body.unachieved.length).to.equal(0);
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
    var users, template1, template2;

    beforeEach(function(done) {
      helper.clearDb(function() {
        helper.factories.createList('User', 2, function(err, createdUsers) {
          users = createdUsers;
          helper.factories.create('Template', {
            author: createdUsers[0]
          }, function(err, createdTemplate1) {
            template1 = createdTemplate1;
            helper.factories.create('Template', {
              author: createdUsers[1]
            }, function(err, createdTemplate2) {
              template2 = createdTemplate2
              helper.factories.create('Achievement', {
                owner: createdUsers[0],
                grantedBy: [createdUsers[1]],
                template: createdTemplate1
              }, function() {
                helper.factories.create('Achievement', {
                  owner: createdUsers[0],
                  grantedBy: [createdUsers[0]],
                  template: createdTemplate2
                }, function() {
                  helper.factories.create('Achievement', {
                    owner: createdUsers[1],
                    grantedBy: [createdUsers[0]],
                    template: createdTemplate1
                  }, done);
                });
              });
            });
          });
        });
      });
    });

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
            'user': users[0].id
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
        .post('/users/' + users[1].id + '/grant/trelemorele')
        .set('Cookie', helper.sessionCookies({
          'passport': {
            'user': users[0].id
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
        .post('/users/' + users[1].id + '/grant/' + template1.id)
        .set('Cookie', helper.sessionCookies({
          'passport': {
            'user': users[0].id
          }
        }))
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(409);
          Achievement.find({
            owner: users[1].id,
            template: template1.id
          }, function(err, achievements) {
            expect(err).to.be.null;
            expect(achievements.length).to.equal(1);
            expect(achievements[0].grantedBy.toString()).to.equal([users[0].id].toString());
            done();
          });
        });
    });

    it("grants the achievement if the user didn't have it", function(done) {
      Achievement.count({
        owner: users[1].id,
        template: template2.id
      }, function(err, count) {
        expect(count).to.equal(0);
        chai.request(app)
          .post('/users/' + users[1].id + '/grant/' + template2.id)
          .set('Cookie', helper.sessionCookies({
            'passport': {
              'user': users[0].id
            }
          }))
          .end(function(err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(201);
            Achievement.find({
              owner: users[1].id,
              template: template2.id
            }, function(err, achievements) {
              expect(err).to.be.null;
              expect(achievements.length).to.equal(1);
              expect(achievements[0].grantedBy.toString()).to.equal([users[0].id].toString());
              expect(achievements[0].name).to.equal(template2.name);
              expect(achievements[0].description).to.equal(template2.description);
              expect(achievements[0].imageUrl).to.equal(template2.imageUrl);
              expect(achievements[0].private).to.equal(template2.private);
              expect(achievements[0].tags[0]).to.equal(template2.tags[0]);
              expect(achievements[0].tags[1]).to.equal(template2.tags[1]);
              done();
            });
          });
      });
    });

    it("returns the granted achievement", function(done) {
      chai.request(app)
        .post('/users/' + users[1].id + '/grant/' + template2.id)
        .set('Cookie', helper.sessionCookies({
          'passport': {
            'user': users[0].id
          }
        }))
        .end(function(err, res) {
          expect(err).to.be.null;
          Achievement.findOne({
            owner: users[1].id,
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
            expect(res.body.tags[0]).to.equal(achievement.tags[0]);
            expect(res.body.tags[1]).to.equal(achievement.tags[1]);
            done();
          });
        });
    });

    it("adds the user to granters list if the user already had the achievement", function(done) {
      Achievement.find({
        owner: users[0].id,
        template: template1.id
      }, function(err, achievements) {
        expect(achievements.length).to.equal(1);
        expect(achievements[0].grantedBy.toString()).to.equal([users[1].id].toString());
        chai.request(app)
          .post('/users/' + users[0].id + '/grant/' + template1.id)
          .set('Cookie', helper.sessionCookies({
            'passport': {
              'user': users[0].id
            }
          }))
          .end(function(err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            Achievement.find({
              owner: users[0].id,
              template: template1.id
            }, function(err, achievements) {
              expect(err).to.be.null;
              expect(achievements.length).to.equal(1);
              expect(achievements[0].grantedBy.toString()).to.equal([users[1].id, users[0].id].toString());
              done();
            });
          });
      });
    });
  });

  describe("#count", function() {
    before(function(done) {
      helper.clearDb(function() {
        helper.factories.createList('User', 5, done);
      });
    });

    it("is a success", function(done) {
      chai.request(app)
        .get('/users/count')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done();
        });
    });

    it("returns a total number of all users", function(done) {
      chai.request(app)
        .get('/users/count')
        .end(function(err, res) {
          expect(res.body.count).to.equal(5);
          done();
        });
    });
  });
});
