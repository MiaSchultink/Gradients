
const User = require('../models/user');

const crypto = require('crypto')
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.API_KEY)

exports.getLogIn = (req, res, next) => {
    res.render('login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: false
    });
}


exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.redirect('/users/login');
            }
            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    res.redirect('/users/login');
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/users/login');
                });
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log("logout error", err);
        res.redirect('/');
    });
};

exports.getSignUp = (req, res, next) => {
    res.render('sign-up', {
        pageTitle: 'Sign-up',
        path: '/sign-up',
        isAuthenticated: false
    });
};

exports.postSignUp = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    User.findOne({ email: email }).then(userDoc => {
        if (userDoc) {
            return res.redirect('/users/sign-up')
        }
        return bcrypt.hash(password, 12)
            .then(hashedPassword => {
                const user = new User({
                    name: name,
                    email: email,
                    password: hashedPassword,
                    gradients: []
                });
                return user.save()
            })
            .then(result => {
                const message = {
                    to: email,
                    from: 'contact@miaschultink.com',
                    subject: 'Sign-up Suceeded!',
                    html: '<h1>You sucessfully signed up!</h1>'
                }
                sgMail.send(message)
                res.redirect('/users/login')
            });
    })
        .catch(err => {
            console.log(err)
        })

};

exports.getReset = (req, res, next) => {
    res.render('reset', {
        pageTitle: 'Reset Password',
        path: '/users/reset'
    })
};

exports.postReset = async (req, res, next) => {
    try {
        const token = crypto.randomBytes(32).toString('hex');
        const user = await User.findOne({ email: req.body.email }).exec()
        if (!user) { throw new Error('No accounts with this email') }
        else {
            user.resetToken = token;
            user.setTokenExpiration = Date.now() + 3600000
            await user.save()
            console.log(user)
            console.log(req.body);
            const host = (proces.env.NODE_ENV == 'development') ?
                'http://localhost:3000' :
                'http://www.miaschultink.com'
            const message = {
                to: req.body.email,
                from: 'contact@miaschultink.com',
                subject: 'Password Reset',
                html: `
        <p>You requested a password reset.</p>
        <p>Click this <a href ="${host}/users/reset/${token}">link</a></p>`
            }
            await sgMail.send(message)
            res.redirect('/');
        }
    }
    catch (err) {
        console.log('Error in postReset', err)
        res.redirect('/users/reset')
    }
}


exports.getProfile = (req, res, next) => {
    res.render('profile', {
        pageTitle: 'Your profile',
        path: '/profile'
    });
};