var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const config = require('../config.json');

var connection = require("../db");

let token = '';



/* 진단기록 폴더별 리스트 */
router.get('/list', (req, res) => {
	token = req.headers.token;
	console.log("token", token);

	let decoded = jwt.verify(token, config.JWT.accessToken);
	if (decoded) {

		var sql = "";
		try {
			connection.query(sql, [], (err, result, fields) => {
				if (err) {
					res.send(err);
				} else {
					console.log(result);
					res.send(result);
				}
			});

		} catch (err) {
			res.send(err);
		}
	} else {
		res.send("진단기록 불러오기 실패");
	}
});



/* 진단기록 생성 */
router.post('/create', (req, res) => {
	token = req.headers.token;

	let decoded = jwt.verify(token, config.JWT.accessToken);

	if (decoded) {

		var sql = ""

		try {
			connection.query(sql, [folder.name, folder.type, folder.user_id], (err, result, fields) => {
				if (err) {
					res.send(err);
				} else {
					console.log(result);
					res.send('진단기록 생성 성공');
				}
			});

		} catch (err) {
			res.send(err);
		}



	} else {
		res.send(" 실패");
	}
});

module.exports = router;