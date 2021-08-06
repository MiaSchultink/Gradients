const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,

    gradients: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Gradient'
        }
    ],
    favorites: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Gradient'
        }
    ],
    role: {
        type: String,
        required: true,
        default: 'user'
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    following: [
        {
        type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]

});

module.exports = mongoose.model('User', userSchema);