function sendSuccess(res, statusCode = 200, message, data, pagination) {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        pagination,
    })
}

module.exports = { sendSuccess }
