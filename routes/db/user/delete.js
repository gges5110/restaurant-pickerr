var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../../../models/user.js');
var helper = require('../../../helper.js');

router.post('/db/user/delete', function(request, response) {
    if (!helper.check_session_email(request, response)) {
        return;
    }

    var email = request.body.email;

    User.findOne({email: email}).exec(function(err, user) {
        if (!user) {
            helper.send_response(response, 'No user is found.', 0);
            return;
        } else {
            if(user.password != request.body.password) {
                helper.send_response(response, 'Password is incorrect.', 0);
                return;
            } else {
                user.remove();
                helper.send_response(response, 'User deleted.', 1);
                return;
            }
        }
    });

});

module.exports = router;
