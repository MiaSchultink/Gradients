const express = require('express');
const router = express.Router();
const isAuth = require('../middlewear/is-auth.js')
const gradientController = require('../controllers/gradient');
const { route } = require('./users.js');

router.get('/create', isAuth, gradientController.getGradientPage);
router.post('/view',isAuth, gradientController.postGradientPage);

router.get('/library', isAuth, gradientController.getGradientLibrary);

router.get('/view/:gradientId', isAuth, gradientController.getGradientView);

router.post('/library', isAuth, gradientController.postToLibrary);

router.post('/favorites', isAuth, gradientController.addToFavorites);
router.get('/favorites', isAuth, gradientController.getFavorites);

router.post('/library/favorites',isAuth, gradientController.libraryFavorite);

router.post('/search', gradientController.searchLibrary);
router.post('/delete', isAuth, gradientController.deleteGradient)

// router.post('/download', gradientController.download); 
router.post('/download', isAuth, gradientController.download);





module.exports = router;