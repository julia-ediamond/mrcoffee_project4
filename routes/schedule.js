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

// get schedule management page
router.get('/', redirectLogin, (req, res) => {
    const daysOfWeek = req.app.locals.daysOfWeek
    let message = req.query.message

    db.any(`SELECT id, day, TO_CHAR(start_time,'HH24:MI') start_time, TO_CHAR(end_time,'HH24:MI') end_time FROM schedules WHERE id_user = $1 ORDER BY day ASC, start_time ASC, end_time ASC`, [req.session.userId])
        .then((schedules) => {
            res.render('pages/schedule', {
                layout: './layouts/profile-layout',
                title: 'Schedule',
                schedules: schedules,
                daysOfWeek: daysOfWeek,
                message: message
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


// post schedule
router.post('/', redirectLogin, (req, res) => {
    const daysOfWeek = req.app.locals.daysOfWeek

    let dayValid = daysOfWeek.slice(1).includes(daysOfWeek[req.body.day])
    let startValid = /^(([0-1][0-9])|(2[0-3])):[0-5][0-9]$/.test(req.body.start_time)
    let endValid = /^(([0-1][0-9])|(2[0-3])):[0-5][0-9]$/.test(req.body.end_time)
    let overlap = false

    
    // check if all three fields are formatted correctly
    if (dayValid && startValid && endValid) {

        // check if the end time is later than the start time
        if (Number(req.body.end_time.replace(':', '')) > Number(req.body.start_time.replace(':', ''))) {

            // check database for overlapping times
            db.any(`SELECT id_user, day, TO_CHAR(start_time, 'HH24:MI') start_time, TO_CHAR(end_time, 'HH24:MI') end_time FROM schedules WHERE id_user = $1 AND day = $2`, [req.session.userId, req.body.day])
            .then((schedules) => {
                for (i = 0; i < schedules.length; i++) {
                    if (
                        ((req.body.start_time >= schedules[i].start_time) && (req.body.start_time < schedules[i].end_time)) ||
                        ((req.body.end_time <= schedules[i].end_time) && (req.body.end_time > schedules[i].start_time)) ||
                        ((req.body.start_time < schedules[i].start_time) && (req.body.end_time > schedules[i].end_time))
                    ) {
                        return overlap = true
                    }
                }
            })
            .then(() => {
                if (overlap === false) {

                    // insert into database
                    db.none(`INSERT INTO schedules (id_user, day, start_time, end_time) 
                    VALUES ($1, $2, TO_TIMESTAMP($3,'HH24:MI'), TO_TIMESTAMP($4,'HH24:MI'))`, [req.session.userId, req.body.day, req.body.start_time, req.body.end_time])
                    .then((schedules) => {
                        return res.redirect('/schedule?message=New%20schedule%20created.')
                    })
                    .catch((err) => {
                        return res.render('pages/error', {
                            layout: './layouts/profile-layout',
                            title: 'Error',
                            err: err
                        })
                    })
                } else {
                    res.redirect('/schedule?message=You%20have%20an%20existing%20schedule%20at%20that%20time.')
                }
            })
            .catch((err) => {
                res.render('pages/error', {
                    layout: './layouts/profile-layout',
                    title: 'Error',
                    err: err
                })
            })      
        } else {
            res.redirect('/schedule?message=End%20time%20must%20be%20later%20than%20the%20start%20time.')
        }
    } else {
        res.redirect('/schedule?message=Inputs%20were%20not%20valid,%20please%20try%20again.')
    }
})

// delete personal schedules
router.post('/delete', redirectLogin, (req, res) => {

    if (req.query.scheduleid) {
        db.none(`DELETE FROM schedules WHERE id = $1 AND id_user = $2`, [req.query.scheduleid, req.session.userId])
        .then(() => {
            res.redirect('/schedule?message=Schedule%20deleted.')
        })
        .catch((err) => {
            res.render('pages/error', {
                layout: './layouts/profile-layout',
                title: 'Error',
                err: err
            })
        })
    } else {
        res.render('pages/error', {
            layouts: './layouts/profile-layout',
            title: 'Error',
            err: {
                message: 'There is no schedule ID associated with your delete request.'
            }
        })
    }
})

module.exports = router