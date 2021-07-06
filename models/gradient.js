const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const gradientSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    colors: {
        type: [String],
        required: true
    },
    tags: {
        type: [String],
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Gradient', gradientSchema);