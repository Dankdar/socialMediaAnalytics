const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    role: {
        type: String,
        enum: {
            values: ['User', 'Admin'],
            message: '{VALUE} is not supported'
        },
        required: [true, 'role is Required']
    },
    email: {
        type: String,
        validate: {
            validator: function(v) {
                return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        },
        required: [true, 'Email is Required'],
        unique: true
    },
    username: {
        type: String,
        required: [true, 'username is Required'],
        unique: true
    },
    password: {
        type: String,
        validate: {
            validator: function(v) {
                return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(v);
            },
            message: props => `${props.value} is not a valid password!`
        },
        required: [true, 'Password is required']
    },
    dateOfBirth: {
        type: Date,
        validate: {
            validator: function(date) {
                console.log(date)
                const age = Math.floor((Date.now() - date) / (1000 * 60 * 60 * 24 * 365));
                return age >= 18;
            },
            message: props => `${props.value} is not a valid Date Of Birth!`
        },
        required: [true, 'Date Of Birth is required']
    },
    name: {
        type: String,
        required: [true, 'name is Required']},
    phoneNumber: {
        type: String,
        validate: {
            validator: function(v) {
                return /\d{3}-\d{3}-\d{4}/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    avatar: {
        type: String,
    },
    address: {
        type: String,
    },
    isActive: Boolean,
    verifiedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now() },
    deletedAt: { type: Date, default: null },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
})

module.exports = mongoose.model("User",userSchema);