 var ck = new fnCookie();

 $(document).ready(function() {
     //fnVerifyUser();
     var userLoginName = ck._fnGetCookie("login_name") || '';
     $("#loginName").text(userLoginName);
     fnLoadHeader();
     fnLoadFooter();
     var requestText = $("#searchData").val() || "";
     //initial call on load of page 
     socket.emit("getInitialBookData", { oPage: "getInitialBookData", requestText: "" });
     socket.on("receiveTableData", function(response) {
         fnBuldTableData(response.oData);
     });
 });

 function fnGetData() {
     var requestText = $("#searchData").val() || "";
     var reqType = $("#dropdownData").val() || "";
     if (reqType == "title") {
         socket.emit("getInitialBookData", { oPage: "getInitialBookData", requestText: requestText });
     } else if (reqType == "isbn") {
         socket.emit("getInitialBookData", { oPage: "getBooksbyIsbn", requestText: requestText });
     } else if (reqType == "author") {
         socket.emit("getInitialBookData", { oPage: "getBooksbyAuthor", requestText: requestText });
     } else {
         socket.emit("getInitialBookData", { oPage: "getInitialBookData", requestText: "" });
     }
 }

 function fnBuldTableData(responseData) {
     var jsonData = JSON.parse(responseData),
         tableData = [];
     if (jsonData.length < 1) {
         tableData.push(['<div class="col-md-3"><div class="card mb-4 box-shadow"">']);
         tableData.push(['<div class="card-body"><p>No Data Found</p>']);
         tableData.push(['</div></div>']);
     } else {
         for (var i = 0; i < jsonData.length; i++) {
             tableData.push('<div class="col-md-3"><div class="card mb-3 box-shadow" >');
             tableData.push('<img class="card-img-top" height="200px" src="' + jsonData[i].smallThumb + '" alt="' + jsonData[i].title + '">');
             tableData.push(' <div class="card-body"><p title="' + jsonData[i].title + '" class="card-text">' + jsonData[i].title + '</p>');
             tableData.push(' <div class="d-flex justify-content-between align-items-center">');
             tableData.push('<a href="' + jsonData[i].extLink + '" target="_blank" class="btn btn-sm btn-outline-secondary"><i class="fas fa-external-link-square-alt"></i></a>');
             tableData.push('<a href="javascript:;" onClick="fnMakeFav(' + jsonData[i].cat + ')" class="btn btn-sm btn-outline-secondary heartColor"><i class="far fa-heart"></i></a>');
             tableData.push('</div>');
             tableData.push('<span class="badge">' + (jsonData[i].cat === "undefined") ? "" : jsonData[i].cat + '</span>');
             tableData.push('</div></div></div>');
         }
     }
     $("#mainTableBody").html(tableData.join(""));
 }