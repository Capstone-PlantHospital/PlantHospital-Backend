var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const config = require('../config.json');

var connection = require("../db");

const app = express();

var multer = require('multer');
var path = require("path");
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "../uploads/");
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname);
		cb(null, path.basename(file.originalname, ext) + "-" + Date.now() + ext);
	},
});

var upload = multer({
	storage: storage
});
// var upload = multer({
// 	dest: '../uploads/',
// });

const {
	check_body
} = require("../utils/checkBody");
const {
	resSend
} = require('../utils/resSend');



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
		check_body(req.body);

		let decoded = jwt.verify(token, config.JWT.accessToken);
		if (decoded) {
			diagnosis.folder_id = req.body.folder_id
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
					resSend(res, 200, 'diagnosis create sucessfully');
				});
		} else {
			resSend(res, 400, 'diagnosis create fail');
		}
	} catch (err) {
		err.statusCode = 400;
		res.send(err);
	}
});



/* 같은 작물 종류의 폴더 리스트 가져오기 */



/* 진단기록 수정 */
/* 수정정보 입력(수량, 폴더 변경) > 진단기록 id 조회 > 수정 */
router.post('/update', (req, res) => {
	try {
		token = req.headers.token;

		let decoded = jwt.verify(token, config.JWT.accessToken);

		if (decoded) {
			//폴더 아이디 확인
			diagnosis.folder_id = req.body.folder_id
			diagnosis.diagnosis_id = req.body.diagnosis_id
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
						res.send(result);
					}
				});
		} else {
			res.send({
				statusCode: 400,
				message: 'diagnosis update fail'
			});
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

		let decoded = jwt.verify(token, config.JWT.accessToken);

		if (decoded) {
			//폴더 아이디 확인
			diagnosis.diagnosis_id = req.query.id

			var sql = "DELETE FROM diagnosis WHERE diagnosis_id =?;"
			connection.query(sql,
				[diagnosis.diagnosis_id],
				(err, result, fields) => {
					if (err) {
						err.statusCode = 400;
						res.send(err);
					} else {
						console.log(result);
						res.send(result);
					}
				});
		} else {
			res.send({
				statusCode: 400,
				message: 'diagnosis delete fail'
			});
		}
	} catch (err) {
		err.statusCode = 400;
		res.send(err);
	}
});
















var _storage = multer.diskStorage({
	destination: 'uploads/',
	filename: function (req, file, cb) {
		return crypto.pseudoRandomBytes(16, function (err, raw) {
			if (err) {
				return cb(err);
			}
			return cb(null, file.originalname);
		});
	}
});


function readImageFile(file) {
	console.log(3);

	const bitmap = fs.readFileSync(file);
	const buf = new Buffer.from(bitmap)
	console.log("buf", buf);
	return buf
}

/* 진단기록 생성 */
router.post('/test', upload.single('img'), (req, res) => {
	try {
		console.log("img");
		let file = req.file;
		console.log("img", file);


		let originalName = '';
		let fileName = '';
		let mimeType = '';
		let size = 0;

		if (file) {
			originalName = file.originalname;
			filename = file.fileName
			mimeType = file.mimetype;
			size = file.size;
		} else {

		}
		console.log(1);
		console.log("img", originalName);

		console.log(2);



		// var sql = "INSERT INTO test(id, image) values(?,?);";

		// connection.query(sql,
		// 	[id, diagnosis.image],
		// 	(err, result, fields) => {
		// 		console.log(result);
		// 		res.send({
		// 			statusCode: 200,
		// 			message: 'diagnosis create sucessfully'
		// 		});
		// 	});

	} catch (err) {
		err.statusCode = 400;
		res.send(err);
	}
});













module.exports = router;




/*
이미지 서버 업로드 동시 서버에서 학습모델 결과예측 후 서버저장 사용자에게 보냄
겟 사용. 매개변수 파일이름. 클라이언트에서 보내줌(유니크키) 
api 서버 보안 문제 : api key  설정하여 보안성 높임

디비 아마존 rds 사용

갤러리에서 직접 경로로 사진접근 불가능 서버랑 바로 통신..? 무슨말인지 모르겠음

*/