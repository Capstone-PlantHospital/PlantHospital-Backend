var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const {
	del
} = require("memory-cache");
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

let nameset = new Set();
let analysis_result = {}
let all_dic = {
	"bean_bacterial_pustule": {
		date: [],
		scale: []
	},
	"bean_bacterial_leaf_blight": {
		date: [],
		scale: []
	},
	"green_onion_purple_blotch": {
		date: [],
		scale: []
	},
	"green_onion_downy_mildew": {
		date: [],
		scale: []
	},
	"green_onion_rust": {
		date: [],
		scale: []
	},
	"napa_cabbage_black_rot": {
		date: [],
		scale: []
	},
	"napa_cabbage_downy_mildew": {
		date: [],
		scale: []
	},
	"pepper_anthracnose": {
		date: [],
		scale: []
	},
	"pepper_powdery_mildew": {
		date: [],
		scale: []
	},
	"radish_black_spot": {
		date: [],
		scale: []
	},
	"radish_downy_mildew": {
		date: [],
		scale: []
	}
}

/* 진단기록 폴더별 리스트 */
router.get('/list', (req, res) => {
	try {
		token = req.headers.token;
		check_body(req.query);

		let decoded = jwt.verify(token, config.JWT.accessToken);
		if (decoded) {
			diagnosis.folder_id = req.query.folder_id
			diagnosis.disease_name = req.query.disease_name
			var sql = "SELECT * from diagnosis WHERE diagnosis_folder_id = ? and disease_name =?";
			try {
				connection.query(sql, [diagnosis.folder_id, diagnosis.disease_name], (err, result, fields) => {
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
			console.log(diagnosis)

			connection.query(sql,
				[diagnosis.folder_id, diagnosis.diagnosis_type, date, diagnosis.disease_name, diagnosis.disease_scale, diagnosis.disease_img],
				(err, result, fields) => {
					if (err) {
						err.statusCode = 400;
						res.send(err);
					} else {
						console.log(result);
						result.statusCode = 202;
						res.send(result);
					}
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
							result.statusCode = 202;
							res.send(result);
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
							result.statusCode = 202;
							res.send(result);
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


/* 진단기록 폴더별 분석*/
router.get('/analysis', (req, res) => {
	try {
		token = req.headers.token;
		check_body(req.query);

		let decoded = jwt.verify(token, config.JWT.accessToken);
		if (decoded) {
			diagnosis.folder_id = req.query.folder_id

			var sql = "SELECT disease_name, diagnosis_date, disease_scale from diagnosis WHERE diagnosis_folder_id = ?;"

			try {
				connection.query(sql, [diagnosis.folder_id], (err, result, fields) => {
					for (const i of result) {
						for (const disease in all_dic) {
							if (i.disease_name == disease) {
								all_dic[i.disease_name]['date'].push(i.diagnosis_date.getFullYear())
								all_dic[i.disease_name]['scale'].push(i.disease_scale)
								nameset.add(i.disease_name)
							}
						}
					}


					//response 
					for (const name of nameset) {
						analysis_result[name] = all_dic[name]
					}

					// find max
					for (const disease in analysis_result) {
						let year = analysis_result[disease]['date'][0]
						let max = analysis_result[disease]['scale'][0]
						let maxyear = [analysis_result[disease]['date'][0]]
						let maxscale = [analysis_result[disease]['scale'][0]]
						index = 0

						for (const date of analysis_result[disease]['date']) {
							let tmp_scale = analysis_result[disease]['scale'][index]
							if (year == date) {
								if (max < tmp_scale) {
									max = tmp_scale
									if (maxyear.includes(date)) { //이미 집어넣은 최댓값이 있을 때
										let max_index = maxyear.indexOf(date)
										maxscale[max_index] = tmp_scale
									} else { // 최댓값 처음 넣을 때
										maxyear.push(date)
										let max_index = maxyear.indexOf(date)
										maxscale[max_index] = tmp_scale
									}
								}
							} else {
								year = date
								max = tmp_scale
								maxyear.push(year)
								maxscale.push(tmp_scale)
							}
							index += 1
							console.log(disease, "max -", max, "maxyear", maxyear, "maxscale", maxscale, "index", index)
						}
						console.log("maxyear", maxyear)
						console.log("maxsclae", maxscale)

						analysis_result[disease]['date'] = maxyear
						analysis_result[disease]['scale'] = maxscale
					}

					res.send(analysis_result);

					console.log("nameset", nameset)
					console.log("all_dic", all_dic)
					console.log("analysis_result", analysis_result)


					// list, dic, set 초기화
					nameset.clear()
					analysis_result = {}
					for (const disease in all_dic) {
						while (all_dic[disease]['date'].length > 0) {
							all_dic[disease]['date'].pop();
							all_dic[disease]['scale'].pop();
						}
					}
					console.log("nameset", nameset)
					console.log("all_dic", all_dic)
					console.log("analysis_result", analysis_result)

				});
			} catch (err) {
				res.send(err);
			}
		} else {
			resSend(res, 400, 'get diagnosis analysis fail');
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
				console.log(result[0]);

				res.send(result[0]);

			});
		} catch (err) {
			delete_list()
			err.statusCode = 400;

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