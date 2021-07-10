
const Gradient = require('../models/gradient.js')
const Picker = require('../models/color-picker.js');


exports.getGradientPage = (req, res, next) => {


    // let picker = new Picker(document.getElementById('color-picker'), 240, 220);
    // setInterval(() => picker.draw(), 1);


    // picker.onChange((color) => {
    //     //Get the preview DOM element
    //     let selected = document.getElementsByClassName("selected")[0];
    //     //Change it's backagroundColor to the current color (rgb CSS function)
    //     const convertedRgb = picker.convertToHex();
    //     console.log("converted hex", convertedRgb);
    //     selected.style.backgroundColor = convertedRgb.toString();
    // });


    res.render('create-form', {
        pageTitle: 'Gradient-creation',
        path: '/gradient/create'
    });
};

exports.postGradientPage = async (req, res, next) => {
    //post gradient creatio
    res.render('create-result', {
        pageTitle: 'Your gradients',
        path: '/gradient/create',
        title: req.body.title,
        color1: req.body.color1,
        color2: req.body.color2,
        tags: req.body.tags
    });
};

exports.postToLibrary = async (req, res, next) => {
    const title = req.body.title;
    const colors = [req.body.color1, req.body.color2];
    const tagsArray = req.body.tags.split(',');
    console.log(tagsArray);


    const gradient = new Gradient({
        title: title,
        colors: colors,
        tags: tagsArray
    });
    await gradient.save();
    res.redirect('/gradient/library');
};

// exports.saveToFavorites = async(req, res, next) =>{
//     const title = req.body.title;
//     const colors = [req.body.color1, req.body.color2];
//     const tagsArray = req.body.tags.split(',');
//     console.log(tagsArray);


//     const gradient = new Gradient({
//         title: title,
//         colors: colors,
//         tags: tagsArray
//     });
//     console.log(req.body);
//     await gradient.save();
// };

exports.getGradientLibrary = async (req, res, next) => {
    const gradients = await Gradient.find().exec();
    console.log(gradients)
    res.render('library', {
        pageTitle: 'Gradient-library',
        path: '/gradient/library',
        gradients: gradients
    })
};

exports.getGradientView = async (req, res, next) => {
    const gradientId = req.params.gradientId;
    console.log(req.params.gradientId)
    const gradient = await Gradient.findById(gradientId)
    console.log(gradient)
    res.render('gradient-view', {
        pageTitle: gradient.title,
        path: '/gradient-view',
        title: gradient.title,
        color1: gradient.colors[0],
        color2: gradient.colors[1]
    });
};

exports.getColorPicker = (req, res, next) => {
    res.render('color-picker', {
        pageTitle: 'Color-Picker',
        path: '/color-picker'
    });
};


