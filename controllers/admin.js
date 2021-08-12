const User = require('../models/user')
const Gradient = require('../models/gradient')
const user = require('../models/user')

const mongoose = require('mongoose');

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
    const user = await User.findById('60f147e8302a5323fc741c2c').populate('gradients').exec()
    const posts = user.gradients;

    const duplicates = [];
db.collectionName.aggregate([
  { $match: { 
    name: { "$ne": '' }  // discard selection criteria
  }},
  { $group: { 
    _id: { name: "$name"}, // can be grouped on multiple properties 
    dups: { "$addToSet": "$_id" }, 
    count: { "$sum": 1 } 
  }}, 
  { $match: { 
    count: { "$gt": 1 }    // Duplicates considered as count greater than one
  }}
],
{allowDiskUse: true}       // For faster processing if set is larger
)               // You can display result until this and check duplicates 
.forEach(function(doc) {
    doc.dups.shift();      // First element skipped for deleting
    doc.dups.forEach( function(dupId){ 
        duplicates.push(dupId);   // Getting all duplicate ids
        }
    )    
})
// If you want to Check all "_id" which you are deleting else print statement not needed
printjson(duplicates);     
// Remove all duplicates in one go    
db.collectionName.remove({_id:{$in:duplicates}})  
     
}