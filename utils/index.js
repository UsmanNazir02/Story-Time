
exports.generateResponse = (data, message, res, code = 200) => {
    return res.status(code).json({
        message,
        data,
    });
}

exports.parseBody = (body) => {
    let obj;
    if (typeof body === "object") obj = body;
    else obj = JSON.parse(body);
    return obj;
}

exports.generateRandomOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
}