const express = require('express');
const router = express.Router();
const gradientController = require('../controllers/gradient')

router.get('/create', gradientController.getGradientPage);
router.post('/create', gradientController.postGradientPage);

router.get('/library', gradientController.getGradientLibrary);

module.exports = router;