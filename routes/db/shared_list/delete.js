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
    SharedList.findOne({_id: list_id}).exec(function(err, shared_list) {
        if (!err) {
            shared_list.remove();
            helper.send_response(response, 'Shared list deleted.', 1);
            return;
        }
    });
});

module.exports = router;
