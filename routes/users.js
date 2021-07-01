const express = require('express');
const loginController = require('../controllers/users');
const router = express.Router();

router.get('/login', loginController.getLogIn);
router.post('/login', loginController.postLogin);


module.exports = router;