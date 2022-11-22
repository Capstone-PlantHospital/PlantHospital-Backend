var express = require("express");
var router = express.Router();

const config = require('../config.json');
const cryptojs = require('crypto-js');
const axios = require("axios");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const connection = require("../db");
const {
	check_body
} = require("../utils/checkBody");
const {
	resSend
} = require('../utils/resSend');


dotenv.config();

let verificationCode = 0; // 인증 코드 (6자리 숫자)

var res_message = {}

var user = {
	first_name: '',
	number: '',
	id: ''
};


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



//sign메서드에서 4번째 인자로 콜백함수 넣기. 없으면 동기처리
function generateAccessToken() {
	return jwt.sign({
		user_id: user.id,
		user_first_name: user.first_name
	}, config.JWT.accessToken, {
		expiresIn: '7d'
	})
};

router.get("/", (req, res) => {
	try {
		check_body(req.query);
		user.number = req.query.number

		//가입 체크
		var registerCheckQ = 'SELECT * from user WHERE user_number = ?';

		connection.query(
			registerCheckQ, [user.number],
			async function (err, result, fields) {
				if (err) {
					throw err;
				} else {
					var keys = Object.keys(result);

					//회원 정보가 있을 때
					if (keys.length != 0) {
						//탈퇴한 회원일 때
						if (result[0].active == 0) {
							resSend(res, 400, '탈퇴한회원');

						}
						//관리자인 경우
						if (result[0].admin == 1) {
							resSend(res, 200, '관리자');

						} else {
							user.first_name = result[0].user_first_name;
							user.id = result[0].user_id;

							try {
								await sendVerification()
							} catch (err) {
								err.statusCode = 400;
								res.send(err);
							}
							res.send(res_message);
						}
					} else {
						resSend(res, 400, '회원 아님');

					}


				}
			}
		)

	} catch (err) {
		err.statusCode = 400;
		res.send(err);
	}

});

router.get("/match", (req, res) => {
	try {
		check_body(req.query);
		const userVerficationCode = req.query.code; //사용자가 입력한 인증번호
		// verificationCode = 1396
		if (verificationCode == userVerficationCode) {

			const token = generateAccessToken();

			console.log("Token :", token);

			res.send({
				statusCode: 200,
				message: "user login sucessfully",
				token: token
			});
		} else {
			resSend(res, 400, 'user login fail');
		}
	} catch (err) {
		err.statusCode = 400;
		res.send(err);
	}

});

// router.get("/test", (req, res) => {
// 	let token = req.headers.token;
// 	console.log("Testa", token);

// 	let decoded = jwt.verify(token, config.JWT.accessToken);
// 	console.log("decode", decoded);
// 	if (decoded) {
// 		res.send("권한 ok");
// 	} else {
// 		res.send("권한 x");
// 	}
// });


module.exports = router;