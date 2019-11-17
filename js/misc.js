var socket = io('', {
    'reconnection': true,
    'reconnectionDelay': 1000,
    'reconnectionAttempts': 50
});
var oIntervalTimeOut = 5000;

function fnLogout() {
    var objCK = new fnCookie();
    objCK._deleteCookie("login");
    objCK._deleteCookie("login_name");
    objCK._deleteCookie("login_id");
    var lorigin = window.location.origin;
    window.location.replace(lorigin + "/login");
    return false;
}

$(document).ready(function() {
    $("#mainTableData").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $("#mainTableBody .card-text").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});

function fnVerifyUser() {
    var ck = new fnCookie();
    var token = ck._fnGetCookie("login") || '';
    var userLoginName = ck._fnGetCookie("login_name") || '';
    if (token.length !== 0 && token !== null) {
        socket.emit("authorize", { "token": token, "username": userLoginName });
        socket.on("authResp", function(oMessage) {
            if (!oMessage) {
                fnLogout();
            } else {
                socket.emit('join_room', "booksDashboard");
            }
            //else do nothing let him use the session
        });

    } else {
        fnLogout();
    }
}

function fnLoadFooter() {
    fetch("/footer").then(response => {
        return response.text()
    }).then(data => {
        document.querySelector("customFooter").innerHTML = data;
    });
}

function fnLoadHeader() {
    fetch("/header").then(response => {
        return response.text()
    }).then(data => {
        document.querySelector("customHeader").innerHTML = data;

    });
}