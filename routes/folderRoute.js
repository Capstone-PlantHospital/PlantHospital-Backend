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
var folder = {
	name: '',
	type: '',
	user_id: NaN,
	id: NaN
};

/* 폴더 전체 리스트 */
router.get('/list', (req, res) => {
	try {
		token = req.headers.token;
		console.log(token)

		let decoded = jwt.verify(token, config.JWT.accessToken);
		if (decoded) {
			//user_id로 폴더 가져오기
			console.log("user_id :", decoded.user_id)

			var sql = "SELECT * FROM folder where folder_user_id = ?";

			connection.query(sql, [decoded.user_id], (err, result, fields) => {
				if (err) {
					err.statusCode = 400;
					res.send(err);
				} else {
					console.log(result);
					res.send(result);
				}
			});
		}
	} catch (err) {
		err.statusCode = 400;
		res.send(err);
	}
});



/* 작물별 폴더 리스트 가져오기 */
router.get('/type', (req, res) => {
	try {
		token = req.headers.token;

		check_body(req.query)

		let decoded = jwt.verify(token, config.JWT.accessToken);
		if (decoded) {
			console.log("user_id :", decoded.user_id)

			folder.type = req.query.type;

			var sql = "SELECT * FROM folder where folder_user_id = ? AND folder_type = ?;";

			connection.query(sql, [decoded.user_id, folder.type], (err, result, fields) => {
				if (err) {
					err.statusCode = 400;
					res.send(err);
				} else {
					console.log(result);
					res.send(result);
				}
			});
		}
	} catch (err) {
		err.statusCode = 400;
		res.send(err);
	}
});



/* 폴더 생성 */
router.post('/create', (req, res) => {
	try {
		token = req.headers.token;

		let decoded = jwt.verify(token, config.JWT.accessToken);

		check_body(req.body);

		if (decoded) {
			//user_id로 폴더 가져오기
			console.log("user_id :", decoded.user_id);

			folder.name = req.body.name
			folder.type = req.body.type
			folder.user_id = decoded.user_id

			console.log("folder", folder);
			var sql = "INSERT INTO folder(folder_name, folder_type, folder_user_id) values (?,?,?);";

			connection.query(sql, [folder.name, folder.type, folder.user_id], (err, result, fields) => {
				if (err) {
					err.statusCode = 400;
					res.send(err);
				} else {
					console.log(result);
					resSend(res, 200, 'folder create sucessfully');
				}
			});
		}
	} catch (err) {
		err.statusCode = 400;
		res.send(err);
	}
});



/* 폴더 수정 */
/* 수정정보 입력 > 폴더id 조회 > 수정 */
router.put('/update', (req, res) => {
	try {
		token = req.headers.token;

		check_body(req.body);

		let decoded = jwt.verify(token, config.JWT.accessToken);

		if (decoded) {
			//폴더 아이디 확인
			folder.name = req.body.name
			folder.id = req.body.folder_id

			var sql = "UPDATE folder SET folder_name = ? WHERE folder_id = ? and folder_user_id =?;"
			try {
				connection.query(sql, [folder.name, folder.id, decoded.user_id], (err, result, fields) => {
					if (err) {
						err.statusCode = 400;
						res.send(err);
					} else {
						console.log(result);
						result.statusCode = 200;
						res.send(result);
					}
				});
			} catch (err) {
				err.statusCode = 400;
				res.send(err);
			}
		} else {
			resSend(res, 400, 'folder update fail');
		}
	} catch (err) {
		err.statusCode = 400;
		res.send(err);
	}
});

/* 폴더 삭제 */
/* 폴더삭제 > 폴더id 조회 > 폴더 내 기록 삭제 */
router.delete('/delete', (req, res) => {
	try {
		token = req.headers.token;

		let decoded = jwt.verify(token, config.JWT.accessToken);
		check_body(req.query);

		if (decoded) {
			//폴더 아이디 확인
			folder.id = req.query.id

			var sql = "DELETE FROM folder WHERE folder_id =? AND folder_user_id =?;"
			connection.query(sql, [folder.id, decoded.user_id], (err, result, fields) => {
				if (err) {
					err.statusCode = 400;
					res.send(err);
				} else {
					console.log(result);
					result.statusCode = 200;
					res.send(result);
				}
			});
		} else {
			resSend(res, 400, 'folder delete fail');
		}
	} catch (err) {
		err.statusCode = 400;
		res.send(err);
	}
});



// router.get("/db/:id", function (req, res, next) {
// 	console.log(3);
// 	let tt = req.params.id;
// 	console.log(tt);
// 	res.send(tt);

// 	// var getUserQ = "select * from user where user_id =" + req.params.id;
// 	// console.log(3);

// 	// connection.query(getUserQ, function (err, result) {
// 	// 	if (err) {
// 	// 		console.log(err);
// 	// 		res.send("Unable to get User");
// 	// 	} else {
// 	// 		res.send(result);
// 	// 	}
// 	// });
// });


module.exports = router;