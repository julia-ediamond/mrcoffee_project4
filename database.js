const pgp = require('pg-promise')()

// const connection = 'postgres://caterinaturnbull:12345678@localhost:5432/mrcoffeeapp'

const connection = 'postgres://PGUSER:PGPASSWORD@localhost:PGPORT/mrcoffeeapp'

const db = pgp(connection)

module.exports = db