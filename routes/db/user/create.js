var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../../../models/user.js');

router.post('/db/user/create', function(request, response) {
    var name = request.body.name;
    var email = request.body.email;
    var password = request.body.password;

    console.log(email);

    // Find if the user exist.
    User.find({email: email}).exec(function(err, data) {
        if (data.length != 0) {
            console.log("User found: " + data.length);
            response.send({
                message: 'You have already signed up before.',
                status: 'error',
            });
        } else {
            console.log("email is unique");

            var new_user = new User({
                name: name,
                email: email,
                password: password
            });

            new_user.save(function(err) {
                if(err) {
                    console.log(err);
                    response.send({
                        message: err.errmsg
                    });
                } else {
                    request.session.email = email;
                    request.session.name = name;
                    response.send({
                        message:'success'
                    });
                }
            });
        }
    });
});

module.exports = router;
