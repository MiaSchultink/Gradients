
const User = require('../models/user');
const Gradient = require('../models/gradient')

const crypto = require('crypto')
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
const ITEMS_PER_PAGE = 6;

sgMail.setApiKey(process.env.API_KEY)



exports.getLogIn = (req, res, next) => {
    res.render('login', {
        pageTitle: 'Login',
        path: '/login',
        isLoggedIn: false
    });
}

exports.postLogin = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = await User.findOne({ email: email }).exec()

        if (!user) {
            res.redirect('/users/login')
        }
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (passwordMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.isAdmin = (user.role == 'admin');
            await req.session.save()
            res.redirect('/gradient/library')
        }
        else {
            res.redirect('/users/login')
        }

    }
    catch (err) {
        console.log(err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Login Failed'
        })
    }

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
        isLoggedIn: false
    });
};

exports.postSignUp = async (req, res, next) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        console.log('beginning')

        const tempUser = await User.findOne({ email: email }).exec();
        if (tempUser) {
            throw new Error('Sign-up failed')
        }
        const hashedPassword = await bcrypt.hash(password, 12)
        console.log("hello")
        const user = new User({
            name: name,
            email: email,
            password: hashedPassword,
            gradients: []
        });
        console.log('made user')
        await user.save();
        console.log('saved user')

        const message = {
            to: email,
            from: 'contact@miaschultink.com',
            subject: 'Sign-up Suceeded!',
            html: '<h1>You sucessfully signed up!</h1>'
        }
        sgMail.send(message)
        res.redirect('/users/login')
    }

    catch (err) {
        console.log(err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Sign-up failed'
        })
    }

    // User.findOne({ email: email }).then(userDoc => {
    //     if (userDoc) {
    //         return res.redirect('/users/sign-up')
    //     }
    //     return bcrypt.hash(password, 12)
    //         .then(hashedPassword => {
    //             const user = new User({
    //                 name: name,
    //                 email: email,
    //                 password: hashedPassword,
    //                 gradients: []
    //             });
    //             return user.save()
    //         })
    //         .then(result => {
    //             const message = {
    //                 to: email,
    //                 from: 'contact@miaschultink.com',
    //                 subject: 'Sign-up Suceeded!',
    //                 html: '<h1>You sucessfully signed up!</h1>'
    //             }
    //             sgMail.send(message)
    //             res.redirect('/users/login')
    //         });
    // })
    //     .catch(err => {
    //         console.log(err)
    //     })

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
        const page = +req.query || 1;

        const userId = req.params.userId;

        const user = await User.findById(userId)
            .populate('favorites')
            .populate('gradients')
            .exec();


        const posts = await Gradient.find({ userId: req.params.userId }).skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).exec();
        const totalPosts = await Gradient.find({ userId: req.params.userId }).countDocuments().exec();
        const urlBit = '/users/posts/' + user._id;
        const favorites = user.favorites.map(favorite => { return favorite._id })


        res.render('profile', {
            pageTitle: 'Your profile',
            path: '/users/profile',
            userId: userId,
            user: user,
            gradients: posts,
            favorites: favorites,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalPosts,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            prevPage: page - 1,
            lastPage: Math.ceil(totalPosts / ITEMS_PER_PAGE),
            urlBit: urlBit

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

exports.getMyProfile = async (req, res, next) => {
    try {

        const user = await User.findById(req.session.user._id)
            .populate('favorites')
            .populate('gradients')
            .exec();

        if (req.params.userId != user._id) {
            throw new Error('This is not your profile')
        }
        const page = req.query.page || 1;
        const urlBit = '/users/myProfile/' + user._id;
        const posts = await Gradient.find({ userId: req.session.user._id }).skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).exec();
        const totalPosts = await Gradient.find({ userId: req.session.user._id }).countDocuments().exec();

        const favorites = user.favorites.map(favorite => { return favorite._id })


        res.render('myProfile', {
            pageTitle: 'Your profile',
            path: '/users/profile',
            userId: user._id,
            user: user,
            gradients: posts,
            favorites: favorites,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalPosts,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            prevPage: page - 1,
            lastPage: Math.ceil(totalPosts / ITEMS_PER_PAGE),
            urlBit: urlBit
        });
    }
    catch (err) {
        console.log('my profile', err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Cannot reach your profile'
        })

    }
}

exports.getUserEdit = async (req, res, next) => {
    try {
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
    catch (err) {
        console.log('edit user get', err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Cannot edit user'
        })
    }
}

exports.postUserEdit = async (req, res, next) => {
    try {
        const userId = req.body.userId;
        if (!userId == req.session.user._id) {
            throw new Error('Cannot edit this user')
        }

        const user = await User.findById(req.session.user._id).exec()
        if (!user) {
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


exports.getPosts = async (req, res, next) => {
    try {
        const page = +req.query.page || 1;

        const user = await User.findById(req.params.userId)
            .populate('gradients')
            .populate({
                path: 'gradients',
                populate: {
                    path: 'userId',
                    model: 'User'
                }
            })
            .exec()

        const posts = await Gradient.find({ userId: req.params.userId }).skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).exec();
        const totalPosts = await Gradient.find({ userId: req.params.userId }).countDocuments().exec();
        const urlBit = '/users/posts/' + user._id;


        const favorites = user.favorites.map(favorite => { return favorite._id })


        res.render('profile', {
            pageTitle: 'posts',
            path: '/users/profile/posts',
            gradients: posts,
            favorites: favorites,
            userId: user._id,
            user: user,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalPosts,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            prevPage: page - 1,
            lastPage: Math.ceil(totalPosts / ITEMS_PER_PAGE),
            urlBit: urlBit
        })
    }
    catch (err) {
        console.log('get posts', err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Failed to show posts'
        })


    }
}

exports.getUsers = async (req, res, next) => {
    try {
        const page = + req.query.page || 1
        const urlBit = '/users/find'
        const user = await User.findById(req.session.user._id).exec();
        const users = await User.find().exec();
        
        for(let i=0; i<users.length; i++){
            console.log(users[i].name, users[i].gradients.length)
        }
        res.render('users', {
            title: 'Find people',
            path: 'users/find',
            pageTitle: 'find people',
            users: users,
            user: user,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < users,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            prevPage: page - 1,
            lastPage: Math.ceil(users.length / ITEMS_PER_PAGE),
            urlBit: urlBit
        })
    }
    catch (err) {
        console.log('get users', err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Unable to get users'
        })
    }
}

exports.findUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.session.user._id).exec();
        const query = req.body.query;
        const users = await User.find(
            {
                $and: [
                    { $text: { $search: query } }
                ]
            }
        ).exec();

        if (users.length == 0) {
            res.render('no-results-user', {
                pageTitle: 'No results',
                path: '/users/find'
            })
        }
        else {
            res.render('users', {
                title: 'Find people',
                path: '/users/find',
                pageTitle: 'Find people',
                users: users,
                user: user
            })
        }
    }
    catch (err) {
        console.log('user search err', err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Search failed'
        })
    }

}


exports.follow = async (req, res, next) => {
    try {

        const follower = await User.findById(req.session.user._id).exec();
        const followee = await User.findById(req.body.userId).exec();

        follower.following.addToSet(followee._id);
        await follower.save();

        followee.followers.addToSet(follower._id);
        await followee.save();

        res.redirect('/users/find')
    }
    catch (err) {
        console.log('follow err', err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Not followed'
        })
    }

}

exports.unfollow = async (req, res, next) => {
    try {
        const follower = await User.findById(req.session.user._id).exec();
        const followee = await User.findById(req.body.userId).exec();

        console.log(follower.following)

        follower.following.pull(followee._id)
        await follower.save();

        console.log(follower.following)
        followee.followers.pull(follower._id)
        await followee.save();

        res.redirect('/users/find')
    }
    catch (err) {
        console.log('unfollow err', err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Unfollow unsucessful'
        })
    }
}

exports.getFollowers = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('followers')
            .exec();

        res.render('users', {
            title: user.name,
            path: '/users/followers',
            pageTitle: user.name,
            users: user.followers,
            user: user,
            userId: user._id
        })
    }
    catch (err) {
        console.log('cannot find followers', err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Cannot find followers'
        })
    }
}

exports.getFollowing = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('following')
            .exec()


        res.render('users', {
            title: user.name,
            path: '/users/followers',
            pageTitle: user.name,
            users: user.following,
            user: user,
            userId: user._id
        })
    }
    catch (err) {
        console.log('cannot find following', err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Cannot find following'
        })
    }
}



