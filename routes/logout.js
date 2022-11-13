var express = require("express");
var router = express.Router();
const config = require('../config.json');
const cryptojs = require('crypto-js');
const axios = require("axios");

const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

var connection = require("../db");
dotenv.config();

let verificationCode = 0; // 인증 코드 (6자리 숫자)

var res_message = {}

var user = {
	first_name: '',
	number: '',
	id: ''
};


/*
로그인에서 refresh토큰 생성.
refresh, access 토큰 디비에 저장, 둘다 프론트로 넘기기


*/

module.exports = router;