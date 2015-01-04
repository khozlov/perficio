var express = require('express'),
  router = express.Router(),
  users = require('../controllers/users'),
  templates = require('../controllers/templates');

router.route('/')
  .get(templates.index)
  .post(users.ensureAdmin, templates.create);
router.route('/:id')
  .get(templates.show);

module.exports = router;
