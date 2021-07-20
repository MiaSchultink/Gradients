const User = require('../models/user')
const Gradient = require('../models/gradient')

exports.getAllUsers = async (req, res, next) =>{
    const users = await User.find().exec()
    console.log('locals.isLoggedin', res.locals.isLoggedIn)
    res.render('get-all-users', {
        pageTitle: 'user-library',
        path: '/admin/users',
        users: users
    })
}

exports.getUser = async(req, res, next)=>{
    console.log(req.params)
    const user = await User.findById(req.params.userId).exec()
    res.render('admin-user-view', {
        pageTitle: 'Admin User View',
        path: 'admin/users',
        user: user,
        userId: user._id
    })
}

// exports.deleteGradient = async (req, res, next) =>{
//     const gradient = await Gradient.findById(req.params.gradientId).exec()
//     await gradient.remove()
// }