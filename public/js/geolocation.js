

// Check if the browser has support for the Geolocation API
if (!navigator.geolocation) {
    $('.find-me').addClass("disabled");
    $('.no-browser-support').addClass("visible");

} else {
    console.log("inside!");
    $(document).on('click', '.find-me',function(e) {


        navigator.geolocation.getCurrentPosition(function(position) {
            console.log("button");
            // Get the coordinates of the current possition.
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;

            $('.latitude').text(lat.toFixed(3));
            $('.longitude').text(lng.toFixed(3));
            $('.coordinates').addClass('visible');

            // Create a new map and place a marker at the device location.
            var map = new GMaps({
                el: '#map',
                lat: lat,
                lng: lng
            });

            map.addMarker({
                lat: lat,
                lng: lng
            });
        });
    });
}