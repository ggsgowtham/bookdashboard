//****** Set up Express Server and socket.io start
const http = require('http');
const https = require('https');
const app = require('express')();
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require("path");
const assert = require('assert');
const mondodb = require('mongodb');
const secretKey = "books";
const mongoData = mondodb.MongoClient;
const mongoUrl = "mongodb://booksdbAdmin:Admin123@ds031777.mlab.com:31777/booklistdb";
let booksCollectionDb, usersCollectionDb, tempDb, LoggedInUsers = [],
    userIdParams;
//connecting to the database
const client = new mongoData(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

client.connect(function(err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    tempDb = client.db('booklistdb');
    booksCollectionDb = tempDb.collection('booksData');
    usersCollectionDb = tempDb.collection('usersData');
});

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));


var PORT = Number(process.env.PORT || 3000);
server.listen(PORT);
console.log("Server Started at: ", PORT)
    //****** Set up Express Server and socket.io End

//custom application environment variables
var deptParams = "";

//****** APP ROUTES starts here 
//loading JS
//loading libraries
app.get("/js/bootstrap.min.js", function(req, res) {
    console.log("bootstrap loaded");
    res.sendFile(__dirname + '/js/lib/bootstrap.min.js');
});
app.get("/js/popper.min.js", function(req, res) {
    console.log("bootstrap poper min loaded");
    res.sendFile(__dirname + '/js/lib/popper.min.js');
});
app.get("/js/jquery.min.js", function(req, res) {
    res.sendFile(__dirname + '/js/lib/jquery.min.js');
});

//loading custom js
app.get("/js/misc.js", function(req, res) {
    console.log("misc loaded");
    res.sendFile(__dirname + '/js/misc.js');
});
app.get("/js/utlis.js", function(req, res) {
    res.sendFile(__dirname + '/js/utlis.js');
});
//js for the html data 
app.get("/js/login.js", function(req, res) {
    res.sendFile(__dirname + '/js/login.js');
});
app.get("/js/home.js", function(req, res) {
    res.sendFile(__dirname + '/js/home.js');
});
app.get("/js/dept.js", function(req, res) {
    res.sendFile(__dirname + '/js/dept.js');
});

//loading CSS
app.get("/styles/bootstrap.min.css", function(req, res) {
    res.sendFile(__dirname + '/styles/bootstrap.min.css');
});
app.get("/styles/sticky-footer-navbar.css", function(req, res) {
    res.sendFile(__dirname + '/styles/sticky-footer-navbar.css');
});
//loading images
app.get("/images/404.png", function(req, res) {
    res.sendFile(__dirname + '/images/404.png');
});


//load Login page
app.get("/footer", function(req, res) {
    res.sendFile(__dirname + '/views/fragments/footer.html');
});

//load Login page
app.get("/header", function(req, res) {
    res.sendFile(__dirname + '/views/fragments/header.html');
});

//load Login page
app.get("/login", function(req, res) {
    res.sendFile(__dirname + '/views/login.html');
});

//load home page
app.get("/", function(req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

//load userpage page
app.get("/userpage/:userid", function(req, res) {
    console.log(req.params.userid);
    userIdParams = req.params.userid;
    fnGetUserDatabyEmail(userIdParams);
    res.sendFile(__dirname + '/views/userpage.html');
});

app.get('*', function(req, res) {
    res.status(404).sendFile(__dirname + '/views/404.html');
});

//data routes starts here 
//login
app.post("/api/v1/login", function(req, res) {
    var oData = JSON.parse(req.body.loginData) || { username: "", password: "" };
    var uname = oData.name;
    var userId = oData.id;

    //create token here
    var token = jwt.sign({ username: uname }, secretKey);
    return res.status(201).send({
        success: 'true',
        message: 'login sucessful',
        token: token,
        username: uname,
        uid: userId
    });


});

//****** APP ROUTES ends here

io.on("connection", function(socket) {
    socket.on('authorize', function(oMessage) {
        jwt.verify(oMessage.token, secretKey, function(err, decoded) {
            if (err !== null && err.message !== null && err.message.length > 0) {
                socket.emit("authResp", false);
                return false;
            } else {
                var jsonData = decoded;
                if (jsonData.username.toLowerCase() === oMessage.username.toLowerCase()) {
                    socket.emit("authResp", true);
                    console.log("User '" + jsonData.username + "' verified and signed in sucessfully");
                    LoggedInUsers.push(socket.id)
                        //add the pool rooms here later
                }
            }
        });
    });
    socket.on('join_room', function(room) {
        if (LoggedInUsers.indexOf(socket.id) < 0)
            console.log("Security error - trying to join room without logging in");
        else {
            console.log("Joining room " + room);
            socket.join(room);
        }
    });
    //sending home page data 
    socket.on("getInitialBookData", function(oMessage) {
        var startIndex = oMessage.startIndex || 0;
        var requestText = oMessage.requestText || "";
        if (oMessage.oPage === "getInitialBookData") {
            fnGetAjaxData("getInitialBookData", fnInitDataCb, requestText, startIndex);
        } else if (oMessage.oPage === "getBooksbyAuthor") {
            fnGetAjaxData("getBooksbyAuthor", fnInitDataCb, requestText, startIndex);
        } else if (oMessage.oPage === "getBooksbyTitle") {
            fnGetAjaxData("getBooksbyTitle", fnInitDataCb, requestText, startIndex);
        } else if (oMessage.oPage === "getBooksbyIsbn") {
            fnGetAjaxData("getBooksbyIsbn", fnInitDataCb, requestText, startIndex);
        }
    });

    socket.on("makeFav", function(oMessage) {
        var sQuery = "";
        if (oMessage.oQuery === "isbn") {
            sQuery = "isbn:" + oMessage.param;
        } else {
            sQuery = "intitle:" + oMessage.param;
        }
        fnSetFav(sQuery, oMessage.param, oMessage.id);
    });
    socket.on("getUserFavData", function(oMessage) {
        var email = oMessage.id;
        fnGetUserDatabyEmail(email);
    });
    if (userIdParams != "") {
        fnGetUserDatabyEmail(userIdParams);
    }
    socket.on("getFavDataEmail", function(oMessage) {
        var oQuery = oMessage.oData;
        fnGetUserBooksData(oQuery, fnBuildUserDataCb);
    });

});

function fnGetAjaxData(requestType, callback, requestText, startIndex) {
    var oUrl = fnBuildRequest(requestType, callback, requestText, startIndex);
    var cbParams = cbParams || "";
    var ajaxRequest = https.request({
        host: "www.googleapis.com",
        port: 443,
        path: oUrl,
        method: "GET",
    }, function(resp) {
        var str = "";
        resp.on('data', function(data) {
            str += data;
        });
        resp.on('end', function() {
            callback(str, cbParams);
        });
        resp.on('error', function(err) {
            console.log("API request error: ", err);
        });
    });
    ajaxRequest.on('error', function(e) {
        console.log("problem with request" + e);
    });
    ajaxRequest.end();
}

function fnBuildRequest(reqType, callback, requestText, startIndex) {
    var googleBooksAPI = "/books/v1/volumes?q=";
    var maxIndex = 12;
    if (reqType === "getInitialBookData") {
        googleBooksAPI += "subject:" + requestText;
    } else if (reqType === "getBooksbyAuthor") {
        googleBooksAPI += "inauthor:" + requestText;
    } else if (reqType === "getBooksbyTitle") {
        googleBooksAPI += "intitle:" + requestText;
    } else if (reqType === "getBooksbyIsbn") {
        googleBooksAPI += "isbn:" + requestText;
    }
    googleBooksAPI += "&startIndex=" + startIndex;
    googleBooksAPI += "&maxResults=" + maxIndex;

    console.log(googleBooksAPI);
    return googleBooksAPI;
}

function fnInitDataCb(response, responseParams) {
    var bookData = [],
        jsonData = JSON.parse(response);
    oStatus = true;
    for (var i = 0; i < jsonData.items.length; i++) {
        var tempData, isbn = "";
        if (jsonData.items[i].volumeInfo.industryIdentifiers) {
            isbn = jsonData.items[i].volumeInfo.industryIdentifiers[0].identifier
        }
        tempData = {
            "title": jsonData.items[i].volumeInfo.title || "",
            "publisher": jsonData.items[i].volumeInfo.authors.publisher || "",
            "cat": jsonData.items[i].volumeInfo.categories || "",
            "imgLink": jsonData.items[i].volumeInfo.imageLinks.thumbnail || "",
            "extLink": jsonData.items[i].volumeInfo.previewLink || "",
            "smallThumb": jsonData.items[i].volumeInfo.imageLinks.smallThumbnail || "",
            "bookISBN": isbn

        }
        bookData.push(tempData);
    }
    io.sockets.emit('receiveTableData', { oData: JSON.stringify(bookData), status: oStatus });
}

function fnGetUserDatabyEmail(userEmail) {
    usersCollectionDb.find({
        'uId': userEmail
    }).toArray(function(err, results) {
        var favId = [];
        for (var i = 0; i < results.length; i++) {
            favId.push({ oData: results[i].oData, oQuery: results[i].query, uId: userEmail });
        }
        io.sockets.emit('sendFavData', { oData: JSON.stringify(favId) });
    });
}

function fnSetFav(oQuery, oData, uId) {
    var insertData = {
        "query": oQuery,
        "oData": oData,
        "uId": uId
    }
    usersCollectionDb.insertOne(insertData, (err, result) => {
        if (err) return console.log(err);
        else {
            console.log('saved to database');
            io.sockets.emit('favSet', { status: oStatus, oId: oData });
        }
    });
}

function fnGetUserBooksData(query, callback) {
    query = query || ""
    if (query.indexOf("isbn") !== -1) {
        var ajaxRequest = https.request({
            host: "www.googleapis.com",
            port: 443,
            path: "/books/v1/volumes?q=" + query,
            method: "GET",
        }, function(resp) {
            var str = "";
            resp.on('data', function(data) {
                str += data;
            });
            resp.on('end', function() {
                callback(str);
            });
            resp.on('error', function(err) {
                console.log("API request error: ", err);
            });
        });
        ajaxRequest.on('error', function(e) {
            console.log("problem with request" + e);
        });
        ajaxRequest.end();
    }
}

function fnBuildUserDataCb(response) {
    var bookData = [],
        i = 0,
        jsonData = JSON.parse(response);
    oStatus = true;
    var tempData, isbn = "";
    if (jsonData.items[i].volumeInfo.industryIdentifiers) {
        isbn = jsonData.items[i].volumeInfo.industryIdentifiers[0].identifier
    }
    tempData = {
        "title": jsonData.items[i].volumeInfo.title || "",
        "publisher": jsonData.items[i].volumeInfo.authors.publisher || "",
        "cat": jsonData.items[i].volumeInfo.categories || "",
        "imgLink": jsonData.items[i].volumeInfo.imageLinks.thumbnail || "",
        "extLink": jsonData.items[i].volumeInfo.previewLink || "",
        "smallThumb": jsonData.items[i].volumeInfo.imageLinks.smallThumbnail || "",
        "bookISBN": isbn

    }
    bookData.push(tempData);
    io.sockets.emit('sentUserData', { status: oStatus, oId: tempData });
}