var express = require("express");
var router = express.Router();
const config = require('../config.json');
const cryptojs = require('crypto-js');
const axios = require("axios");

var connection = require("../db");

let verificationCode = 0; // 인증 코드 (6자리 숫자)

var users = {
  name: '',
  number: '',
};

router.post("/", function (req, res) {

  users.name = req.body.name
  users.number = req.body.number

  // console.log("UU :", req.body);
  // console.log("UU :", users);

  //중복체크
  var duplicateCheckQ = 'SELECT * from user WHERE user_name = ? AND user_number = ?';

  connection.query(
    duplicateCheckQ, [users.name, users.number],
    function (err, result, fields) {
      if (err) {
        console.log("error ocurred - duplicate:", err);
        res.send({
          code: 400,
          failed: "error ocurred",
        });
      } else {
        // console.log("duplicateCheckQ :",typeof result);
        // console.log("duplicateCheckQ :",result);
        var keys = Object.keys(result);
        // console.log("keykey:", keys);

        //중복 아닐때
        if (keys.length == 0) {
          console.log("nothing 중복아님");

          // 인증번호보내기
          const sendVerification = async (req, res) => {
            try {
              const user_number = users.number; // SMS를 수신할 전화번호
              verificationCode = 0;
              for (let i = 0; i < 6; i++) {
                verificationCode *= 10;
                verificationCode += parseInt(Math.random() * 10);
              };
              console.log("code :", verificationCode)
              const date = Date.now().toString(); // 날짜 string

              // 환경 변수
              const sens_service_id = config.SENSAPI.serviceid;
              const sens_access_key = config.SENSAPI.accesskey;
              const sens_secret_key = config.SENSAPI.secretkey
              const sens_call_number = config.SENSAPI.companynumber;

              // url 관련 변수 선언
              const method = "POST";
              const space = " ";
              const newLine = "\n";
              const url = `https://sens.apigw.ntruss.com/sms/v2/services/${sens_service_id}/messages`;
              const url2 = `/sms/v2/services/${sens_service_id}/messages`;

              // signature 작성 : crypto-js 모듈을 이용하여 암호화
              console.log(1);
              const hmac = cryptojs.algo.HMAC.create(cryptojs.algo.SHA256, sens_secret_key);
              console.log(2);
              hmac.update(method);
              hmac.update(space);
              hmac.update(url2);
              hmac.update(newLine);
              hmac.update(date);
              hmac.update(newLine);
              console.log("sens access key :", sens_access_key);
              hmac.update(sens_access_key);
              const hash = hmac.finalize();
              console.log(4);
              const signature = hash.toString(cryptojs.enc.Base64);
              console.log(5);
              console.log("시그니처 :", signature);

              // sens 서버로 요청 전송
              const smsRes = await axios({
                method: method,
                url: url,
                headers: {
                  "Contenc-type": "application/json; charset=utf-8",
                  "x-ncp-iam-access-key": sens_access_key,
                  "x-ncp-apigw-timestamp": date,
                  "x-ncp-apigw-signature-v2": signature,
                },
                data: {
                  type: "SMS",
                  countryCode: "82",
                  from: sens_call_number,
                  content: `인증번호는 [${verificationCode}] 입니다.`,
                  messages: [{
                    to: `${user_number}`
                  }],
                },
              });
              console.log("response", smsRes.data);


            } catch (err) {
              console.log("문자인증 err", err)
            }
          };

          res.send(sendVerification(res));

        } else {
          console.log("중복임");
          res.send({
            code: 200,
            failed: "중복",
          });
        }
      }
    }
  )
});

router.post("/match", function (req, res) {

  const userVerficationCode = req.body.code; //사용자가 입력한 인증번호
  console.log("code: ", verificationCode, "user code:", userVerficationCode)
  console.log("user name :", users.name, " number :", users.number)


  if (verificationCode == userVerficationCode) {
    //번호 인증 후 insert
    var registerUserQ = "INSERT INTO user(user_name, user_number) values (?,?);";

    connection.query(
      registerUserQ,
      [users.name, users.number],
      function (err, result, fields) {
        if (err) {
          console.log("error ocurred - register", err);
          res.send({
            code: 400,
            failed: "error ocurred",
          });
        } else {
          console.log("insert 성공! The solution is: ", result);
          res.send({
            code: 200,
            success: "user registered sucessfully",
          });
        }
      }
    );
  } else {
    res.send({
      code: 400,
      failed: "인증번호 틀림",
    });
  }
  console.log("code: ", verificationCode, "user code:", userVerficationCode)


});




module.exports = router;