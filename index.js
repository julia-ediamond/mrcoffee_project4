// express setup
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')

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
app.listen(3002, () => {
    console.log("listening on port http:\\localhost:3002!")
})

const users = [] //to test it locally while I don't have a database

// ejs template engine
app.set('views', './views')
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.set('layout', './layouts/login-layout')


//get route for login form
app.get('/login', (req, res) => {
    res.render('pages/login')
});

//post route for login form
app.post('/login', (req, res) => {
    const psw = req.body.password;
    const encryptedPassword = crypto.createHash('sha256').update(psw).digest('hex');
    const user = {
        email: req.body.email,
        password: encryptedPassword
    };
    res.redirect('/index')
});

//get route for signup form
app.get('/signup', (req, res) => {
    res.render('pages/signup')
});

//get homepage
app.get('/', (req, res) => {
    res.render('pages/index', { layout: './layouts/profile-layout' })
});

// post new user using crypto
// app.post('/signup', (req, res) => {
//     const psw = req.body.password;
//     const encryptedPassword = crypto.createHash('sha256').update(psw).digest('hex');
//     const newUser = {
//         firstname: req.body.firstname,
//         lastname: req.body.lastname,
//         email: req.body.email,
//         password: encryptedPassword
//     };
//     database.users.push(newUser);
//     res.redirect('/index');
// })


//post new user using bcrypt. it prints empty object yet
app.post('/signup', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/index')
    } catch {
        res.redirect('/signup')
    }
    console.log(users)
})

