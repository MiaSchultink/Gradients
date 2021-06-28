exports.get404 = (req,res,next) =>{
    console.log('404 error')
    res.status(404).render('404', {
        pageTitle: 'page not found',
        path: ''
    });
}