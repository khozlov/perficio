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

    var templates;

    before(function(done) {
      helper.clearDb(function() {
        helper.factories.createList('Template', 2, function(err, createdTemplates) {
          templates = createdTemplates;
          done();
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

    it("returns all templates", function(done) {
      chai.request(app)
        .get('/templates')
        .end(function(err, res) {
          var templateIdMap = helper.idMap(res.body),
            resTemplate1 = res.body[templateIdMap[templates[0].id]],
            resTemplate2 = res.body[templateIdMap[templates[1].id]];
          expect(res.body.length).to.equal(2);

          expect(resTemplate1.name).to.equal(templates[0].name);
          expect(resTemplate1.imageUrl).to.equal(templates[0].imageUrl);
          expect(resTemplate1.description).to.equal(templates[0].description);
          expect(resTemplate1.author).to.equal(templates[0].author.id);

          expect(resTemplate2.name).to.equal(templates[1].name);
          expect(resTemplate2.imageUrl).to.equal(templates[1].imageUrl);
          expect(resTemplate2.description).to.equal(templates[1].description);
          expect(resTemplate2.author).to.equal(templates[1].author.id);
          done();
        });
    });
  });

  describe("#show", function() {

    var template;

    before(function(done) {
      helper.clearDb(function() {
        helper.factories.create('Template', function(err, createdTemplate) {
          template = createdTemplate;
          done();
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

    it("returns the template", function(done) {
      chai.request(app)
        .get('/templates/' + template.id)
        .end(function(err, res) {
          expect(res.body.name).to.equal(template.name);
          expect(res.body.imageUrl).to.equal(template.imageUrl);
          expect(res.body.description).to.equal(template.description);
          expect(res.body.author).to.equal(template.author.id);
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
            imageUrl: 'bronzeUrl'
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
            imageUrl: 'silverUrl'
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
              done();
            });
          });
      });
    });
  });

  describe('#achievementCount', function() {
    var template;

    before(function(done) {
      helper.clearDb(function() {
        helper.factories.createList('User', 2, function(err, createdUsers) {
          helper.factories.createList('Template', 2, function(err, createdTemplates) {
            template = createdTemplates[0];
            helper.factories.create('Achievement', {
              template: createdTemplates[0],
              owner: createdUsers[0]
            }, function() {
              helper.factories.create('Achievement', {
                template: createdTemplates[0],
                owner: createdUsers[1]
              }, done);
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

    it("counts all achievement for a given template", function(done) {
      chai.request(app)
        .get('/templates/' + template.id + '/achievements/count')
        .end(function(err, res) {
          expect(res.body.count).to.equal(2);
          done();
        });
    });
  });

  describe("#count", function() {
    before(function(done) {
      helper.clearDb(function() {
        helper.factories.createList('Template', 3, done);
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

    it("returns a total number of all templates", function(done) {
      chai.request(app)
        .get('/templates/count')
        .end(function(err, res) {
          expect(res.body.count).to.equal(3);
          done();
        });
    });
  });
});
