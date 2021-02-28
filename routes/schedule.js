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

//get schedule management page
//TO_CHAR() function converts a timestamp, an interval, an integer, a double precision, or a numeric value to a string
//TO_CHAR(expression, format)
router.get('/', redirectLogin, (req, res) => {
    const daysOfWeek = req.app.locals.daysOfWeek

    db.any(`SELECT day, TO_CHAR(start_time,'HH24:MI') start_time, TO_CHAR(end_time,'HH24:MI') end_time FROM schedules WHERE id_user = $1;`, [req.session.userId])
        .then((schedules) => {
            res.render('pages/schedule', {
                layout: './layouts/profile-layout',
                title: 'Schedule',
                schedules: schedules,
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


//post schedule
//the format we need HH24 and MI
//TO_TIMESTAMP converts char of CHAR, VARCHAR2, NCHAR, or NVARCHAR2 datatype to a value of TIMESTAMP datatype.
router.post('/', redirectLogin, (req, res) => {
    const daysOfWeek = req.app.locals.daysOfWeek

    let dayValid = daysOfWeek.slice(1).includes(daysOfWeek[req.body.day])
    let startValid = /^(([0-1][0-9])|(2[0-3])):[0-5][0-9]$/.test(req.body.start_time)
    let endValid = /^(([0-1][0-9])|(2[0-3])):[0-5][0-9]$/.test(req.body.end_time)

    if (dayValid && startValid && endValid) {
        if (Number(req.body.end_time.replace(':', '')) > Number(req.body.start_time.replace(':', ''))) {
            db.query(`INSERT INTO schedules (id_user, day, start_time, end_time) 
            VALUES ($1, $2, TO_TIMESTAMP($3,'HH24:MI'), TO_TIMESTAMP($4,'HH24:MI'))`, [req.session.userId, req.body.day, req.body.start_time, req.body.end_time])
                .then((schedules) => {
                    return res.redirect('schedule')
                })
                .catch((err) => {
                    return res.render('pages/error', {
                        layout: './layouts/profile-layout',
                        err: err
                    })
                })
        } else {
            res.render('pages/error', {
                layout: './layouts/profile-layout',
                err: {
                    message: 'End time must be later than the start time.'
                }
            })
        }
    } else {
        res.render('pages/error', {
            layout: './layouts/profile-layout',
            err: {
                message: 'Inputs were not valid, please try again.'
            }
        })
    }
})

// TODO: delete personal schedules
// app.delete('/schedule', redirectLogin, (req, res) => {
//     db.query('DELETE FROM schedules WHERE id = 6', (error, results) => {
//         if (error) {
//             return res.render('pages/error', {
//                 layouts: './layouts/profile-layout',
//                 err: {
//                     message: 'There was an error deleting your schedule.'
//                 }
//             })
//         }
//         console.log(results)
//         res.status(200).redirect('/schedule')
//     })
// })

module.exports = router