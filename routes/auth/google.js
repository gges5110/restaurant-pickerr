'use strict';

var express = require('express');
var router = express.Router();

var User = require('../../models/user.js');

var google = require('googleapis');
var plus = google.plus('v1');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.HOSTNAME + '/auth/google/callback'
);

router.get('/auth/google', function(request, response) {
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // will return a refresh token
    scope: [
      'https://www.googleapis.com/auth/plus.me',
      'https://www.googleapis.com/auth/userinfo.email'
    ] // can be a space-delimited string or an array of scopes
  });

  response.redirect(url);
})

router.get('/auth/google/callback', function(request, response) {
  let code = request.query.code;
  oauth2Client.getToken(code, function(err, tokens) {
    if (err) {
      response.send(err);
    } else {
      oauth2Client.setCredentials(tokens);
      plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, profile) {
        if (err) {
          console.log(err);
        } else {
          // Create a user account based on the email and redirect them back to Yelp page.
          User.findOne({email: profile.emails[0].value}).exec(function(err, user) {
            console.log(user);
            if (user === null) {
              let name = profile.displayName;
              let email = profile.emails[0].value;

              var new_user = new User({
                name: name,
                email: email
              });

              new_user.save(function(err) {
                if(err) {
                  console.log(err);
                } else {
                  request.session.email = email;
                  request.session.name = name;
                  response.redirect('/yelp');
                }
              });
            } else {
              request.session.email = user.email;
              request.session.name = user.name;
              response.redirect('/yelp');
            }
          });
        }
      });
    }
  })
})

module.exports = router;
