function check_body(body) {
	console.log("check body")

	// 입력이 아예 없는 경우
	if (Object.keys(body).length == 0) {
		var error = new Error();
		error.message = 'All value is empty';
		throw error;
	}

	// 입력이 없는 위치 찾기
	for (const key in body) {
		if (body[key] == '' || body[key] == ' ') {
			var error = new Error();
			error.message = key + ' is empty';
			throw error;
		}
	}
}

module.exports = {
	check_body
};