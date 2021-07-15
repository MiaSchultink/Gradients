module.exports = (req, res, next)=>{
    if(!req.session.isAdmin){
        console.log('is admin' ,req.session.isAdmin)
        return res.redirect('/')
    }
    next();
   }
   