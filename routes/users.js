var express = require("express");
var router = express.Router();

var connection = require("../db");


router.get("/", function (req, res) {
  res.json({
    message: "welcome to our upload module apis"
  });
});

router.get("/db", function (req, res, next) {
  var getUserQ = "select * from user where user_number = '01071544263'";

  connection.query(getUserQ, function (err, result) {
    if (err) {
      console.log(err);
      res.send("Unable to get User");
    } else {
      console.log(result[0].user_first_name);
      res.send(result);
    }
  });
});

router.get("/db/:id", function (req, res, next) {
  var getUserQ = "select * from user where user_id =" + req.params.id;

  connection.query(getUserQ, function (err, result) {
    if (err) {
      console.log(err);
      res.send("Unable to get User");
    } else {
      res.send(result);
    }
  });
});

module.exports = router;