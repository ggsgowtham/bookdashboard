function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    $.ajax({
        url: "/api/v1/login",
        type: "POST",
        dataType: "JSON",
        data: {
            loginData: JSON.stringify({ name: profile.getName(), id: profile.getEmail(), status: "success" }),
        },
        error: function(err) {
            $("#error").show();
            return false;
        },
        success: function(response) {
            if (response.success == "true") {
                var ck = new fnCookie();
                ck._createCookie('login', response.token, 1);
                ck._createCookie('login_name', response.username, 1);
                ck._createCookie('login_id', response.uid, 1);
                var lorigin = window.location.origin;
                window.location.replace(lorigin + "/");
                return false;
            } else {
                $("#error").show();
                return false;

            }
        }
    });
}

$(window).on('beforeunload', function() {
    socket.close();
});