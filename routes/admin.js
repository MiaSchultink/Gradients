const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin')
const isAuth = require('../middlewear/is-auth')
const isAdmin = require('../middlewear/is-admin')

router.get('/users', isAuth, isAdmin, adminController.getAllUsers)
router.get('/users/:userId', isAuth, isAdmin, adminController.getUser )

router.get('/duplicates', isAuth, isAdmin, adminController.deleteDuplicates)
module.exports = router;