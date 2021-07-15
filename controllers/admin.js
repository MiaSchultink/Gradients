const User = require('../models/user')

exports.getAllUsers =async (req, res, next) =>{
    const users = await User.find().exec()
    res.redner('get-all-users', {
        pageTitle: 'user-library',
        path: '/admin/users',
        users: users
    })
}