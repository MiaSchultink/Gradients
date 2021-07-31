

const Gradient = require('../models/gradient.js')
const User = require('../models/user')
const puppeteer = require('puppeteer');
const gradient = require('../models/gradient.js');
const user = require('../models/user');



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
    const user = await User.findById(req.session.user._id).exec()


    const colors = [req.body.color1, req.body.color2];
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
        pink: '#f564df'
    };


    const nearestColor = require('nearest-color').from(primaryColors)
    const color1 = nearestColor(gradient.colors[0])
    const color2 = nearestColor(gradient.colors[1])

    gradient.tags.push(color1.name, color2.name)

    user.gradients.push(gradient)

    const favorites = user.favorites.map(favorite => { return favorite._id })


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
        type: gradient.type,
        favorites: favorites,
        creator: userId

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
    const gradients = await Gradient.find({ library: true }).populate('userId').exec();
    const user = await User.findById(req.session.user._id).exec();

    const type = gradients.type;
    const favorites = user.favorites;
    console.log(gradients)



    res.render('library', {
        pageTitle: 'Gradient-library',
        path: '/gradient/library',
        gradients: gradients,
        favorites: favorites,
        type: type,
    })
};

exports.getGradientView = async (req, res, next) => {
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
 
            if(gradients.length==0){
                res.render('no-results',{
                    pageTitle: 'No results',
                    path: 'gradient/search'
                })
            }
        
        res.render('library', {
            gradients: gradients,
            path: '/gradient/search',
            pageTitle: query,
            count: gradients.length,
            query: query,
            favorites: favorites,

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
    console.log('GradientId', req.body.gradientId)
    const gradient = await Gradient.findById(req.body.gradientId).exec();

    // const user = await User.findById(req.body.userId)
    //     .populate('favorites')
    //     .exec();
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


exports.getFavorites = async (req, res, next) => {
    const user = await User.findById(req.session.user._id)
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
        userId: user.favorites.userId
    });
}


exports.libraryFavorite = async (req, res, next) => {
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

};

exports.download = async (req, res, next) => {
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
        color1: gradient.colors[0],
        color2: gradient.colors[1],
        type: gradient.type,
        width: width,
        height: height
    }
    await page.evaluate(async options => {

        function createGradient(gradient, context, color1, color2) {
            gradient.addColorStop(0, options.color1);
            gradient.addColorStop(1, options.color2);
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
                createGradient(gradient, context, options.color1, options.color2)
                break;

            case 'vertical':
                gradient = context.createLinearGradient(0, 0, 0, 500)
                createGradient(gradient, context, options.color1, options.color2)
                break;

            case 'radial':
                gradient = context.createRadialGradient(300, 300, 30, 300, 300, 300)
                createGradient(gradient, context, options.color1, options.color2)
                break;

            case 'diagonal':
                gradient = context.createLinearGradient(0, 0, 500, 500)
                createGradient(gradient, context, options.color1, options.color2)
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
























