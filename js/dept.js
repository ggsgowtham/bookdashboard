 var ck = new fnCookie(),
     tableData = [],
     dataCount, userId;

 $(document).ready(function() {
     //fnVerifyUser();
     var userLoginName = ck._fnGetCookie("login_name") || '';
     $("#loginName").text(userLoginName);
     fnLoadHeader();
     fnLoadFooter();
     setTimeout(function() {
         $("#loginName").text(userLoginName);
     }, 500);

 });

 function fnBuldTableData(responseData) {
     var jsonData = [],
         tableData = [];
     jsonData.push(responseData);
     if (jsonData.length < 1) {
         tableData.push(['<div class="col-md-3"><div class="card mb-4 box-shadow"">']);
         tableData.push(['<div class="card-body"><p>No Data Found</p>']);
         tableData.push(['</div></div>']);
     } else {
         var i = 0,
             isDisabledClass = "disabled";
         if (userId.toLowerCase() === ck._fnGetCookie("login_id").toLowerCase()) {
             isDisabledClass = "";
         }
         var id = (jsonData[i].bookISBN.length > 0) ? jsonData[i].bookISBN : jsonData[i].title;
         var fnClickFunc = "fnMakeFav('" + jsonData[i].bookISBN + "')";
         tableData.push('<div class="col-md-3"><div class="card mb-3 box-shadow" >');
         tableData.push('<img class="card-img-top" height="200px" src="' + jsonData[i].smallThumb + '" alt="' + jsonData[i].title + '">');
         tableData.push(' <div class="card-body"><p title="' + jsonData[i].title + '" class="card-text">' + jsonData[i].title + '</p>');
         tableData.push(' <div class="d-flex justify-content-between align-items-center">');
         tableData.push('<a href="' + jsonData[i].extLink + '" target="_blank" class="btn btn-sm btn-outline-secondary"><i class="fas fa-external-link-square-alt"></i></a>');
         tableData.push('<a href="javascript:;" id="' + id + '" onClick="' + fnClickFunc + '" class="btn btn-sm btn-outline-secondary heartColor madeFav ' + isDisabledClass + '"><i class="far fa-heart"></i></a>');
         tableData.push('</div>');
         tableData.push('<span class="badge">' + (jsonData[i].cat === "undefined") ? "" : jsonData[i].cat + '</span>');
         tableData.push('</div></div></div>');

     }
     $("#mainTableBody").append(tableData.join(""));
 }

 socket.on("sendFavData", function(oMessage) {
     var oId = JSON.parse(oMessage.oData);
     console.log(oId);
     dataCount = oId.length;
     userId = oId[0].uId;
     for (var i = 0; i < oId.length; i++) {
         socket.emit("getFavDataEmail", { oData: oId[i].oQuery });
     }
 });
 socket.on("sentUserData", function(oMessage) {
     var jsonData = oMessage.oId;
     fnBuldTableData(jsonData);
 });