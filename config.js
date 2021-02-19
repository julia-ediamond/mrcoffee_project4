const dotenv = require('dotenv');
dotenv.config()
module.exports = {
  pguser: process.env.PGUSER,
  pgpassword: process.env.PGPASSWORD,
  pgport: process.env.PGPORT
}