 var ck = new fnCookie();

 $(document).ready(function() {
     //fnVerifyUser();
     var userLoginName = ck._fnGetCookie("login_name") || '';
     $("#loginName").text(userLoginName);
     fnLoadHeader();
     fnLoadFooter();
     
 });
