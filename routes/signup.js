const express = require('express')
const router = express.Router()
const db = require('../database')
const bcrypt = require('bcrypt')

const redirectHome = (req, res, next) => {
    if (req.session.userId) {
        res.redirect('/')
    } else {
        next()
    }
}

// get route for signup form
router.get('/', redirectHome, (req, res) => {
    let message = req.query.message

    if (message === undefined) {
        return res.render('pages/signup', {
            layout: 'layouts/login-layout',
            message: undefined
        })
    } else {
        res.render('pages/signup', {
            layout: 'layouts/login-layout',
            message: message
        })
    }
})

// post new user using bcrypt
router.post('/', redirectHome, (req, res) => {

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
                                layout: 'layouts/login-layout',
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
            layout: 'layouts/login-layout',
            err: err
        })
    })
})

module.exports = router