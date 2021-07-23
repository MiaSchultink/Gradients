

const Gradient = require('../models/gradient.js')
const User = require('../models/user')



exports.getGradientPage = (req, res, next) => {
    res.render('create-form', {
        pageTitle: 'Gradient-creation',
        path: '/gradient/create'
    });
};

exports.postGradientPage = async (req, res, next) => {
    //post gradient creation page

    let title = req.body.title;
    if (title.length === 0) {
        title = "Gradient" 
    }
    const user = await User.findById(req.session.user._id)


    const colors = [req.body.color1, req.body.color2];
    const tagsArray = req.body.tags.split(' ');
    const userId = user._id 
    const type = req.body.type; 


    const gradient = new Gradient({
        title: title, 
        tags: tagsArray, 
        colors: colors,
        userId: userId,
        type: type
    });


    const primaryColors = {
        red: '#f00',
        orange: '#f58c02',
        yellow: '#ff0',
        green: '#00ff37',
        blue: '#00f',
        purple: '#b910e3',
        pink: '#f564df'
    };


    const nearestColor = require('nearest-color').from(primaryColors)
    const color1 = nearestColor(gradient.colors[0])
    const color2 = nearestColor(gradient.colors[1])

    gradient.tags.push(color1.name, color2.name)

    user.gradients.push(gradient)

    console.log('title', gradient.title)
    console.log('tags', gradient.tags)


    await gradient.save(); 
    await user.save();



    res.render('gradient-view', {
        pageTitle: 'Your gradients',
        path: '/gradient/create',
        title: gradient.title,
        color1: req.body.color1,
        color2: req.body.color2,
        tags: gradient.tags, 
        gradientId: gradient._id,
        userId: req.session.user._id, 
        library: gradient.library,
        type: gradient.type

    });
};

exports.postToLibrary = async (req, res, next) => {
    try {
        const gradient = await Gradient.findById(req.body.gradientId).exec()
        gradient.library = true
        await gradient.save()
        res.redirect('/gradient/library');
    }
    catch (err) {
        console.log('add to library  err', err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Could not add to library'
        })
    }
};

exports.getGradientLibrary = async (req, res, next) => {
    const gradients = await Gradient.find({ library: true }).exec();
    //console.log(gradients)
    res.render('library', {
        pageTitle: 'Gradient-library',
        path: '/gradient/library',
        gradients: gradients
    })
};

exports.getGradientView = async (req, res, next) => {
    const gradientId = req.params.gradientId;

    const gradient = await Gradient.findById(gradientId).exec()
    console.log(gradient)
    res.render('gradient-view', {
        pageTitle: gradient.title,
        path: '/gradient-view',
        title: gradient.title,
        color1: gradient.colors[0],
        color2: gradient.colors[1],
        tags: gradient.tags,
        userId: req.session.user._id,
        gradientId: gradient._id,
        library: gradient.library,
        type: gradient.type
    });
};



exports.searchLibrary = async (req, res, next) => {

    try {
        const query = req.body.query
        const gradients = await Gradient.find(
            {
                $and: [
                    { $text: { $search: query } },
                    { library: true }
                ]
            })
            .exec();

        res.render('search', {
            gradients: gradients,
            path: '/gradient/search',
            pageTitle: query,
            count: gradients.length,
            query: query
        });
    }
    catch (err) {
        console.log('library search err', err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Search failed'
        })
    }

}




exports.deleteGradient = async (req, res, next) => {
    try {
        const gradient = await Gradient.findById(req.body.gradientId).exec();
        if (!gradient) { throw new Error('Gradient not found') }
        const user = await User.findById(req.session.user._id).exec()
 

        console.log('_id', req.session.user._id)
        console.log('id', gradient.userId)
        if ((req.session.user._id.toString() === gradient.userId.toString())||(req.session.user.role=='admin')) {
            user.favorites.pull(gradient._id)
            await gradient.remove()
            await user.save()
            res.redirect('/gradient/library')
        }
        else { throw new Error('You cannot delete this gradient') }
    }
    catch (err) {
        console.log('gradient delete error', err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Cannot delete this gradient'
        })
    }
}













