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

router.get('/reset/:token', userController.getNewPassword);
router.post('/new-password', userController.postNewPassword);

router.get('/profile/:userId',isAuth, userController.getProfile);
router.get('/profile/edit/:userId',isAuth, userController.getUserEdit);
router.post('/profile/edit', isAuth, userController.postUserEdit);

module.exports = router;