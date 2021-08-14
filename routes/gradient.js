const express = require('express');
const router = express.Router();
const isAuth = require('../middlewear/is-auth.js')
const gradientController = require('../controllers/gradient');

router.get('/create', isAuth, gradientController.getGradientPage);
router.post('/view',isAuth, gradientController.postGradientPage);

router.get('/library', gradientController.getGradientLibrary);

router.get('/view/:gradientId', isAuth, gradientController.getGradientView);

router.post('/library',isAuth, gradientController.postToLibrary);

router.post('/favorites', isAuth, gradientController.addToFavorites);
router.get('/favorites/:userId', isAuth, gradientController.getFavorites);

router.post('/library/favorites',isAuth, gradientController.libraryFavorite);

router.post('/search', gradientController.searchLibrary);
router.post('/delete', isAuth, gradientController.deleteGradient)

router.post('/download', isAuth, gradientController.download);

router.get('/edit/:gradientId', isAuth, gradientController.getEditGraidnet);
router.post('/edit', isAuth, gradientController.postEditGradients);





module.exports = router;