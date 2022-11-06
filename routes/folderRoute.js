var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const config = require('../config.json');

var connection = require("../db");

let token = '';
var folder = {
	name: '',
	type: '',
	user_id: NaN,
	id: NaN
};

/* 폴더 전체 리스트 */
router.get('/list', (req, res) => {
	token = req.headers.token;
	console.log("token", token);

	let decoded = jwt.verify(token, config.JWT.accessToken);
	if (decoded) {
		//user_id로 폴더 가져오기
		console.log("user_id :", decoded.user_id)

		var sql = "SELECT * FROM folder where folder_user_id = ?";
		try {
			connection.query(sql, [decoded.user_id], (err, result, fields) => {
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
		res.send("폴더 불러오기 실패");
	}
});

/* 폴더 생성 */
router.post('/create', (req, res) => {
	token = req.headers.token;

	let decoded = jwt.verify(token, config.JWT.accessToken);

	if (decoded) {
		//user_id로 폴더 가져오기
		console.log("user_id :", decoded.user_id);

		folder.name = req.body.name
		folder.type = req.body.type
		folder.user_id = decoded.user_id


		console.log("folder", folder);
		var sql = "INSERT INTO folder(folder_name, folder_type, folder_user_id) values (?,?,?);";

		try {
			connection.query(sql, [folder.name, folder.type, folder.user_id], (err, result, fields) => {
				if (err) {
					res.send(err);
				} else {
					console.log(result);
					res.send('폴더 생성 성공');
				}
			});

		} catch (err) {
			res.send(err);
		}


		// new Promise((resolve, reject) => {
		// 	connection.query(sql, [folder.name, folder.type, folder.user_id], (err, result, fields) => {
		// 		if (err) {
		// 			reject(err);
		// 			res.send(err);
		// 		} else {
		// 			resolve(result);
		// 		}
		// 	});
		// }).then((result) => {
		// 	console.log(result);
		// 	res.send('폴더 생성 성공');
		// });

	} else {
		res.send("폴더 생성 실패");
	}
});

/* 폴더 수정 */
/* 수정정보 입력 > 폴더id 조회 > 수정 */
router.post('/update', (req, res) => {
	token = req.headers.token;

	let decoded = jwt.verify(token, config.JWT.accessToken);

	if (decoded) {
		//폴더 아이디 확인
		folder.name = req.body.name
		folder.id = req.body.folder_id

		var sql = "UPDATE folder SET folder_name = ? WHERE folder_id = ?;"
		try {
			connection.query(sql, [folder.name, folder.id], (err, result, fields) => {
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
		res.send("폴더 수정 실패");
	}
});

/* 폴더 삭제 */
/* 폴더삭제 > 폴더id 조회 > 폴더 내 기록 삭제 */
router.post('/delete', (req, res) => {
	token = req.headers.token;

	let decoded = jwt.verify(token, config.JWT.accessToken);

	if (decoded) {
		//폴더 아이디 확인
		folder.id = req.body.folder_id
		folder.user_id = decoded.user_id
		console.log(folder);

		var sql = "DELETE FROM folder WHERE folder_id =? AND folder_user_id =?;"
		try {
			connection.query(sql, [folder.id, folder.user_id], (err, result, fields) => {
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
		res.send("폴더 삭제 실패");
	}
});

module.exports = router;