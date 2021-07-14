const express = require('express');
const userController = require('../controllers/users');
const router = express.Router();
const isAuth = require('../middlewear/is-auth')

router.get('/login', userController.getLogIn);
router.post('/login', userController.postLogin);

router.post('/logout', userController.postLogout);

router.get('/sign-up', userController.getSignUp);
router.post('/sign-up', userController.postSignUp);

router.get('/reset', userController.getReset);
router.post('/reset', userController.postReset);

router.get('/profile',isAuth, userController.getProfile);

module.exports = router;