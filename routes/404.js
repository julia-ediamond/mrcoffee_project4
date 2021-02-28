const express = require('express')
const router = express.Router()

// 404 error
router.get('/', (req, res) => {
    res.status(404).render('pages/error', {
        layout: 'layouts/login-layout',
        title: 'Error',
        err: {
            message: 'This page does not exist'
        }
    })
})

module.exports = router