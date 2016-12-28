//------------------------------------
//          HELPER FUNCTIONS
//------------------------------------
var exports = module.exports = {};

exports.send_response = function(response, message, status) {
    var send_status = '';
    if (status == 1) {
        send_status = 'success';
    } else if (status == 0) {
        send_status = 'error';
    }

    response.send({
        message: message,
        status: send_status
    });
};

exports.check_session_email = function(request, response) {
    if (!request.body.email) {
        exports.send_response(response, 'Please login first!', 0);
        return false;
    }

    if (!request.session.email || request.session.email != request.body.email) {
        exports.send_response(response, 'Wrong credential! Please login again!', 0);
        return false;
    }
    return true;
};
