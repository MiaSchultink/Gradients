require('dotenv').config()

const path = require('path');

const mongoose = require('mongoose')
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session)



const app = express();
const store = new MongoDBStore({
    uri: process.env.MONGO_URL,
    collection: 'sessions'
});


mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true
})



app.set('view engine', 'ejs')
app.set('views', 'views')

const userRoutes = require('./routes/users')
const gradientRoutes = require('./routes/gradient')
const controller404 = require('./controllers/error');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store
}));

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