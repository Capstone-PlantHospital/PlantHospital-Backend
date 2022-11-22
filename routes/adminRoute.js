var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const config = require('../config.json');

var connection = require("../db");

const {
	check_body
} = require("../utils/checkBody");
const {
	resSend
} = require('../utils/resSend');

let token = '';



router.get("/", (req, res) => {
	try {
		check_body(req.body);
		user.number = req.body.number

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
		check_body(req.body);
		const userVerficationCode = req.body.code; //사용자가 입력한 인증번호
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

module.exports = router;