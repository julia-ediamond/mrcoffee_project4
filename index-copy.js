// express setup
const express = require('express')
const session = require('express-session')
const app = express()
const bcrypt = require('bcrypt')

const crypto = require('crypto');
const path = require('path');
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser');

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
    console.log(`listening on port http://localhost:${port} !`)
})

// ejs template engine
app.set('views', './views')
app.set('view engine', 'ejs')

app.use(expressLayouts)
app.set('layout', './layouts/login-layout')

// session setup
const sixHours = 6 * 60 * 60 * 1000 // h * m * s * ms

const {
    NODE_ENV = 'development',
    SESS_NAME = 'sid',
    SESS_SECRET = '8PwTNVqFxm65awkPnOfuNBRzSlnriV5u', // don't change this
    SESS_LIFETIME = sixHours
} = process.env

const IN_PROD = NODE_ENV === 'production'

app.use(session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
        maxAge: SESS_LIFETIME,
        sameSite: true,
        secure: IN_PROD
    }
}))

// middleware for restricting page views
const redirectLogin = (req, res, next) => {
    if (!req.session.id) {
        res.redirect('/login')
    } else {
        next()
    }
}

// middleware for restricting page views
const redirectHome = (req, res, next) => {
    if (req.session.id) {
        res.redirect('/')
    } else {
        next()
    }
}

//get route for login form
app.get('/login', redirectHome, (req, res) => {
    res.render('pages/login')
});

//post route for login form

app.post('/login', redirectHome,  (req, res) => {
    // const compare = bcrypt.compare(req.body.['confirm-password'], hashedPassword)
    const hashedPassword = bcrypt.hash(req.body.password, 10)
    const user = {
        email: req.body.email,
        password: hashedPassword
    };
    res.redirect('/index')
});

//get route for signup form
app.get('/signup', redirectHome, (req, res) => {
    res.render('pages/signup')
});

//post route for signup form
app.post('/signup', (req, res) => {

    //validate
    const fnValid = /^([A-Za-zÀ-ÖØ-öø-ÿ])+( |-)?([A-Za-zÀ-ÖØ-öø-ÿ?]?)+( |-)?([A-Za-zÀ-ÖØ-öø-ÿ?]?)+$/.test(req.body.firstname)
    const lnValid = /^([A-Za-zÀ-ÖØ-öø-ÿ])+( |-)?([A-Za-zÀ-ÖØ-öø-ÿ?]?)+( |-)?([A-Za-zÀ-ÖØ-öø-ÿ?]?)+$/.test(req.body.lastname)
    const eValid = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(req.body.email)
    const pValid = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/.test(req.body.password)

    let newUser = {}
    

    db.any('SELECT * FROM users;')
    .then((users) => {
        if (fnValid && lnValid && eValid && pValid) {
            console.log(req.body)
            console.log('All is valid')
            if (req.body.password === req.body['confirm-password']) {
                console.log('Passwords are the same')
                if (!users.find(user => user.email === req.body.email)) {
                    bcrypt.hash(req.body.password, 10, function(err, hash) {
                        newUser = {
                            surname: req.body.lastname,
                            firstname: req.body.firstname,
                            email: req.body.email,
                            password: hash
                        }
                        db.query('INSERT INTO users(firstname, surname, email, password) VALUES ($1, $2, $3, $4);', [newUser.firstname, newUser.surname, newUser.email, newUser.password])
                        .then (() => {
                            res.redirect('/')
                        })
                        .catch((err) => {
                            res.render('pages/error', {
                                err: err
                            })
                        })
                    })
                }
            }
        }
    })
    .catch((err) => {
        res.render('pages/error', {
            err: err
        })
    })
})


//get homepage
app.get('/', redirectLogin, (req, res) => {
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
// TODO: test after authentication
app.get('/schedule', redirectLogin, (req, res) => {
    // db.any(`SELECT day, start_time, end_time FROM schedules WHERE ${currentUser.id} = id_user;`) - TO BE UNCOMMENTED AFTER AUTHENTICATION
    db.any(`SELECT day, start_time, end_time FROM schedules WHERE id_user = 1;`) // For testing
    .then((schedules) => {
        res.render('pages/schedule', {
            layout: './layouts/profile-layout',
            firstname: 'Iulia', // placeholder, replace with currentUser.firstname AFTER AUTHENTICATION
            schedules: schedules
        })
    })
    .catch((err) => {
        res.render('pages/error', {
            err: err
        })
    })
})


// post schedule


// get any profile
app.get('/profile/:id(\\d+)/', redirectLogin, (req, res) => {
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
app.get('/profile', redirectLogin, (req, res) => {
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