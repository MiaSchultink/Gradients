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
    type:{
      type: String,
      default: 'horizontal'
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    library: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Gradient', gradientSchema);