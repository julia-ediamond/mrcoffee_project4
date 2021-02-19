// express setup
const express = require('express')
const app = express()

const crypto = require('crypto');
const path = require('path');
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser');


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
5
// postgres setup
// const db = require('./database')

// static files
app.use(express.static('public'))
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json())
// port
const port = 3002

// ejs template engine
app.set('views', './views')
app.set('view engine', 'ejs')
app.use(expressLayouts)
//app.set('layout')


//get route for login form
app.get('/login', (req, res) => {
    res.render('pages/login')
});

//post route for login form
app.post('/home', (req, res) => {
    const psw = req.body.password;
    const encryptedPassword = crypto.createHash('sha256').update(psw).digest('hex');
    const user = {
        email: req.body.email,
        password: encryptedPassword
    };
    res.redirect('pages/index')
});


//get route for signup form
app.get('/signup', (req, res) => {
    res.render('pages/signup')
});






app.listen(3002, () => {
    console.log("listening on port http:\\localhost:3002!")
})