$(document).ready(function () {
    $(".nav li").removeClass("active");
    $('#nav_li_user_settings').addClass('active');
});

$(document).on('click', '#logout_btn', function(event) {
    NProgress.start();
    $.ajax({
        url: '/logout',
        method: 'POST',
        success: function(data) {
            NProgress.done(true);
            window.location.href = "/login";
        }
    });
});

$(document).on('click', '#update_account_btn', function(event) {
    var name = $('#update_name_input').val();

    if (name == "") {
        toastr.warning("Name can not be empty.");
    } else {
        NProgress.start();
        $.ajax({
            url: '/db/user/update_info',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                email: $('#nav_email').attr('title'),
                name: name
            }),
            success: function(data) {
                if (data.status == 'error') {
                    toastr.warning(data.message);
                } else {
                    toastr.success(data.message);
                }
                NProgress.done(true);
            }
        });
    }


});

$(document).on('click', '#delete_account_btn', function(event) {
    var password = $('#delete_password_confirm_input').val();
    NProgress.start();
    $.ajax({
        url: '/db/user/delete',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            email: $('#nav_email').attr('title'),
            password: password
        }),
        success: function(data) {
            if (data.status == 'error') {
                toastr.warning(data.message);
            } else {
                toastr.success(data.message);
                // Might want to wait for a second here.
                window.location.href = "/login";
            }
            NProgress.done(true);
        }
    })
});
