var express = require("express");
var router = express.Router();
const config = require('../config.json');

var connection = require("../db");

const {
	check_body
} = require("../utils/checkBody");
const {
	resSend
} = require('../utils/resSend');


/* 알림 생성 */
router.post('/create', (req, res) => {
	try {
		check_body(req.body);
		let name = req.body.name;
		let content = req.body.content;

		// var sql = "INSERT INTO notice(name, content) values (?,?);";
		var sql = "UPDATE notice SET name=?, content=? where id = 1;"

		connection.query(sql, [name, content], (err, result, fields) => {
			if (err) {
				err.statusCode = 400;
				res.send(err);
			} else {
				console.log(result);
				resSend(res, 200, 'notice create sucessfully');
			}
		});

	} catch (err) {
		err.statusCode = 400;
		res.send(err);
	}
});


/* 알림 불러오기 */
router.get('/load', (req, res) => {
	try {
		var sql = "SELECT * FROM notice where id = 1;"

		connection.query(sql, (err, result, fields) => {
			if (err) {
				err.statusCode = 400;
				res.send(err);
			} else {
				console.log(result);
				res.send(result);
			}
		});

	} catch (err) {
		err.statusCode = 400;
		res.send(err);
	}
});


module.exports = router;