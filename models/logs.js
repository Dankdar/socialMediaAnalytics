const express = require('express');
const mongoose = require('mongoose');


const logSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    method: String,
    url: String,
    status: Number,
    request: Object,
    response: Object
});

module.exports = mongoose.model("log",logSchema);