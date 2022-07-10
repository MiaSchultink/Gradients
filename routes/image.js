const express = require('express');
const router = express.Router();
const imageController = require('../controllers/image');
const isAuth = require('../middlewear/is-auth')
const isAdmin = require('../middlewear/is-admin')

router.get('/select',isAuth, imageController.getImageEditing);

module.exports = router;