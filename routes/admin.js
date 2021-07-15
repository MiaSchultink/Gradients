const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin')
const isAuth = require('../middlewear/is-auth')
const isAdmin = require('../middlewear/is-admin')

router.get('/users', isAuth, isAdmin, adminController.getAllUsers)
module.exports = router;