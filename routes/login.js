const express = require('express')
const router = express.Router()
const db = require('../database')
const bcrypt = require('bcrypt')

// get route for login form
router.get('/', (req, res) => {
    let message = req.query.message

    if (message === undefined) {
        return res.render('pages/login', {
            layout: 'layouts/login-layout',
            message: undefined
        })
    } else {
        res.render('pages/login', {
            layout: 'layouts/login-layout',
            message: message
        })
    }
})

// post route for login form
router.post('/', (req, res) => {
    const email = req.body.email.toLowerCase()
    const password = req.body.password

    if (email && password) {
        db.any('SELECT id, lower(email), password FROM users WHERE email = $1', [email])
        .then((user) => {
            if (user.length === 1) {
                bcrypt.compare(password, user[0].password, function(err, result) {
                    if (result) {
                        // create user id session data for logged in user
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

module.exports = router