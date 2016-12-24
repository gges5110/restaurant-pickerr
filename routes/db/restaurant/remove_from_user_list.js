var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../../../models/user.js');
var Restaurant = require('../../../models/restaurant.js');
var helper = require('../../../helper.js');

router.post('/db/restaurant/remove_from_user_list', function(request, response) {
    if (!helper.check_session_email(request, response)) {
        return;
    }

    var email = request.body.email;

    User.findOne({email: email}).exec(function(err, user) {
        if (!user) {
            helper.send_response(response, 'Cannot find this user in database.', 0);
            return;
        } else {
            my_user = user;
            // TODO: Check request body data
            var yelp_id = request.body.yelp_id;

            Restaurant.findOne({ yelp_id: yelp_id }).remove( function(msg) {
                // Not sure if there is any msg being passed back from remove. Blindly send success?
                helper.send_response(response, 'Removed!', 1);
            });

        }
    });
});

module.exports = router;
