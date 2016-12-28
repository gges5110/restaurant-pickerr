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

    User.findOne({email: email}).populate('restaurants').exec(function(err, user) {
        if (!user) {
            helper.send_response(response, 'Cannot find this user in database.', 0);
            return;
        } else {
            my_user = user;
            // TODO: Check request body data
            var yelp_id = request.body.yelp_id;
            var index = -1;
            var name = "";
            for (var i = 0; i < user.restaurants.length; ++i) {
                if (user.restaurants[i].yelp_id == yelp_id) {
                    name = user.restaurants[i].name;
                    user.restaurants.splice(i, 1);
                    index = i;
                    break;
                }
            }

            if (index == -1) {
                helper.send_response(response, 'Cannot find it in your bucketlist!', 0);
            } else {
                user.save(function(err) {
                    if (err) {
                        helper.send_response(response, 'Failed to save!', 0);
                    } else {
                        helper.send_response(response, 'Removed ' + name + '!', 1);
                    }
                })
            }
        }
    });
});

module.exports = router;
