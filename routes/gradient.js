const express = require('express');
const router = express.Router();
const gradientController = require('../controllers/gradient')

router.get('/create', gradientController.getGradientPage);
router.post('/create', gradientController.postGradientPage);

router.get('/library', gradientController.getGradientLibrary);

router.get('/view/:gradientId', gradientController.getGradientView);

router.post('/library', gradientController.postToLibrary);

module.exports = router;