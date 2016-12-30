var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../../../models/user.js');
var Restaurant = require('../../../models/restaurant.js');
var SharedList = require('../../../models/sharedList.js');
var helper = require('../../../helper.js');

router.post('/db/shared_list/delete', function(request, response) {
    if (!helper.check_session_email(request, response)) {
        return;
    }

    var email = request.body.email;
    var list_id = request.body.list_id;
    list_id = list_id.trim();
    // delete shared list without query user
    SharedList.findOne({_id: list_id}).populate('owner').populate('users').exec(function(err, shared_list) {
        if (!err) {
            if (shared_list.owner.email == email) {
                shared_list.remove();
                helper.send_response(response, 'Shared list deleted.', 1);
                return;
            } else {
                var edit_list_index = -1;

                // Check if he/she is one of the users.
                for (var i = 0; i < shared_list.users.length; ++i) {
                    if (shared_list.users[i].email == email) {
                        User.findOne({_id: shared_list.users[i]._id}).populate('sharedLists_edit').exec(function(err, user) {
                            if (!err) {
                                console.log("Finding user's sharedLists_edit");
                                console.log("shared_list._id = " + shared_list._id);
                                var list_index = -1;
                                for (var j = 0; j < user.sharedLists_edit.length; ++j) {
                                    console.log("user.sharedLists_edit[" + j + "]._id = " + user.sharedLists_edit[j]._id);
                                    if (user.sharedLists_edit[j]._id.equals(shared_list._id)) {
                                        console.log("User removed the list from it's collection.");
                                        list_index = j;
                                        user.sharedLists_edit.splice(j, 1);
                                        user.save();
                                        break;
                                    }
                                }

                                if (list_index == -1) {
                                    console.log("Nothing found");
                                }
                            }
                        });

                        shared_list.users.splice(i, 1);
                        shared_list.save();
                        edit_list_index = i;
                        break;
                    }
                }

                if (edit_list_index == -1) {
                    helper.send_response(response, "You don't have the permission to delete this list!", 0);
                    return;
                } else {
                    helper.send_response(response, "Removed!", 1);
                    return;
                }
            }
        }
    });
});

module.exports = router;
