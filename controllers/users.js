const User = require("../models/users");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const response = require("../helpers/responseApi");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const usersMiddleware = require('../middleware/users');
const {validate_user} = require("../middleware/users");
const xlsx = require('xlsx');


exports.index = async (req, res) => {
    try {
        const users = await User.find().select("name email role phoneNumber address avatar isActive _id createdAt");
        res.status(200).json({
            data: response.success('Success', {
                totalUsers: users.length,
                users
            }, 200)
        });
    } catch (error) {
        res.status(500).json({
            error: response.error('Server error', 500)
        });
    }
};

exports.user = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("name username email role avatar isActive _id createdAt");
        if (!user) {
            return res.status(404).json({
                error: response.error('No user exists with the given ID', 404)
            });
        }
        res.status(200).json({
            data: response.success('Success', user, 200)
        });
    } catch (error) {
        res.status(500).json({
            error: response.error('Server error', 500)
        });
    }
};

exports.create = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        if (!email || !username || !password) {
            return res.status(400).json({
                error: response.error('All fields must be filled', 400)
            });
        }
        const userExists = await User.findOne({$or: [{email}, {username}]});
        if (userExists) {
            return res.status(409).json({
                error: response.error('Email or Username already taken', 409)
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ ...req.body, password: hashedPassword });
        await user.save();
        res.status(201).json({
            data: response.success('User created successfully', user, 201)
        });
    } catch (error) {
        res.status(500).json({
            error: response.error('Server error', 500)
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                error: response.error("Email does not exist", 404)
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                error: response.error("Incorrect password", 401)
            });
        }
        const token = jwt.sign({
            email: user.email,
            userId: user._id
        }, process.env.JWT_KEY, { expiresIn: "12h" });

        res.status(200).json({
            data: response.success("Logged in successfully", {
                user,
                token,
                expiresIn: "12hrs"
            }, 200)
        });
    } catch (error) {
        res.status(500).json({
            error: response.error('Server error', 500)
        });
    }
};

exports.update = async (req, res) => {
    try {
        const { userId, name, email, phoneNumber, password, role, address } = req.body;
        const avatar = req.file?.path;

        const hash = await bcrypt.hash(password, 10);

        const user = await User.findOneAndUpdate(
            { _id: userId },
            { $set: { name, email, phoneNumber, password: hash, role, avatar, address } },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json(response.error(`No user exists with ID: ${userId}`, 404));
        }

        res.status(200).json(response.success("Successfully updated!", user, 200));
    } catch (error) {
        res.status(500).json(response.error(error.message, 500));
    }
};

exports.remove = async (req, res) => {
    try {
        const { userId } = req.body;
        const result = await User.updateOne({_id: userId}, { $set: { deletedAt: new Date() }});

        if (result.modifiedCount === 0) {
            return res.status(404).json(response.error(`No entry exists with ID: ${userId}`, 404));
        }

        res.status(200).json(response.success("Successfully soft deleted!", { userId }, 200));
    } catch (error) {
        res.status(500).json(response.error(error.message, 500));
    }
};

exports.delete = async (req, res) => {
    try {
        const { userId } = req.body;
        const result = await User.deleteOne({_id: userId});

        if (result.deletedCount === 0) {
            return res.status(404).json(response.error(`No entry exists with ID: ${userId}`, 404));
        }

        res.status(200).json(response.success("User deleted successfully!", { userId }, 200));
    } catch (error) {
        res.status(500).json(response.error(error.message, 500));
    }
};

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


