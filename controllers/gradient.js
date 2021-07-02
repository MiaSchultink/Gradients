exports.getGradientPage =(req, res, next) =>{
 res.render('create-form', {
     pageTitle: 'Gradient-creation',
     path: '/gradient/create'
 });
};

exports.postGradientPage = (req, res, next) =>{
    console.log(req.body);
    res.render('create-result', {
        pageTitle: 'Your gradients',
        path: '/gradient/create',
        color1: req.body.color1,
        color2: req.body.color2
    });
};

exports.getGradientLibrary = (req, res, next) =>{
res.render('library',{
    pageTitle: 'Gradient-library',
    path: '/gradient/library'
})
};



