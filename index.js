// express setup
const express = require('express')
const session = require('express-session')
const app = express()
const bcrypt = require('bcrypt')
const querystring = require('querystring')

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
    },
}))

// middleware for restricting page views
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/login')
    } else {
        next()
    }
}

// middleware for restricting page views
const redirectHome = (req, res, next) => {
    if (req.session.userId) {
        res.redirect('/')
    } else {
        next()
    }
}


// get route for login form
app.get('/login', redirectHome, (req, res) => {
    let message = req.query.message

    if (message === undefined) {
        return res.render('pages/login', {
            message: undefined
        })
    } else {
        res.render('pages/login', {
            message: message
        })
    }
})

// post route for login form
app.post('/login', redirectHome, (req, res) => {
    const email = req.body.email.toLowerCase()
    const password = req.body.password

    if (email && password) {
        db.any('SELECT id, lower(email), password FROM users WHERE email = $1', [email])
        .then((user) => {
            if (user.length === 1) {
                bcrypt.compare(password, user[0].password, function(err, result) {
                    if (result) {
                        req.session.userId = user[0].id
                        return res.redirect('/')
                    } else {
                        return res.redirect('/login?message=Incorrect%20email%20or%20password.')
                    }
                })
            } else {
                return res.redirect('/login?message=Incorrect%20email%20or%20password.')
            }
        })
        .catch((err) => {
            return res.render('pages/error', {
                layout: './layouts/login-layout',
                err: err
            })
        })
        
    } else {
        res.redirect('/login?message=Please%20insert%20both%20email%20and%20password.')
    }
})

// get route for signup form
app.get('/signup', redirectHome, (req, res) => {
    let message = req.query.message

    if (message === undefined) {
        return res.render('pages/signup', {
            message: undefined
        })
    } else {
        res.render('pages/signup', {
            message: message
        })
    }
})

// post new user using bcrypt
app.post('/signup', redirectHome, (req, res) => {

    // validate
    const fnValid = /^([A-Za-zÀ-ÖØ-öø-ÿ])+( |-)?([A-Za-zÀ-ÖØ-öø-ÿ?]?)+( |-)?([A-Za-zÀ-ÖØ-öø-ÿ?]?)+$/.test(req.body.firstname)
    const lnValid = /^([A-Za-zÀ-ÖØ-öø-ÿ])+( |-)?([A-Za-zÀ-ÖØ-öø-ÿ?]?)+( |-)?([A-Za-zÀ-ÖØ-öø-ÿ?]?)+$/.test(req.body.lastname)
    const eValid = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(req.body.email)
    const pValid = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/.test(req.body.password)

    let newUser = {}
    

    db.any('SELECT * FROM users;')
    .then((users) => {
        if (fnValid && lnValid && eValid && pValid) {
            if (req.body.password === req.body['confirm-password']) {
                const exists = users.some(user => user.email === req.body.email.toLowerCase())
                if (!exists) {
                    bcrypt.hash(req.body.password, 10, function(err, hash) {
                        newUser = {
                            id: users.length + 1,
                            surname: req.body.lastname,
                            firstname: req.body.firstname,
                            email: req.body.email.toLowerCase(),
                            password: hash
                        }
                        db.query('INSERT INTO users(firstname, surname, email, password) VALUES ($1, $2, $3, $4);', [newUser.firstname, newUser.surname, newUser.email, newUser.password])
                        .then (() => {
                            return res.redirect('/login?message=Signup%20successful.')
                        })
                        .catch((err) => {
                            return res.render('pages/error', {
                                layout: './layouts/login-layout',
                                err: err
                            })
                        })
                    })
                } else {
                    res.redirect('/signup?message=User%20already%20exists.')
                }
            }
        }
    })
    .catch((err) => {
        res.render('pages/error', {
            layout: './layouts/login-layout',
            err: err
        })
    })
})

// logout
app.post('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            res.render('pages/error', {
                layout: './layouts/profile-layout',
                err: err
            })
        } else {
            res.clearCookie(SESS_NAME)
            res.redirect('/login')
        }
    })
})


// get homepage
app.get('/', redirectLogin, (req, res) => {
    db.any('SELECT users.id, firstname, surname, day, start_time, end_time FROM users INNER JOIN schedules ON users.id = schedules.id_user ORDER BY surname ASC, day ASC')
        .then((schedules) => {
            res.render('pages/index', {
                layout: './layouts/profile-layout',
                schedules: schedules
            })
        })  
        .catch((err) => {
            res.render('pages/error', {
                layout: './layouts/profile-layout',
                err: err
            })
        })
})

//get schedule management page
//TO_CHAR() function converts a timestamp, an interval, an integer, a double precision, or a numeric value to a string
//TO_CHAR(expression, format)
app.get('/schedule', (req, res) => {
    db.any(`SELECT day, TO_CHAR(start_time,'HH24:MI') start_time, TO_CHAR(end_time,'HH24:MI') end_time FROM schedules WHERE id_user = $1;`, [req.session.userId])
        .then((schedules) => {
            res.render('pages/schedule', {
                layout: './layouts/profile-layout',
                schedules: schedules,
                daysOfWeek: daysOfWeek
            })
        })
        .catch((err) => {
            res.render('pages/error', {
                layout: './layouts/profile-layout',
                err: err
            })
        })
})


//post schedule
//the format we need HH24 and MI
//TO_TIMESTAMP converts char of CHAR, VARCHAR2, NCHAR, or NVARCHAR2 datatype to a value of TIMESTAMP datatype.
app.post('/schedule', (req, res) => {

    db.query(`INSERT INTO schedules (id_user, day, start_time, end_time) 
    VALUES ($1, $2, TO_TIMESTAMP($3,'HH24:MI'), TO_TIMESTAMP($4,'HH24:MI'))`, [req.session.userId, req.body.day, req.body.start_time, req.body.end_time])
        .then((schedules) => {
            res.redirect('schedule')
        })
        .catch((err) => {
            res.render('pages/error', {
                layout: './layouts/profile-layout',
                err: err
            })
        })
})


// get any profile
app.get('/profile/:id(\\d+)/', redirectLogin, (req, res) => {
    db.any('SELECT users.id, firstname, surname, email, day, start_time, end_time FROM users LEFT JOIN schedules ON users.id = schedules.id_user WHERE users.id = $1', [req.params.id])
        .then((combinedData) => {
            if (combinedData.length > 0) {
                res.render('pages/profile', {
                    layout: './layouts/profile-layout',
                    firstname: combinedData[0].firstname,
                    lastname: combinedData[0].surname,
                    email: combinedData[0].email,
                    schedules: combinedData
                })
            } else {
                return res.render('pages/error', {
                    layout: './layouts/profile-layout',
                    err: {
                        message: 'No such user ID.'
                    }
                })
            }
        })
        .catch((err) => {
            res.render('pages/error', {
                layout: './layouts/profile-layout',
                err: err
            })
        })
})

// get current user profile
app.get('/profile', redirectLogin, (req, res) => {
    db.any('SELECT users.id, firstname, surname, email, day, start_time, end_time FROM users LEFT JOIN schedules ON users.id = schedules.id_user WHERE users.id = $1', [req.session.userId])
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
                layout: './layouts/profile-layout',
                err: err
            })
        })
})

app.get('*', (req, res) => {
    res.status(404).render('pages/error', {
        layout: './layouts/login-layout',
        err: {
            message: 'This page does not exist'
        }
    })
})

app.listen(port, () => {
    console.log(`listening on port http://localhost:${port} !`)
})
