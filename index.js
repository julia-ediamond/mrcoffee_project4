// express setup
const express = require('express')
const session = require('express-session')
// const methodOverride = require('method-override')
const app = express()
const bcrypt = require('bcrypt')
const querystring = require('querystring')

const path = require('path')
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')

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

// override with POST having other HTTP methods
// app.use(methodOverride('X-HTTP-Method-Override'))


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

//to convert days of the week from numbers to string
app.locals.daysOfWeek = ['Select a day', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
// this will persist throughout the app and can be called in router files via req.app.locals.daysOfWeek


// routes
const loginRouter = require('./routes/login')
const signupRouter = require('./routes/signup')
const homeRouter = require('./routes/home')
const profileRouter = require('./routes/profile')
const scheduleRouter = require('./routes/schedule')
const errorRouter = require('./routes/404')

app.use('/login', loginRouter)
app.use('/signup', signupRouter)
app.use('/', homeRouter)
app.use('/profile', profileRouter)
app.use('/schedule', scheduleRouter)
app.use('*', errorRouter)


// logout
app.post('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            res.render('pages/error', {
                layout: 'layouts/profile-layout',
                err: err
            })
        } else {
            res.clearCookie(SESS_NAME)
            res.redirect('/login')
        }
    })
})


app.listen(port, () => {
    console.log(`listening on port http://localhost:${port} !`)
})
