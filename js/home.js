 var ck = new fnCookie();

 $(document).ready(function() {
     fnVerifyUser();
     var userLoginName = ck._fnGetCookie("login_name") || '';
     fnLoadHeader();
     fnLoadFooter();
     var requestText = $("#searchData").val() || "";
     //initial call on load of page 
     socket.emit("getInitialBookData", { oPage: "getInitialBookData", requestText: "" });
     socket.on("receiveTableData", function(response) {
         fnBuldTableData(response.oData);
     });
     setTimeout(function() {
         $("#loginName").text(userLoginName);
     }, 500);
     socket.emit("getUserFavData", { id: ck._fnGetCookie("login_id") });
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
     } else if (reqType == "email") {
         if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(requestText)) {
             fnSearchByEmail();
         } else {
             alert("Please enter a valid email");
             return false;
         }
     } else {
         socket.emit("getInitialBookData", { oPage: "getInitialBookData", requestText: "" });
     }
 }

 function fnBuldTableData(responseData) {
     var jsonData = JSON.parse(responseData),
         tableData = [],
         pagination = [];
     if (jsonData.length < 1) {
         tableData.push(['<div class="col-md-3"><div class="card mb-4 box-shadow"">']);
         tableData.push(['<div class="card-body"><p>No Data Found</p>']);
         tableData.push(['</div></div>']);
     } else {
         for (var i = 0; i < jsonData.length; i++) {
             var fnClickFunc = (jsonData[i].bookISBN.length > 0) ? "fnMakeFav('" + jsonData[i].bookISBN + "')" : "fnMakeFav('" + jsonData[i].title + "')";
             var id = (jsonData[i].bookISBN.length > 0) ? jsonData[i].bookISBN : jsonData[i].title;
             tableData.push('<div class="col-md-3"><div class="card mb-3 box-shadow" >');
             tableData.push('<img class="card-img-top" height="200px" src="' + jsonData[i].smallThumb + '" alt="' + jsonData[i].title + '">');
             tableData.push(' <div class="card-body"><p title="' + jsonData[i].title + '" class="card-text">' + jsonData[i].title + '</p>');
             tableData.push(' <div class="d-flex justify-content-between align-items-center">');
             tableData.push('<a href="' + jsonData[i].extLink + '" target="_blank" class="btn btn-sm btn-outline-secondary"><i class="fas fa-external-link-square-alt"></i></a>');
             tableData.push('<a href="javascript:;" id="' + id + '" onClick="' + fnClickFunc + '" class="btn btn-sm btn-outline-secondary heartColor"><i class="far fa-heart"></i></a>');
             tableData.push('</div>');
             tableData.push('<span class="badge">' + (jsonData[i].cat === "undefined") ? "" : jsonData[i].cat + '</span>');
             tableData.push('</div></div></div>');
         }
         for (var i = 0; i < 10; i++) {
             pagination.push('<li class="page-item"><a class="page-link" href="javascript:;" onClick="fnPage(' + (i + 1) + ')">' + (i + 1) + '</a></li>');
         }
     }
     $("#mainTableBody").html(tableData.join(""));
     $("#paginationList").html(pagination.join(""));
 }

 function fnPage(pageNo) {
     var requestText = $("#searchData").val() || "";
     var reqType = $("#dropdownData").val() || "";
     if (reqType == "title") {
         socket.emit("getInitialBookData", { oPage: "getInitialBookData", requestText: requestText, startIndex: (pageNo * 10) });
     } else if (reqType == "isbn") {
         socket.emit("getInitialBookData", { oPage: "getBooksbyIsbn", requestText: requestText, startIndex: (pageNo * 10) });
     } else if (reqType == "author") {
         socket.emit("getInitialBookData", { oPage: "getBooksbyAuthor", requestText: requestText, startIndex: (pageNo * 10) });
     } else {
         socket.emit("getInitialBookData", { oPage: "getInitialBookData", requestText: "", startIndex: (pageNo * 10) });
     }
 }

 function fnSearchByEmail() {
     var requestText = $("#searchData").val() || "";
     window.location.href = "/userpage/" + requestText;
 }

 function fnMakeFav(isbn) {
     var searchType = "";
     if (isbn.length > 0) {
         socket.emit("makeFav", { oQuery: "isbn", param: isbn, id: ck._fnGetCookie("login_id") });
     } else {
         socket.emit("makeFav", { oQuery: "title", param: isbn, id: ck._fnGetCookie("login_id") });
     }
 }
 socket.on("favSet", function(oMessage) {
     var oId = oMessage.oId;
     $("#" + oId).addClass("disabled").addClass("madeFav");
 });
 socket.on("sendFavData", function(oMessage) {
     var oId = oMessage.oData;
     setTimeout(function() {
         for (var i = 0; i < oId.length; i++) {
             $("#" + oId[i].oData).addClass("disabled").addClass("madeFav");
         }
     }, 500);
 });