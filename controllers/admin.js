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

    const duplicates = []
    const useless = []
    const staying = []

    const gradients  = await Gradient.find().exec()

    for(let i=0; i< gradients.length; i++){
        const comparing = gradients[i]
        for(let y=0; y< gradients.length; y++){
        const comparedTo = gradients[y]
       if(comparing.colors[0]==comparedTo.colors[0]&&comparing.colors[1]==comparedTo.colors[1]){
         const duplicateSet  = [comparing, comparedTo]
         duplicates.push(duplicateSet)
         console.log(duplicates)


        //  duplicates.pop(duplicateSet)
        //  staying.push(duplicateSet[0])
        //  console.log(duplicates, 'duplicates')
        //  console.log('staying', staying)

       }
        }
    }
    // for(let t=0; t< duplicates.length; t++){
    //     console.log(duplicates[t])
    //     const Compare = duplicates[t]
    //     for(let g=0; g<duplicates.length; g++){
    //         const ComparedTo = duplicates[g]
    //         if(Compare._id==ComparedTo._id){
    //             duplicates.indexOf(comparedTo)
    //          useless.push(comparedTo)
    //         }
    //     }
    // }
 res.render('duplicates', {
     path:'/admin/duplicates',
     duplicates: duplicates,
      staying: staying 
    
 })
     
}