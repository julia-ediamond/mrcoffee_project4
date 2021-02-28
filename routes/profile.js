const express = require('express')
const router = express.Router()
const db = require('../database')

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/login')
    } else {
        next()
    }
}

// get any profile
router.get('/:id(\\d+)/', redirectLogin, (req, res) => {
    const daysOfWeek = req.app.locals.daysOfWeek

    db.any(`SELECT users.id, firstname, surname, email, day, TO_CHAR(start_time, 'HH24:MI') start_time, TO_CHAR(end_time, 'HH24:MI') end_time FROM users LEFT JOIN schedules ON users.id = schedules.id_user WHERE users.id = $1`, [req.params.id])
        .then((combinedData) => {
            if (combinedData.length > 0) {
                res.render('pages/profile', {
                    layout: './layouts/profile-layout',
                    title: 'Profile',
                    firstname: combinedData[0].firstname,
                    lastname: combinedData[0].surname,
                    email: combinedData[0].email,
                    schedules: combinedData,
                    daysOfWeek: daysOfWeek
                })
            } else {
                return res.render('pages/error', {
                    layout: './layouts/profile-layout',
                    title: 'Error',
                    err: {
                        message: 'No such user ID.'
                    }
                })
            }
        })
        .catch((err) => {
            res.render('pages/error', {
                layout: './layouts/profile-layout',
                title: 'Error',
                err: err
            })
        })
})

// get current user profile
router.get('/', redirectLogin, (req, res) => {
    const daysOfWeek = req.app.locals.daysOfWeek

    db.any(`SELECT users.id, firstname, surname, email, day, TO_CHAR(start_time, 'HH24:MI') start_time, TO_CHAR(end_time, 'HH24:MI') end_time FROM users LEFT JOIN schedules ON users.id = schedules.id_user WHERE users.id = $1`, [req.session.userId])
        .then((combinedData) => {
            res.render('pages/profile', {
                layout: './layouts/profile-layout',
                title: 'Profile',
                firstname: combinedData[0].firstname,
                lastname: combinedData[0].surname,
                email: combinedData[0].email,
                schedules: combinedData,
                daysOfWeek: daysOfWeek
            })
        })
        .catch((err) => {
            res.render('pages/error', {
                layout: './layouts/profile-layout',
                title: 'Error',
                err: err
            })
        })
})

module.exports = router