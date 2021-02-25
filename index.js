// express setup
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')

const crypto = require('crypto');
const path = require('path');
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser');

//to convert days of the week from numbers to string
const daysOfWeek = ['Select a day', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// postgres setup
const db = require('./database')

// static files
app.use(express.static('public'))
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json())
// port
const port = 3002
app.listen(port, () => {
    console.log(`listening on port http://localhost:${port}!`)
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


//get homepage
app.get('/', (req, res) => {
    db.any('SELECT * FROM schedules;')
        .then((schedules) => {
            res.render('pages/index', {
                layout: './layouts/profile-layout',
                schedules: schedules
            })
        })
        .catch((err) => {
            res.render('pages/error', {
                err: err
            })
        })
})

//get schedule management page
//TO_CHAR() function converts a timestamp, an interval, an integer, a double precision, or a numeric value to a string
//TO_CHAR(expression, format)
// TODO: test after authentication
app.get('/schedule', (req, res) => {
    // db.any(`SELECT day, start_time, end_time FROM schedules WHERE ${currentUser.id} = id_user;`) - TO BE UNCOMMENTED AFTER AUTHENTICATION
    db.any(`SELECT day, TO_CHAR(start_time,'HH24:MI') start_time, TO_CHAR(end_time,'HH24:MI') end_time FROM schedules WHERE id_user = 1;`) // For testing
        .then((schedules) => {
            res.render('pages/schedule', {
                layout: './layouts/profile-layout',
                firstname: 'Iulia', // placeholder, replace with currentUser.firstname AFTER AUTHENTICATION
                schedules: schedules,
                daysOfWeek: daysOfWeek
            })
        })
        .catch((err) => {
            res.render('pages/error', {
                err: err
            })
        })
})


//post schedule
//the format we need HH24 and MI
//TO_TIMESTAMP converts char of CHAR, VARCHAR2, NCHAR, or NVARCHAR2 datatype to a value of TIMESTAMP datatype.
app.post('/schedule', (req, res) => {

    db.query(`INSERT INTO schedules (id_user, day, start_time, end_time) 
    VALUES ($1, $2, TO_TIMESTAMP($3,'HH24:MI'), TO_TIMESTAMP($4,'HH24:MI'))`, [1, req.body.day, req.body.start_time, req.body.end_time])
        .then((schedules) => {
            res.redirect('schedule')
        })
        .catch((err) => {
            res.render('pages/error', {
                err: err
            })
        })
})


// get any profile
app.get('/profile/:id(\\d+)/', (req, res) => {
    db.any(`SELECT users.id, firstname, surname, email, day, start_time, end_time FROM users LEFT JOIN schedules ON users.id = schedules.id_user WHERE ${req.params.id} = users.id`)
        .then((combinedData) => {
            res.render('pages/profile', {
                layout: './layouts/profile-layout',
                firstname: combinedData[0].firstname,
                lastname: combinedData[0].surname,
                email: combinedData[0].email,
                schedules: combinedData
            })
        })
        .catch((err) => {
            res.render('pages/error', {
                err: err
            })
        })
})

// get current user profile
app.get('/profile', (req, res) => {
    // db.any(`SELECT users.id, firstname, surname, email, day, start_time, end_time FROM users LEFT JOIN schedules ON users.id = schedules.id_user WHERE ${currentUser.id} = users.id`) - UNCOMMENT AFTER AUTHENTICATION
    db.any(`SELECT users.id, firstname, surname, email, day, start_time, end_time FROM users LEFT JOIN schedules ON users.id = schedules.id_user WHERE 1 = users.id`) // for testing
        .then((combinedData) => {
            res.render('pages/profile', {
                layout: './layouts/profile-layout',
                firstname: combinedData[0].firstname,
                lastname: combinedData[0].surname,
                email: combinedData[0].email,
                schedules: combinedData
            })
        })
        .catch((err) => {
            res.render('pages/error', {
                err: err
            })
        })
})

app.get('*', (req, res) => {
    res.status(404).send('This page does not exist');
})

// for testing
// app.get('/error', (req, res) => {
//     const err = "Please try again";
//     res.render('pages/error', {
//         err: err
//     })
// })

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