const express = require('express');
const router = express.Router();
const isAuth = require('../middlewear/is-auth.js')
const gradientController = require('../controllers/gradient')

router.get('/create', isAuth, gradientController.getGradientPage);
router.post('/create', gradientController.postGradientPage);

router.get('/library', gradientController.getGradientLibrary);

router.get('/view/:gradientId', isAuth, gradientController.getGradientView);

router.post('/library', gradientController.postToLibrary);

module.exports = router;