const express = require('express');
const router = express.Router();
const gradientController = require('../controllers/gradient')

router.get('/', gradientController.getGradientPage);
router.post('/', gradientController.postGradientPage);

module.exports = router;