const path = require('path');

//const fs = require('fs');
const express = require('express');
const app = express();

app.set('view engine', 'ejs')
app.set('views', 'views')

const loginRoutes = require('./routes/login')

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/login', loginRoutes);

app.use('/', (req, res, next) => {
    res.status(200).render('index', {
        pageTitle: 'Home page',
        path: '/'
    });
});


// app.use('/login', (req,res, next)=>{
//   res.render('login',{
//       pageTitle: 'Log-in',
//       path: '/login'
//   });
// });

// app.use((req,res, next)=>{
//     console.log('hello')
//     res.render('index');
// });


app.use((req, res, next) => {
    res.status(404).render('404', {
        pageTitle: 'page not found',
        path: ''
    });
});

app.listen(3000);
