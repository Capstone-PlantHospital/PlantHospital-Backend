var express = require("express");
var router = express.Router();

var connection = require("../db");

/* GET users listing. */
// router.get("/", function (req, res, next) {
//   res.send("respond with a resourcessssss");
// });
router.get("/", function (req, res) {
  res.json({ message: "welcome to our upload module apis" });
});

router.get("/db", function (req, res, next) {
  var getUserQ = "select * from user";

  connection.query(getUserQ, function (err, result) {
    if (err) {
      console.log(err);
      res.send("Unable to get User");
    } else {
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
