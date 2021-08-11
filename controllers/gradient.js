

const Gradient = require('../models/gradient.js')
const User = require('../models/user')
const puppeteer = require('puppeteer');
const nearestColor = require('nearest-color');



exports.getGradientPage = (req, res, next) => {
    try{
    res.render('create-form', {
        pageTitle: 'Gradient-creation',
        path: '/gradient/create'
    });
}
catch (err) {
    console.log('create form', err)
    res.render('error', {
        pageTitle: 'Error',
        path: '/error',
        message: 'Could not get create page'
    })
}
};

exports.postGradientPage = async (req, res, next) => {
   
try{
    let title = req.body.title;
    if (title.length === 0) {
        title = "Gradient"
    }
    const user = await User.findById(req.session.user._id).exec()

    const colors = [req.body.color1, req.body.color2, req.body.color3,req.body.color4, req.body.color5, req.body.color6];

    for(let i=0; i< colors.length; i++){
        if(colors[i]=="#fcfcfc"){
            const index = colors.indexOf(colors[i])
            colors.splice(index)
        }
    }
    const tagsArray = req.body.tags.split(' ');
    const userId = user._id
    const type = req.body.type;
    const width = req.body.width;
    const aspectRatio = req.body.aspectRatio;
    const height = width * aspectRatio;




    const gradient = new Gradient({
        title: title,
        tags: tagsArray,
        colors: colors,
        userId: userId,
        type: type,
    });


    const primaryColors = {
        red: '#f00',
        orange: '#f58c02',
        yellow: '#ff0',
        green: '#00ff37',
        blue: '#00f',
        purple: '#b910e3',
        pink: '#f564df',
        black: '#000000',
        white: '#ffffff'
    };


    for(let i=0; i<gradient.colors.length; i++){
        const nearestColor = require('nearest-color').from(primaryColors)
        const color = nearestColor(gradient.colors[i])
        gradient.tags.push(color.name)
    }

    user.gradients.push(gradient)

    const favorites = user.favorites.map(favorite => { return favorite._id })


    await gradient.save();
    await user.save();


    res.render('gradient-view', {
        pageTitle: 'Your gradients',
        path: '/gradient/create',
        gradient: gradient,
        title: gradient.title,
        color1: req.body.color1,
        color2: req.body.color2,
        tags: gradient.tags,
        gradientId: gradient._id,
        userId: req.session.user._id,
        library: gradient.library,
        type: gradient.type,
        favorites: favorites,
        creator: userId

    });
}
catch (err) {
    console.log('create gradient err', err)
    res.render('error', {
        pageTitle: 'Error',
        path: '/error',
        message: 'Unable to create gradient'
    })
}
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
    try{
    const gradients = await Gradient.find({ library: true }).populate('userId').exec();

    const type = gradients.type;

    let favorites;
    if(!req.session.user){
        favorites=[];
    }
    else{      
    const user = await User.findById(req.session.user._id).exec();
    favorites = user.favorites;
    }

    res.render('library', {
        pageTitle: 'Gradient-library',
        path: '/gradient/library',
        gradients: gradients,
        favorites: favorites,
        type: type,
    })
}
catch (err) {
    console.log('library acces', err)
    res.render('error', {
        pageTitle: 'Error',
        path: '/error',
        message: 'Could not acces library'
    })
}
};

exports.getGradientView = async (req, res, next) => {
    try{
    const user = await User.findById(req.session.user._id).exec()
    const gradientId = req.params.gradientId;

    const favorites = user.favorites.map(favorite => { return favorite._id })

    const gradient = await Gradient.findById(gradientId)
        .populate('userId')
        .exec()
    const creator = gradient.userId

    res.render('gradient-view', {
        pageTitle: gradient.title,
        path: '/gradient-view',
        gradient: gradient,
        title: gradient.title,
        color1: gradient.colors[0],
        color2: gradient.colors[1],
        tags: gradient.tags,
        userId: req.session.user._id,
        gradientId: gradient._id,
        library: gradient.library,
        type: gradient.type,
        favorites: favorites,
        creator: creator
    });
    }
    catch (err) {
        console.log('get gradient view', err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Unable to acess gradient view'
        })
    }
};



exports.searchLibrary = async (req, res, next) => {

    try {
        let favorites;
        if (req.session.user) {
            const user = await User.findById(req.session.user._id).exec()
            favorites = favorites = user.favorites.map(favorite => { return favorite._id })

        }
        else {
            favorites = [];
        }


        const query = req.body.query
        const gradients = await Gradient.find(
            {
                $and: [
                    { $text: { $search: query } },
                    { library: true }
                ]
            })
            .populate('userId')
            .exec();

        if (gradients.length == 0) {
            res.render('no-results', {
                pageTitle: 'No results',
                path: 'gradient/search'
            })
        }
        else {
            res.render('library', {
                gradients: gradients,
                path: '/gradient/search',
                pageTitle: query,
                count: gradients.length,
                query: query,
                favorites: favorites,

            });
        }
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


        if ((req.session.user._id.toString() === gradient.userId.toString()) || (req.session.user.role == 'admin')) {
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

///favorites


exports.addToFavorites = async (req, res, next) => {
    try{
    const gradient = await Gradient.findById(req.body.gradientId).exec();
    const user = await User.findById(req.session.user._id).populate('favorites').exec()

    const favorites = user.favorites.map(favorite => { return favorite._id })

    if (favorites.includes(gradient._id)) {
        user.favorites.pull(gradient._id)
    }
    else {

        user.favorites.addToSet(gradient._id)

    }

    await user.save();

    res.status(200).redirect('/gradient/view/' + gradient._id)
    }
    catch (err) {
        console.log('add to favorites', err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Not added to favorites'
        })
    }
}


exports.getFavorites = async (req, res, next) => {
    try{
    const user = await User.findById(req.params.userId)
        .populate('favorites')
        .populate({
            path: 'favorites',
            populate: {
                path: 'userId',
                model: 'User'
            }
        })
        .exec();



    const favorites = user.favorites.map(favorite => { return favorite._id })

    res.render('profile', {
        pageTitle: 'favorites',
        path: '/users/profile/favorites',
        gradients: user.favorites,
        favorites: favorites,
        // userId: user.favorites.userId,
        userId:user._id,
        user:user
    });
}
catch (err) {
    console.log('get Favorites', err)
    res.render('error', {
        pageTitle: 'Error',
        path: '/error',
        message: 'Could not find favorites'
    })
}
}


exports.libraryFavorite = async (req, res, next) => {
    try{
    const gradient = await Gradient.findById(req.body.gradientId).exec();
    const user = await User.findById(req.session.user._id)
        .populate('favorites')
        .exec();
    const favorites = user.favorites.map(favorite => { return favorite._id })


    if (favorites.includes(gradient._id)) {
        user.favorites.pull(gradient._id)
    }
    else {

        user.favorites.addToSet(gradient._id)

    }

    await user.save();

    res.redirect('/gradient/library')
}
catch (err) {
    console.log('library favorite', err)
    res.render('error', {
        pageTitle: 'Error',
        path: '/error',
        message: 'Unable to add to favorites'
    })
}

};

exports.download = async (req, res, next) => {
    try{
    const gradient = await Gradient.findById(req.body.gradientId).exec()


    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--start-maximized',
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ],
        defaultViewport: null
    });
    const page = await browser.newPage();

    const width = req.body.width;

    const aspectRatio = req.body.aspectRatio;
    const height = width * aspectRatio;

    const options = {
        colors: gradient.colors, 
        color1: gradient.colors[0],
        color2: gradient.colors[1],
        type: gradient.type,
        width: width,
        height: height
    }

    await page.evaluate(async options => {
        function createGradient(gradient, context, colors) {
            console.log('colors[0]', colors[0])
            gradient.addColorStop(0, colors[0]);
            console.log(colors[0])
            for(let i=1 ;i<colors.length-1; i++){
                const offset = i/colors.length; 
                gradient.addColorStop(offset, colors[i])
            }
            gradient.addColorStop(1, colors[colors.length-1]);
            context.fillStyle = gradient;
            context.fillRect(0, 0, 500, 500);
        }
  
        const canvas = document.createElement('canvas')
        document.body.appendChild(canvas)
        document.body.style.margin = 0

        document.body.style.width = options.width + 'px';
        document.body.style.height = options.height + 'px';

        canvas.id = "gradient-canvas"
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.height = 500
        canvas.width = 500
        const context = canvas.getContext("2d");

        let gradient;
        switch (options.type) {
            case 'horizontal':
                gradient = context.createLinearGradient(0, 0, 500, 0);
                createGradient(gradient, context, options.colors)
                break;

            case 'vertical':
                gradient = context.createLinearGradient(0, 0, 0, 500)
                createGradient(gradient, context, options.colors)
                break;

            case 'radial':
                gradient = context.createRadialGradient(300, 300, 30, 300, 300, 300)
                createGradient(gradient, context, options.colors)
                break;

            case 'diagonal':
                gradient = context.createLinearGradient(0, 0, 500, 500)
                createGradient(gradient, context,options.colors)
                break;

        }


    }, options)
    const buffer = await page.screenshot({
        //path: 'gradient.png',
        clip: {
            x: 0,
            y: 0,
            width: +options.width,
            height: +options.height
        }
    });
    res.setHeader('Content-Disposition', 'attachment; filename="gradient.png"')
    res.setHeader('Contenbt-Type', 'image/png')
    res.send(buffer)

    }
    catch (err) {
        console.log('pupeteer err', err)
        res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            message: 'Could not download gradient'
        })
    }
}
























