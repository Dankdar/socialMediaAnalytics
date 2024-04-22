// Middleware to log requests and responses
const LogModel = require("../models/logs");

exports.logger =  async (req, res, next) => {
    const requestData = {
        method: req.method,
        url: req.url,
        body: req.body,
        query: req.query,
        params: req.params
    }; // Capture request data

    const oldSend = res.send; // Capture response data
    res.send = async function (data) {
        console.log('Response:', data);

        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            request: requestData,
            response: data
        };
        await LogModel.create(logData);

        await oldSend.apply(res, arguments); // Call original send function
    };

    next();
}