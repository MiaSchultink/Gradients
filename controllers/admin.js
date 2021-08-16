const User = require('../models/user')
const Gradient = require('../models/gradient')
const user = require('../models/user')

const mongoose = require('mongoose');
const { compare } = require('bcryptjs');
const gradient = require('../models/gradient');

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
    // console.log(req.params)
    const user = await User.findById(req.params.userId).exec()
    res.render('admin-user-view', {
        pageTitle: 'Admin User View',
        path: 'admin/users',
        user: user,
        userId: user._id
    })
}


exports.deleteDuplicates = async (req, res, next)=>{

    const gradients  = await Gradient.find().exec()

    for(let i=0; i< gradients.length; i++){
        const comparing = gradients[i]
        for(let y=0; y< gradients.length; y++){
        const comparedTo = gradients[y]

       if(comparing.colors[0]==comparedTo.colors[0]&&comparing.colors[1]==comparedTo.colors[1]){
        await comparedTo.remove()
        const index = gradients.indexOf(comparing)
        gradients.splice(index, comparing)

       }
        }
    }
    const after = await Gradient.find().exec()
 res.render('duplicates', {
     path:'/admin/duplicates',
     before: gradients, 
      after: after
    
 })
     
}


exports.DELETEALL= async (req, res, next) =>{
    const gradients = await Gradient.find().exec();
    for(let i=0 ;i< gradients.length; i++){
        await gradients[i].remove()
        
    }
    const after = await Gradient.find().exec()
    res.render('duplicates', {
        path:'/admin/duplicates',
        before: gradients, 
         after: after
       
    })
}
