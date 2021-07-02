
const Gradient = require('../models/gradient.js')

exports.getGradientPage = (req, res, next) => {
    res.render('create-form', {
        pageTitle: 'Gradient-creation',
        path: '/gradient/create'
    });
};

exports.postGradientPage = async (req, res, next) => {
    const title = req.body.title;
    const colors = [req.body.color1, req.body.color2];
    const tagsArray = req.body.tags.split(',');
    console.log(tagsArray); 

    
    const gradient = new Gradient({
        title: title,
        colors: colors,
        tags: tagsArray
    })
    console.log(req.body);
    await gradient.save();
    res.render('create-result', {
        pageTitle: 'Your gradients',
        path: '/gradient/create',
        color1: req.body.color1,
        color2: req.body.color2
    });
};

exports.getGradientLibrary = (req, res, next) => {
    res.render('library', {
        pageTitle: 'Gradient-library',
        path: '/gradient/library'
    })
};



