const User = require('../models/user');
const Gradient = require('../models/gradient');

exports.getImageEditing = (req, res, next) => {
try{
rs.render('imageLoading');
}
catch (err) {
    console.log('display image', err)
    res.render('error', {
        pageTitle: 'Error',
        path: '/error',
        message: 'Failed to display image'
    })


}
}
exports.editImageColor = (req, res, next) => {

    const img = document.getElementById('my-image');
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
}