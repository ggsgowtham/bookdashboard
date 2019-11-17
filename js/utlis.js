
function fnCookie() {};
fnCookie.prototype._createCookie = function(cookieName, cookieValue, daysToExpire) {
    var date = new Date();
    daysToExpire = daysToExpire || 1;
    //expired midnight
    var midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    window.document.cookie = cookieName + "=" + cookieValue + "; expires=" + midnight.toGMTString() + ";path=/";
};
fnCookie.prototype._deleteCookie = function(name) {
    window.document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;";
};
fnCookie.prototype._fnGetCookie = function(name) {
    var nameEQ = name + "=";
    var ca = window.document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

//module.exports = fnCookie;