const express = require('express');
const userController = require('../controllers/users');
const router = express.Router();

router.get('/login', userController.getLogIn);
router.post('/login', userController.postLogin);

router.post('/logout', userController.postLogout);

router.get('/sign-up', userController.getSignUp);
router.post('/sign-up', userController.postSignUp);

router.get('/profile',isAuth, userController.getProfile);

module.exports = router;