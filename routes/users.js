const express = require('express');
const userController = require('../controllers/users');
const router = express.Router();

router.get('/login', userController.getLogIn);
router.post('/login', userController.postLogin);

router.get('/sign-up', userController.getSignUp);
router.post('/sign-up', userController.postSignUp);


module.exports = router;