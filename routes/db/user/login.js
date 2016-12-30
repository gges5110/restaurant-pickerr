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

              if (!request.session.invite) {
                  response.send({
                      message: "Logged in! Redirect to Yelp search...",
                      status: 'success',
                      redirect: '/yelp'
                  });
                  return;
              } else {
                  request.session.invite = false;
                  var list_id = request.session.invite_list_id;
                  var redirectURL = '/invite?list_id=' + list_id;
                  request.session.invite_list_id = null;
                  response.send({
                      message: "Logged in! Redirect to " + redirectURL,
                      status: 'success',
                      redirect: redirectURL
                  });
              }

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
