// express setup
const express = require('express')
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// postgres setup
// const db = require('./database')

// static files
app.use(express.static('public'))

// port
const port = 3000

// ejs template engine
app.set('views', './views')
app.set('view engine', 'ejs')