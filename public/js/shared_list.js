$(document).on('click', '#remove_from_list_btn', function(event) {
    NProgress.start();

    var index = $(this).attr('tabindex');
    toastr.info($('#list_id').text());
    $.ajax({
        url: '/db/restaurant/remove_from_shared_list',
        method: 'POST',
        data: JSON.stringify({
            email: $('#nav_email').attr('title'),
            yelp_id: $('#list_yelp_id_' + index).text(),
            list_id: $('#list_id').text()
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
