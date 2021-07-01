exports.getLogIn = (req, res, next) => {
    res.render('login', {
        pageTitle: 'Login',
        path: '/login'
    });
}

exports.postLogin = (req, res, next) =>{
    console.log(req.body)
    res.redirect('/');
}