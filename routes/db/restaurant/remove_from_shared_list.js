var express = require('express');
var router = express.Router();
var helper = require('../../../helper.js');
var mongoose = require('mongoose');

var User = require('../../../models/user.js');
var Restaurant = require('../../../models/restaurant.js');
var SharedList = require('../../../models/sharedList.js');


router.post('/db/restaurant/remove_from_shared_list', function(request, response) {
    if (!helper.check_session_email(request, response)) {
        return;
    }

    var email = request.body.email;
    var list_id = request.body.list_id.trim();
    var yelp_id = request.body.yelp_id.trim();
    console.log('id = ' + list_id);
    SharedList.findOne({_id: list_id}).populate('restaurants').populate('users').exec(function(err, shared_list) {
        if (!shared_list) {
            helper.send_response(response, 'Cannot find the list!', 0);
            return;
        }

        // Check if it is one of the users
        var user_index = -1;
        for (var i = 0; i < shared_list.users.length; ++i) {
            if (shared_list.users[i].email == email) {
                user_index = i;
                break;
            }
        }

        if (user_index == -1) {
            helper.send_response(response, 'You are not permitted to modify this list!\nPlease contact the list owner.', 0);
            return;
        }

        // Found user in shared list, remove the item from shared list.
        var restaurant_index = -1;
        var name = "";
        for (var j = 0; j < shared_list.restaurants.length; ++j) {
            if (shared_list.restaurants[j].yelp_id == yelp_id) {
                name = shared_list.restaurants[i].name;
                shared_list.restaurants.splice(i, 1);
                restaurant_index = j;
                break;
            }
        }

        if (restaurant_index == -1) {
            helper.send_response(response, 'Cannot find the restaurant in the shared list!', 0);
            return;
        } else {
            shared_list.save(function(err) {
                if (err) {
                    helper.send_response(response, 'Failed to save!', 0);
                    return;
                } else {
                    helper.send_response(response, 'Removed ' + name + ' from your shared list!', 1);
                }
            })
        }
    });
});

module.exports = router;
