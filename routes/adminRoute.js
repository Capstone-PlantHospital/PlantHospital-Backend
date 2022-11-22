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

		var sql = "INSERT INTO notice(name, content) values (?,?);";

		connection.query(sql, [name, content], (err, result, fields) => {
			console.log(result);
			resSend(res, 200, 'notice create sucessfully');
		});

	} catch (err) {
		err.statusCode = 400;
		res.send(err);
	}
});




module.exports = router;