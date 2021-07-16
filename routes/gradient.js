const express = require('express');
const router = express.Router();
const isAuth = require('../middlewear/is-auth.js')
const gradientController = require('../controllers/gradient')

router.get('/create', isAuth, gradientController.getGradientPage);
router.post('/create',isAuth, gradientController.postGradientPage);

router.get('/library', isAuth, gradientController.getGradientLibrary);

router.get('/view/:gradientId', isAuth, gradientController.getGradientView);

router.post('/library', isAuth, gradientController.postToLibrary);


module.exports = router;