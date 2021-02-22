const pgp = require('pg-promise')()
const { pguser, pgpassword, pgport } = require('./config')

// const connection = 'postgres://caterinaturnbull:12345678@localhost:5432/mrcoffeeapp'

const connection = `postgres://${pguser}${pgpassword}@localhost:${pgport}/mrcoffeeapp`

const db = pgp(connection)

module.exports = db