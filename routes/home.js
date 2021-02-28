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

// get homepage
router.get('/', redirectLogin, (req, res) => {
    const daysOfWeek = req.app.locals.daysOfWeek

    db.any(`SELECT users.id, firstname, surname, day, TO_CHAR(start_time,'HH24:MI') start_time, TO_CHAR(end_time,'HH24:MI') end_time FROM users INNER JOIN schedules ON users.id = schedules.id_user ORDER BY surname ASC, day ASC, start_time ASC, end_time ASC`)
        .then((schedules) => {
            res.render('pages/index', {
                layout: 'layouts/profile-layout',
                title: 'All Schedules',
                schedules: schedules,
                daysOfWeek: daysOfWeek
            })
        })  
        .catch((err) => {
            res.render('pages/error', {
                layout: 'layouts/profile-layout',
                title: 'Error',
                err: err
            })
        })
})

module.exports = router