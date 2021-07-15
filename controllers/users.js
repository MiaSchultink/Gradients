
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
                        req.session.isAddmin = (user.role=='admin');
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
    try {
        res.render('reset', {
            pageTitle: 'Reset Password',
            path: '/users/reset'
        })
    }
    catch (err) {
        console.log(err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Could not reach reset page'
        })
    }
};

exports.postReset = async (req, res, next) => {
    try {
        const token = crypto.randomBytes(32).toString('hex');
        const user = await User.findOne({ email: req.body.email }).exec()
        if (!user) { throw new Error('No accounts with this email') }
        else {
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000
            await user.save()
            const host = (process.env.NODE_ENV == 'development') ?
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
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Reset password email failed'
        })
    }
}

exports.getNewPassword = async (req, res, next) => {
    try {
        const token = req.params.token;
        const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }).exec()
        if (user) {
            res.render('new-password', {
                pageTitle: 'New-Password',
                path: 'users/new-password',
                userId: user._id.toString(),
                passwordToken: token
            });
        }
        else {
            res.redirect('/users/reset')
        }
    }
    catch (err) {
        console.log('get reset pssword err', err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Failed to reach new password page'
        })
    }
}

exports.postNewPassword = async (req, res, next) => {
    try {
        const newPassword = req.body.password;
        const userId = req.body.userId;
        const passwordToken = req.body.passwordToken;


        const user = await User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId }).exec()
        const hashedPassword = await bcrypt.hash(newPassword, 12)

        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiration = undefined;

        await user.save();
        res.redirect('/users/login')
    }
    catch (err) {
        console.log('post reset password err', err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Password reset failed'
        })
    }
};


exports.getProfile = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        if (userId != req.session.user._id) {
            throw new Error('Wrong profile')
        }
        const user = await User.findById(userId);
        res.render('profile', {
            pageTitle: 'Your profile',
            path: '/users/profile',
            userId: userId,
            user: user
        });
    }
    catch (err) {
        console.log('profile get err', err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Wrong profile'
        })
    }
};

exports.getUserEdit = async (req, res, next) => {
    const user = await User.findById(req.session.user._id).exec()
    const userId = req.params.userId;
    if (userId != req.session.user._id) {
        throw new Error('Wrong profile')
    }
    res.render('edit-user', {
        pageTitle: 'Edit User',
        path: 'users/profile/edit',
        userId: userId,
        user: user
    });
}

exports.postUserEdit = async (req, res, next) => {
    try {
        const userId = req.body.userId;
        if (!userId == req.session.user._id) {
            throw new Error('Cannot edit this user')
        }

        const user = await User.findById(req.session.user._id).exec()
        if(!user){
            throw new Error('User not found')
        }

        const updatedName = req.body.name;
        const updatedEamil = req.body.email;

        user.name = updatedName
        user.email = updatedEamil

        await user.save()
        res.redirect('/users/profile/' + userId)
    }
    catch (err) {
        console.log('edit user form error', err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Could not edit profile'
        })
    }
}