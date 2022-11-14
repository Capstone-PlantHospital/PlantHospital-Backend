function resSend(res, code, message) {
	console.log("send ")
	res.send({
		statusCode: code,
		message: message
	});

}

module.exports = {
	resSend
};

//             resSend(res, 400, 'Number is duplicated');