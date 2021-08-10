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
router.get('/myProfile/:userId', isAuth, userController.getMyProfile);
router.get('/profile/edit/:userId',isAuth, userController.getUserEdit);
router.post('/profile/edit', isAuth, userController.postUserEdit);

router.get('/posts/:userId', isAuth, userController.getPosts);

router.get('/find', isAuth, userController.getUsers);

router.post('/find', isAuth, userController.findUser);

router.post('/follow', isAuth, userController.follow);
router.post('/unfollow', isAuth, userController.unfollow);

router.get('/followers/:userId', isAuth, userController.getFollowers);
router.get('/following/:userId', isAuth, userController.getFollowing);


module.exports = router;