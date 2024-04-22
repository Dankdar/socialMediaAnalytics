// const Task = require("../models/tasks");
const Joi = require("joi");
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

exports.validateUser = (req,res,next) => {
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        email: Joi.string().min(3).required(),
        phoneNumber: Joi.string().required(),
        address: Joi.string(),
        username: Joi.string().required(),
        dateOfBirth: Joi.date().required(),
        password: Joi.string().required(),
        avatar: Joi.string(),
        role: Joi.string().required()
    })
    console.log('req.body=> ',req.body);
    const result = schema.validate(req.body);

    const errors = [];
    if(result.error){
        result.error.details.forEach(item => {
            errors.push(item.message);
        })

        res.status(400).send(errors);
    }
    else{
        next();
    }
}

exports.validateLogin = (req,res,next) => {
    const schema = Joi.object({
        email: Joi.string().min(3).required(),
        password: Joi.string().required(),
        role: Joi.string().required(),
    })
    const result = schema.validate(req.body);

    const errors = [];
    if(result.error){
        result.error.details.forEach(item => {
            errors.push(item.message);
        })

        res.status(400).send(errors);
    }
    else{
        next();
    }
}