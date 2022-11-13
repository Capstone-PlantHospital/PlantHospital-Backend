var express = require("express");
var router = express.Router();

/*
render - 정적파일을 렌더링
index라는 정적파일을 클라이언트에게 전달 = app.js에서 express.static()으로 지정한 public
req : request 클라이언트의 요청 정보 
res : response 클라이언트에게 응답하기 위한 정보
next : 다음 미들웨어 함수를 가리키는 object
*/
var message = {}
var func_a = () => {
  message1 = {
    "code": "aa",
    "message": "BB"
  }
  message = message1
  return message
}



router.get("/aa", (req, res) => {
  console.log("cookie", req.cookies);
  let time = new Date();
  res.send(time);

});

router.all("/cc", (req, res, next) => {
  res.send("All 요청에 대한 응답ccc");
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", {
    title: "Express"
  });
});
module.exports = router;