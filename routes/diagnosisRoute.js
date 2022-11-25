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

let Id_folder = [];
let Id_diagnosis = [];

let token = '';

var diagnosis = {
	diagnosis_id: '',
	folder_id: '',
	diagnosis_type: '',
	disease_name: '',
	disease_scale: '',
	disease_img: ''
}

/* 진단기록 폴더별 리스트 */
router.get('/list', (req, res) => {
	try {
		token = req.headers.token;
		check_body(req.query);

		let decoded = jwt.verify(token, config.JWT.accessToken);
		if (decoded) {
			diagnosis.folder_id = req.query.folder_id
			var sql = "SELECT * from diagnosis WHERE diagnosis_folder_id = ?";
			try {
				connection.query(sql, [diagnosis.folder_id], (err, result, fields) => {
					console.log(result);
					res.send(result);
				});
			} catch (err) {
				res.send(err);
			}
		} else {
			resSend(res, 400, 'get diagnosis fail');
		}

	} catch (err) {
		err.statusCode = 400;
		res.send(err);
	}

});



/* 진단기록 생성 */
router.post('/create', (req, res) => {
	try {
		token = req.headers.token;
		check_body(req.body);

		let decoded = jwt.verify(token, config.JWT.accessToken);

		//현재 날짜 가져오기 + 포맷 
		var date = (JSON.stringify(new Date())).substring(1, 11);
		console.log("date", date);

		diagnosis.folder_id = req.body.folder_id;
		diagnosis.diagnosis_type = req.body.diagnosis_type;
		diagnosis.disease_name = req.body.disease_name;
		diagnosis.disease_scale = req.body.disease_scale;
		diagnosis.disease_img = req.body.disease_img;

		if (decoded) {

			var sql = "INSERT INTO diagnosis(diagnosis_folder_id, diagnosis_type, diagnosis_date,   disease_name, disease_scale, disease_img ) \
					values (?,?,?,?,?,?);";

			connection.query(sql,
				[diagnosis.folder_id, diagnosis.diagnosis_type, date, diagnosis.disease_name, diagnosis.disease_scale, diagnosis.disease_img],
				(err, result, fields) => {
					console.log(result);
					//resSend(res, 200, 'diagnosis create sucessfully');
					res.send(result);
				});
		} else {
			resSend(res, 400, 'diagnosis create fail');
		}
	} catch (err) {
		err.statusCode = 400;
		res.send(err);
	}
});


/* 진단기록 수정 */
/* 수정정보 입력(수량, 폴더 변경) > 진단기록 id 조회 > 수정 */
router.put('/update', (req, res) => {
	try {
		token = req.headers.token;
		check_body(req.body);

		let decoded = jwt.verify(token, config.JWT.accessToken);

		if (decoded) {
			diagnosis.diagnosis_id = req.body.diagnosis_id
			diagnosis.folder_id = req.body.folder_id
			diagnosis.disease_scale = req.body.disease_scale

			//여기서 수정할 폴더의 작물종류와 진단기록의 작물 종류를 확인해야함.
			var sql = "UPDATE diagnosis SET disease_scale = ?, diagnosis_folder_id = ? WHERE diagnosis_id = ?;"
			connection.query(sql,
				[diagnosis.disease_scale, diagnosis.folder_id, diagnosis.diagnosis_id],
				(err, result, fields) => {
					if (err) {
						err.statusCode = 400;
						res.send(err);
					} else {
						console.log(result);
						if (result.affectedRows <= 0) {
							resSend(res, 400, 'diagnosis update fail')
						} else {
							res.send(result)
						}
					}
				});
		} else {
			resSend(res, 400, 'diagnosis update fail')
		}
	} catch (err) {
		err.statusCode = 400;
		res.send(err);
	}
});


/* 진단기록 삭제 */
/* 진단기록 삭제 > 진단기록 id 조회 > 기록 삭제 */
router.delete('/delete', (req, res) => {
	try {
		token = req.headers.token;
		check_body(req.query);

		let decoded = jwt.verify(token, config.JWT.accessToken);

		if (decoded) {
			diagnosis.diagnosis_id = req.query.diagnosis_id

			var sql = "DELETE FROM diagnosis WHERE diagnosis_id =?;"
			connection.query(sql,
				[diagnosis.diagnosis_id],
				(err, result, fields) => {
					if (err) {
						err.statusCode = 400;
						res.send(err);
					} else {
						console.log(result);
						if (result.affectedRows <= 0) {
							resSend(res, 400, 'diagnosis delete fail')
						} else {
							res.send(result)
						}
					}
				});
		} else {
			resSend(res, 400, 'diagnosis delete fail')
		}
	} catch (err) {
		err.statusCode = 400;
		res.send(err);
	}
});





function delete_list() {

	console.log("Id_folder = ", Id_folder);
	console.log("Id_diagnosis = ", Id_diagnosis);
	Id_diagnosis = []
	Id_folder = []
	console.log("Id_folder = ", Id_folder, "Id_diagnosis = ", Id_diagnosis);

}

/* 진단기록 랜덤으로 가져오기 1 */
router.get('/random', (req, res, next) => {
	try {
		token = req.headers.token;

		let decoded = jwt.verify(token, config.JWT.accessToken);
		if (decoded) {

			user_id = decoded.user_id;
			var sql = "SELECT folder_id from folder WHERE folder_user_id = ?";
			try {
				connection.query(sql, user_id, (err, result, fields) => {
					if (result.length == 0) {
						resSend(res, 200, 'NOTHING');
					} else {
						for (const item of result) {
							Id_folder.push(item.folder_id)
						}
						next();
					}
				});
			} catch (err) {
				delete_list()
				res.send(err);
			}
		} else {
			resSend(res, 400, 'get diagnosis fail');
		}
	} catch (err) {
		delete_list()
		err.statusCode = 400;
		res.send(err);
	}
});



/* 진단기록 랜덤으로 가져오기 2 */
router.get('/random', (req, res, next) => {
	try {
		token = req.headers.token;

		var sql = "SELECT diagnosis_id from diagnosis WHERE diagnosis_folder_id in (?";
		for (let i = 0; i < Id_folder.length - 1; i++) {
			sql += ', ?';
		}
		sql += ');'

		console.log("sql = ", sql);

		try {
			connection.query(sql, Id_folder, (err, result, fields) => {
				if (result.length == 0) {
					resSend(res, 200, 'NOTHING');
					delete_list()
				} else {
					for (const item of result) {
						Id_diagnosis.push(item.diagnosis_id)
					}
					next();
				}
			});
		} catch (err) {
			delete_list()
			res.send(err);
		}
	} catch (err) {
		delete_list()
		err.statusCode = 400;
		res.send(err);
	}
});


/* 진단기록 랜덤으로 가져오기 3 */
router.get('/random', (req, res, next) => {
	try {
		token = req.headers.token;
		console.log("Id_diagnosis.length", Id_diagnosis.length);

		let id = Math.floor(Math.random() * (Id_diagnosis.length));
		console.log("id -", id)

		var sql = "SELECT * from diagnosis WHERE diagnosis_id = ?";
		try {
			connection.query(sql, [Id_diagnosis[id]], (err, result, fields) => {
				console.log(result);
				result[0].statusCode = 202;
				res.send(result[0]);

			});
		} catch (err) {
			delete_list()
			res.send(err);
		}

		delete_list()

	} catch (err) {
		delete_list()
		err.statusCode = 400;
		res.send(err);
	}
});


module.exports = router;
