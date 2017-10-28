var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../../../models/user.js');
var helper = require('../../../helper.js');

router.post('/db/user/update_info', function(request, response) {
  if (!helper.check_session_email(request, response)) {
    return;
  }
  var email = request.body.email;
  var name = request.body.name;

  User.findOne({email: email}).exec(function(err, user) {
    if (!user) {
      helper.send_response(response, 'Cannot find this user!', 0);
      return;
    } else {
      var name_changed = false;
      if (user.name != name) {
        name_changed = true;
      }

      user.name = name;

      user.save(function(err) {
        if (err) {
          helper.send_response(response, 'Error when saving user!', 0);
          return;
        } else {
          if (name_changed) {
            request.session.name = name;
            helper.send_response(response, 'Username has changed!', 1);
          } else {
            helper.send_response(response, 'Nothing has changed!', 1);
          }
          return;
        }
      })
    }
  });
});

module.exports = router;
