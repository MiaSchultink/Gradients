require('dotenv').config()

const path = require('path');

//const fs = require('fs');
const mongoose = require('mongoose')
const express = require('express');
const app = express();

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true
})

const controller404 = require('./controllers/error');

app.set('view engine', 'ejs')
app.set('views', 'views')

const userRoutes = require('./routes/users')
const gradientRoutes  = require('./routes/gradient')

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', userRoutes);
app.use('/gradient', gradientRoutes);

app.get('/', (req, res, next) => {
    res.status(200).render('index', {
        pageTitle: 'Home page',
        path: '/home'
    });
});

app.use(controller404.get404);

module.exports = app