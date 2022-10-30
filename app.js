var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");


var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var registerRouter = require("./routes/register");
var loginRouter = require("./routes/login");
var folderRouter = require("./routes/folderRoute");
var diagnosisRouter = require("./routes/diagnosisRoute");

const config = require('./config.json');


var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({
	extended: false
}));
app.use(cookieParser('adsadfd'));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.use("/register", registerRouter);
app.use("/login", loginRouter);

app.use("/folder", folderRouter);
app.use("/diagnosis", diagnosisRouter);

module.exports = app;