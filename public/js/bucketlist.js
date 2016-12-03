$(document).ready(function () {
    $(".nav li").removeClass("active");
    $('#nav_li_bucketlist').addClass('active');
});

$(document).on('click', '#remove_from_list_btn', function(event) {
    NProgress.start();


    var index = $(this).attr('tabindex');

    $.ajax({
        url: '/db/restaurant/remove_from_user_list',
        method: 'POST',
        data: JSON.stringify({
            email: $('#nav_email').attr('title'),
            yelp_id: $('#list_yelp_id_' + index).text()
        }),
        contentType: 'application/json',
        success: function(data) {
            if (data.status == 'error') {
                toastr.warning(data.message);
            } else {
                toastr.success(data.message);
                $('.list_table_row[tabindex=' + index + ']').remove();
            }

        }
    })

    NProgress.done(true);
});

$(document).on('click', '#pick_btn', function(event) {
    var rowCount = $('#yelp_table tbody tr').length;
    var randomnumber = Math.floor(Math.random() * rowCount);
    toastr.success("The restaurant is: " + $('#list_yelp_name_' + randomnumber).text());
});
