var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../../../models/user.js');

router.post('/db/user/login', function(request, response) {
    // my_session = request.session;
    var email = request.body.email;
    var password = request.body.password;

    // get the user
    User.find({ email: email }, function(err, user) {
      if (user.length == 0) {
          console.log("user.length: " + user.length);
          // Could not find the user.
          response.send({
              message :'Could not find the user or the password is incorrect.',
              status: "error"
          });
      } else {
          if (user[0].password === password) {
              // Successfully login!
              request.session.email = user[0].email;
              request.session.name = user[0].name;

              response.redirect('/yelp');
          } else {
              // Wrong password.
              console.log(user[0].password);
              console.log(password);
              response.send({
                  message :'Could not find the user or the password is incorrect.',
                  status: "error"
              });
          }
      }
    });
});

module.exports = router;
