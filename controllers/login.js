exports.getLogIn = (req, res, next) => {
    console.log('In the login route')
    res.render('login', {
        pageTitle: 'Login',
        path: '/login'
    });
}