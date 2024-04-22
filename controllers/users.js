const User = require("../models/users");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const response = require("../helpers/responseApi");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const usersMiddleware = require('../middleware/users');
const {validate_user} = require("../middleware/users");
const xlsx = require('xlsx');


exports.index = async (req, res, next) => {
    try {
        const users = await User.find().select("name email role phoneNumber address avatar isActive _id createdAt deletedAt");
        const data = {
            'total users' : users.length,
            'data' : users
        }
        if(users.length){
            res.status(200).json({
                data: response.success('Success',data,200)
            });
        }
        else{
            res.status(200).json({
                data: response.error('No Users Exists!',200)
            })
        }

    }
    catch (error) {
            res.status(500).json({
                error: response.error(error,500)
            })
        }
}

exports.user = async (req, res, next) => {
    try {
        const user = await User.findOne({username: req.params.username}).select("name username email role avatar isActive _id createdAt deletedAt");
        const data = {
            'data' : user
        }
        if(user){
            res.status(200).json({
                data: response.success('Success',data,200)
            });
        }
        else{
            res.status(200).json({
                data: response.error('No User Exists!',200)
            })
        }
    }
    catch (error) {
            res.status(500).json({
                error: response.error(error,500)
            })
        }
}

exports.create = async (req,res,next) => {
    try{
        const user = await User.findOne({$or: [{email: req.body.email},{username: req.body.username}]});
        if(user){
            res.status(409).json({
                data: response.error('E-Mail 0r Username Already Taken!',409)
            })
        }
        else{
            bcrypt.hash(req.body.password,10,async (err, hash) => {
                if (err) {
                    res.status(400).json({
                        data: response.error(err, 400)
                    })
                } else {
                    const usersObject = {
                        name: req.body.name,
                        username: req.body.username,
                        email: req.body.email,
                        phoneNumber: req.body.phoneNumber,
                        password: hash,
                        role: req.body.role,
                        avatar: req.file.path,
                        address: req.body.address,
                        dateOfBirth: req.body.dateOfBirth
                    }
                    const user = new User(usersObject)
                    const result = await user.save()
                    if (result._id) {
                        res.status(201).json({
                            data: response.success('User Created Successfully!', user, 201)
                        })
                    } else {
                        res.status(409).json({
                            data: response.error(err, 409)
                        })
                    }
                }
            })
        }
    }
    catch(error){
        res.status(400).json({
            data: response.error(error,400)
        })
    }
}

exports.login = async (req, res, next) => {
    try{
        const user = await User.findOne({ role: req.body.role , email: req.body.email });
        if(!user) {
            res.status(404).json({
                data: response.error("Email or Password is Incorrect and or Does Not Exist",404)
            })
        }
        else{
            bcrypt.compare(req.body.password,user.password,(err,resp)=>{
                if(err){
                    res.status(401).json({
                        data: response.error("Incorrect Password or E-Mail.",401)
                    })
                }
                if(resp){
                    const token = jwt.sign({
                            email: user.email,
                            userId: user._id
                        },
                        process.env.JWT_KEY,
                        {expiresIn: "12h"})

                    const data =  {
                        "user": user,
                        "token": token,
                        "expiresIn": "12hrs"
                    }


                    res.status(200).json({
                        data: response.success("Logged in Successfully!",data,200)
                    })
                    return
                }
                res.status(401).json({
                    data: response.error("Incorrect Password or E-Mail.",401)
                })
            })
        }
    }
    catch(error){
        res.status(500).json({
            data: response.error(error,500)
        })
    }
}

exports.update = async (req, res, next) => {
    try{
        bcrypt.hash(req.body.password,10,async (err, hash) => {
            if (err) {
                res.status(400).json(response.error(err, 400));
            } else {
                const user = await User.updateOne({_id: req.body.userId}, {
                    $set: {
                        name: req.body.name,
                        email: req.body.email,
                        phoneNumber: req.body.phoneNumber,
                        password: hash,
                        role: req.body.role,
                        avatar: req.file.path,
                        address: req.body.address,
                    }
                })
                if (user.matchedCount > 0 && user.modifiedCount > 0) {
                    res.status(200).json(
                        response.success("successfully updated! ", user, 200)
                    );
                } else if (user.matchedCount > 0) {
                    res.status(404).json(
                        response.error(`No entry Exists with ID: ${req.params.id}`, 404)
                    );
                } else {
                    res.status(404).json(
                        response.error(`Invalid Request on ID: ${req.params.id}`, 404)
                    );
                }
            }
        })
    }
    catch(error){
        res.json(response.error(error,400))
    }

}

exports.remove = async (req,res) => {
    try{
        const result = await User.updateOne({_id: req.body.userId},{ $set: {
                deletedAt: Date.now(),
            }})
        if (result.matchedCount > 0 && result.modifiedCount > 0) {
            res.status(200).json(
                response.success("successfully soft deleted! ", result, 200)
            );
        } else if (result.matchedCount > 0) {
            res.status(404).json(
                response.error(`No entry Exists with ID: ${req.params.id}`, 404)
            );
        } else {
            res.status(404).json(
                response.error(`Invalid Request on ID: ${req.params.id}`, 404)
            );
        }
    }
    catch(error){
        res.status(500).json({
            error: response.error(error,500)
        })
    }
}

exports.delete = async (req,res) => {
    try{
        const user = await User.deleteOne({_id:req.body.userId})
        if(user.deletedCount>0){
            res.status(200).json(
                response.success("User Deleted Successfully!",user,200));
        }
        else{
            res.status(404).json(response.error(`No entry Exists with ID: ${req.params.id}`,404))
        }
    }
    catch(error){
        res.status(500).json(
            response.error(error,500)
        );
    }
}

exports.addBulkUser = async (req, res, next) => {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = xlsx.utils.sheet_to_json(worksheet);

    try {
        for (const row of excelData) {
            const existingUser = await User.findOne({ email: row.email });
            if (!existingUser) {
                row.password = "$2b$10$g57HLx0B3VqIpxVT6uXYd.4/1PfMC2osy8PmGD5X1PPvMxRxLKb9C";
                await User.create(row);
                // throw new Error("Custom Message !")
            }
        }
        res.status(200).json({
            message: `${excelData.length} user(s) added successfully.`
        });
    }
    catch (error) {
        // console.error('Error adding bulk users:', error);
        res.status(400).json({
            error: 'Failed to add bulk users.'
        });
    }
};


