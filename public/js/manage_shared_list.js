$(document).on('click', '#add_shared_list_btn', function(event) {
    if ($('#add_shared_list_input').val() == "") {
        toastr.warning('Please provide a name!');
        return;
    }

    // Get all the inputs.
    var name = $('#add_shared_list_input').val();

    $.ajax({
        url: '/db/shared_list/new_list',
        method: "POST",
        data: JSON.stringify({
            email: $('#nav_email').attr('title'),
            name: name,
        }),
        contentType: 'application/json',
        success: function(data) {
            if (data.status === 'error') {
                toastr.warning(data.message);
            } else {
                toastr.success(data.message);
            }
        }
    });
});
