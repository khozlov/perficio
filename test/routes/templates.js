"use strict";

var helper = require('../test_helper'),
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = require('chai').expect,
  app = require('../../lib/app'),
  mongoose = require('mongoose'),
  Template = mongoose.model('Template');

chai.use(chaiHttp);

describe('templates routes', function() {

  describe("#index", function() {

    var template, privateTemplate;

    before(function(done) {
      helper.clearDb(function() {
        helper.factories.create('Template', function(err, createdTemplate) {
          helper.factories.create('Template', {
            private: true
          }, function(err, createdPrivateTemplate) {
            template = createdTemplate;
            privateTemplate = createdPrivateTemplate;
            done();
          });
        });
      });
    });

    it("is a success", function(done) {
      chai.request(app)
        .get('/templates')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done();
        });
    });

    it("returns all templates if the user is logged in", function(done) {
      chai.request(app)
        .get('/templates')
        .set('Cookie', helper.sessionCookies({
          'passport': {
            'user': template.author.id
          }
        }))
        .end(function(err, res) {
          var templateIdMap = helper.idMap(res.body),
            resTemplate1 = res.body[templateIdMap[template.id]],
            resTemplate2 = res.body[templateIdMap[privateTemplate.id]];
          expect(res.body.length).to.equal(2);

          expect(resTemplate1.name).to.equal(template.name);
          expect(resTemplate1.imageUrl).to.equal(template.imageUrl);
          expect(resTemplate1.description).to.equal(template.description);
          expect(resTemplate1.author).to.equal(template.author.id);
          expect(resTemplate1.private).to.equal(template.private);
          expect(resTemplate1.tags[0]).to.equal(template.tags[0]);
          expect(resTemplate1.tags[1]).to.equal(template.tags[1]);

          expect(resTemplate2.name).to.equal(privateTemplate.name);
          expect(resTemplate2.imageUrl).to.equal(privateTemplate.imageUrl);
          expect(resTemplate2.description).to.equal(privateTemplate.description);
          expect(resTemplate2.author).to.equal(privateTemplate.author.id);
          expect(resTemplate2.private).to.equal(privateTemplate.private);
          expect(resTemplate2.tags[0]).to.equal(privateTemplate.tags[0]);
          expect(resTemplate2.tags[1]).to.equal(privateTemplate.tags[1]);
          done();
        });
    });

    it("returns only public templates if the user is not logged in", function(done) {
      chai.request(app)
        .get('/templates')
        .end(function(err, res) {
          var resTemplate = res.body[0];
          expect(res.body.length).to.equal(1);

          expect(resTemplate.name).to.equal(template.name);
          expect(resTemplate.imageUrl).to.equal(template.imageUrl);
          expect(resTemplate.description).to.equal(template.description);
          expect(resTemplate.author).to.equal(template.author.id);
          expect(resTemplate.private).to.equal(template.private);
          expect(resTemplate.tags[0]).to.equal(template.tags[0]);
          expect(resTemplate.tags[1]).to.equal(template.tags[1]);
          done();
        });
    });
  });

  describe("#show", function() {

    var template, privateTemplate;

    before(function(done) {
      helper.clearDb(function() {
        helper.factories.create('Template', function(err, createdTemplate) {
          template = createdTemplate;
          helper.factories.create('Template', {
            private: true
          }, function(err, createdPrivateTemplate) {
            privateTemplate = createdPrivateTemplate;
            done();
          });
        });
      });
    });

    it("is a success", function(done) {
      chai.request(app)
        .get('/templates/' + template.id)
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done();
        });
    });

    it("returns the template if it's public", function(done) {
      chai.request(app)
        .get('/templates/' + template.id)
        .end(function(err, res) {
          expect(res.body.name).to.equal(template.name);
          expect(res.body.imageUrl).to.equal(template.imageUrl);
          expect(res.body.description).to.equal(template.description);
          expect(res.body.author).to.equal(template.author.id);
          expect(res.body.private).to.equal(template.private);
          expect(res.body.tags[0]).to.equal(template.tags[0]);
          expect(res.body.tags[1]).to.equal(template.tags[1]);
          done();
        });
    });

    it("returns the template if it's private and the user is logged in", function(done) {
      chai.request(app)
        .get('/templates/' + privateTemplate.id)
        .set('Cookie', helper.sessionCookies({
          'passport': {
            'user': template.author.id
          }
        }))
        .end(function(err, res) {
          expect(res.body.name).to.equal(privateTemplate.name);
          expect(res.body.imageUrl).to.equal(privateTemplate.imageUrl);
          expect(res.body.description).to.equal(privateTemplate.description);
          expect(res.body.author).to.equal(privateTemplate.author.id);
          expect(res.body.private).to.equal(privateTemplate.private);
          expect(res.body.tags[0]).to.equal(privateTemplate.tags[0]);
          expect(res.body.tags[1]).to.equal(privateTemplate.tags[1]);
          done();
        });
    });

    it("returns 404 if the template is not found", function(done) {
      chai.request(app)
        .get('/templates/trelemorele')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(404);
          done();
        });
    });

    it("returns 404 if the template is private and the user is not logged in", function(done) {
      chai.request(app)
        .get('/templates/' + privateTemplate.id)
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  describe("#create", function() {
    var admin, regular;

    beforeEach(function(done) {
      helper.clearDb(function() {
        helper.factories.create('User', {
          admin: true
        }, function(err, createdUser1) {
          helper.factories.create('User', function(err, createdUser2) {
            admin = createdUser1;
            regular = createdUser2;
            done();
          });
        });
      });
    });

    it("responds with 401 when user is not authenticated", function(done) {
      chai.request(app)
        .post('/templates')
        .send({
          name: 'Bronze medal',
          description: 'For being not quite the best',
          imageUrl: 'bronzeUrl'
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
          done();
        });
    });

    it("responds with 401 when user is not an admin", function(done) {
      chai.request(app)
        .post('/templates')
        .set('Cookie', helper.sessionCookies({
          'passport': {
            'user': regular.id
          }
        }))
        .send({
          name: 'Bronze medal',
          description: 'For being not quite the best',
          imageUrl: 'bronzeUrl'
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
          done();
        });
    });

    it("creates the template", function(done) {
      Template.count({
        author: admin
      }, function(err, count) {
        expect(count).to.equal(0);
        chai.request(app)
          .post('/templates')
          .set('Cookie', helper.sessionCookies({
            'passport': {
              'user': admin.id
            }
          }))
          .send({
            name: 'Bronze medal',
            description: 'For being not quite the best',
            imageUrl: 'bronzeUrl',
            private: true,
            tags: ['testTag']
          })
          .end(function(err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(201);
            Template.find({}, function(err, templates) {
              expect(err).to.be.null;
              expect(templates.length).to.equal(1);
              expect(templates[0].name).to.equal('Bronze medal');
              expect(templates[0].description).to.equal('For being not quite the best');
              expect(templates[0].imageUrl).to.equal('bronzeUrl');
              expect(templates[0].author.toString()).to.equal(admin.id.toString());
              expect(templates[0].private).to.equal(true);
              expect(templates[0].tags[0]).to.equal('testTag');
              done();
            });
          });
      });
    });

    it("returns the created template", function(done) {
      Template.count({
        author: admin
      }, function(err, count) {
        expect(count).to.equal(0);
        chai.request(app)
          .post('/templates')
          .set('Cookie', helper.sessionCookies({
            'passport': {
              'user': admin.id
            }
          }))
          .send({
            name: 'Silver medal',
            description: 'For being not quite the best',
            imageUrl: 'silverUrl',
            private: true,
            tags: ['testTag']
          })
          .end(function(err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(201);
            Template.find({}, function(err, templates) {
              expect(err).to.be.null;
              expect(res.body._id).to.equal(templates[0].id);
              expect(res.body.name).to.equal(templates[0].name);
              expect(res.body.description).to.equal(templates[0].description);
              expect(res.body.imageUrl).to.equal(templates[0].imageUrl);
              expect(res.body.author).to.equal(templates[0].author.toString());
              expect(res.body.private).to.equal(templates[0].private);
              expect(res.body.tags[0]).to.equal(templates[0].tags[0]);
              done();
            });
          });
      });
    });
  });

  describe('#achievementCount', function() {
    var template, privateTemplate;

    before(function(done) {
      helper.clearDb(function() {
        helper.factories.createList('User', 2, function(err, createdUsers) {
          helper.factories.create('Template', function(err, createdTemplate) {
            template = createdTemplate;
            helper.factories.create('Template', {
              private: true
            }, function(err, createdPrivateTemplate) {
              privateTemplate = createdPrivateTemplate;
              helper.factories.createList('Achievement', 2, {
                template: createdTemplate,
                owner: createdUsers[0]
              }, function() {
                helper.factories.create('Achievement', {
                  template: createdPrivateTemplate,
                  owner: createdUsers[1]
                }, done);
              });
            });
          });
        });
      });
    });

    it("is a success", function(done) {
      chai.request(app)
        .get('/templates/' + template.id + '/achievements/count')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done();
        });
    });

    it("counts all achievements for a given template", function(done) {
      chai.request(app)
        .get('/templates/' + template.id + '/achievements/count')
        .end(function(err, res) {
          expect(res.body.count).to.equal(2);
          done();
        });
    });

    it("counts all achievements for a given private template if the user is logged in", function(done) {
      chai.request(app)
        .get('/templates/' + privateTemplate.id + '/achievements/count')
        .set('Cookie', helper.sessionCookies({
          'passport': {
            'user': template.author.id
          }
        }))
        .end(function(err, res) {
          expect(res.body.count).to.equal(1);
          done();
        });
    });

    it("responds with 404 for a given private template if the user is not logged in", function(done) {
      chai.request(app)
        .get('/templates/' + privateTemplate.id + '/achievements/count')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(404);
          done();
        });
    });

    it("responds with 404 if the template cannot be found", function(done) {
      chai.request(app)
        .get('/templates/tralalalala/achievements/count')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  describe("#count", function() {
    var user;

    before(function(done) {
      helper.clearDb(function() {
        helper.factories.createList('Template', 2, function(err, createdTemplates) {
          user = createdTemplates[0].author;
          helper.factories.create('Template', {
            private: true
          }, done)
        });
      });
    });

    it("is a success", function(done) {
      chai.request(app)
        .get('/templates/count')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done();
        });
    });

    it("returns a total number of all templates if the user is logged in", function(done) {
      chai.request(app)
        .get('/templates/count')
        .set('Cookie', helper.sessionCookies({
          'passport': {
            'user': user.id
          }
        }))
        .end(function(err, res) {
          expect(res.body.count).to.equal(3);
          done();
        });
    });

    it("returns a total number of public templates if the user is not logged in", function(done) {
      chai.request(app)
        .get('/templates/count')
        .end(function(err, res) {
          expect(res.body.count).to.equal(2);
          done();
        });
    });
  });
});
