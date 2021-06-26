const path = require('path');

const fs = require('fs');
const espress = require('express');
const app = express();

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));



app.use((req, res, next) => {
    res.status(404).render('404', { pageTitle: 'page not found' });

});

app.listen(3000)
