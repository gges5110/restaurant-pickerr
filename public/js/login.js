$(document).ready(function () {
    $(".nav li").removeClass("active"); // this will remove the active class from
                                        // previously active menu item
    $('#nav_li_login').addClass('active');
});

$(document).on('click', '#login_btn', function(event) {
    var email = $('#login_email_input').val();
    var password = $('#login_password_input').val();

    if (email == "" || password == "") {
        toastr.warning("Email or Password can not be empty.");
    } else {
        NProgress.start();
        // Send AJAX request to server.
        $.ajax({
            method: "POST",
            url: "/db/user/login",
            data: JSON.stringify({
                email: email,
                password: password
            }),
            contentType: "application/json",
            success: function(data) {
                if (data.status == "error") {
                    toastr.warning(data.message);
                } else {
                    toastr.success("User Login!");
                    window.location.href = "/";
                }
                NProgress.done(true);

            }
        });
        // NProgress.done(true);
    }




});

$(document).on('click', '#signup_btn', function(event) {
    var email = $('#signup_email_input').val();
    var name = $('#signup_name_input').val();
    var password = $('#signup_password_input').val();
    var password_confirm = $('#signup_password_confirm_input').val();

    if (email == "" || password == "" || name == "") {
        toastr.warning("Email/Name/Password can not be empty.");
    } else if(password != password_confirm) {
        toastr.warning("Passwords does not match.");
    } else {
        NProgress.start();

        $.ajax({
            method: "POST",
            url: "/db/user/create",
            data: JSON.stringify({
                "name": name,
                "email": email,
                "password": password
            }),
            contentType: "application/json",
            success: function(data) {
                if (data.status == "error") {
                    toastr.warning(data.message);
                } else {
                    toastr.success("User Created!");
                    window.location.href = "/user_settings";
                }
                NProgress.done(true);
            }
        });
    }
});
