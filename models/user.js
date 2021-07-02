const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const userSchema = new Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    gradients: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Gradient'
        }
    ]
    
});

module.exports = mongoose.model('User', userSchema);