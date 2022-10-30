var express = require("express");
var router = express.Router();
const config = require('../config.json');
const cryptojs = require('crypto-js');
const axios = require("axios");

var connection = require("../db");



let verificationCode = 0; // 인증 코드 (6자리 숫자)

var user = {
  first_name: '',
  last_name: '',
  number: '',
};

var res_message = {}

//인증번호 전송
var sendVerification = async (req, res) => {
  try {

    const user_number = user.number; // SMS를 수신할 전화번호
    const date = Date.now().toString(); // 날짜 string

    verificationCode = 0
    for (let i = 0; i < 4; i++) {
      verificationCode *= 10;
      verificationCode += parseInt(Math.random() * (10 - 1) + 1);
    };
    console.log("code :", verificationCode)

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
    const hmac = cryptojs.algo.HMAC.create(cryptojs.algo.SHA256, sens_secret_key);
    hmac.update(method);
    hmac.update(space);
    hmac.update(url2);
    hmac.update(newLine);
    hmac.update(date);
    hmac.update(newLine);
    console.log("sens access key :", sens_access_key);
    hmac.update(sens_access_key);
    const hash = hmac.finalize();
    const signature = hash.toString(cryptojs.enc.Base64);
    console.log("시그니처 :", signature);

    // sens 서버로 요청 전송
    const smsRes = await axios({
      // request({
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

    res_message = await smsRes.data;
    console.log("response1 : ", res_message);
    return res_message

  } catch (err) {
    console.log("코드 발송 err", err)
    console.log("response err : ", res_message);

    return res_message
  }
};



router.post("/", (req, res) => {

  user.first_name = req.body.first_name
  user.last_name = req.body.last_name
  user.number = req.body.number

  //중복체크
  var duplicateCheckQ = 'SELECT * from user WHERE user_number = ?';

  connection.query(
    duplicateCheckQ, [user.number],
    async function (err, result, fields) {
      if (err) {
        console.log("error ocurred - duplicate:", err);
        res.send({
          code: 400,
          failed: "error ocurred",
        });
      } else {
        var keys = Object.keys(result);

        //중복 아닐때
        if (keys.length == 0) {

          try {
            await sendVerification()
          } catch (err) {
            console.log(err)
          }

          res.send(res_message);

        } else {
          console.log("중복임");
          res.send({
            code: 400,
            failed: "중복",
          });
        }
      }
    }
  )
});


//인증번호 확인
router.post("/match", function (req, res) {


  const userVerficationCode = req.body.code; //사용자가 입력한 인증번호
  console.log("code: ", verificationCode, "user code:", userVerficationCode)
  console.log("user first :", user.first_name, "user last:", user.last_name, " number :", user.number)


  if (verificationCode == userVerficationCode) {
    //번호 인증 후 insert
    var registerUserQ = "INSERT INTO user(user_first_name, user_last_name, user_number) values (?,?,?);";

    connection.query(
      registerUserQ,
      [user.first_name, user.last_name, user.number],
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
});


module.exports = router;