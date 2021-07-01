exports.getGradientPage =(req, res, next) =>{
 res.render('gradient', {
     pageTitle: 'Gradient-creation',
     path: '/gradients'
 })
};

exports.postGradientPage = (req, res, next) =>{
    console.log(req.body);
    res.render('gradient-result', {
        pageTitle: 'Your gradients',
        path: '/gradients',
        color1: req.body.color1,
        color2: req.body.color2
    })
}

