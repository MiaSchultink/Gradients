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
});

module.exports = mongoose.model('Gradient', gradientSchema);