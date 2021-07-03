
const User = require('../models/user');

exports.getLogIn = (req, res, next) => {
    res.render('login', {
        pageTitle: 'Login',
        path: '/login'
    });
}

exports.postLogin = (req, res, next) => {
    res.redirect('/');
}

exports.getSignUp = (req, res, next) => {
    res.render('sign-up', {
        pageTitle: 'Sign-up',
        path: '/sign-up'
    });
};

exports.postSignUp = async(req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const user = new User({
        name: name,
        email: email,
        password: password
    });
    console.log(req.body)
    await user.save()
    res.redirect('/gradient/create');
};

exports.getProfile = (req, res, next) =>{
res.render('profile', {
 pageTitle: 'Your profile',
 path: '/profile'
});
}; 