![contributor shield](https://img.shields.io/badge/Contributors-2-%23c24d89?style=for-the-badge) ![top language shield](https://img.shields.io/github/languages/top/cattrn/mrcoffee_project4?style=for-the-badge) ![license shield](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

# INCODE Project 4 - Mr Coffee Scheduling App

A pretend scheduling app for fictitous Paris cafe Mr. Coffee. This 2-person project was created for learning purposes through the INCO Academy bootcamp, INCODE.

## Contributors

<div style="display:flex; margin-bottom: 20px;">
<div>
<a href="https://github.com/cattrn" target="_blank"><img src="https://github.com/cattrn.png" style="width:100px; border-radius:50%; display:block;">
Caterina Turnbull</a>
</div>

<div style="margin-left:30px;">
<a href="https://github.com/julia-ediamond" target="_blank"><img src="https://github.com/julia-ediamond.png" style="width:100px; border-radius:50%; display:block;">
Iulia Sharnina</a>
</div>
</div>




## Installation

Download or clone the repo and run the following in the same folder.

```zsh
npm install
```

## Getting Started

1. Edit your .env file to suit your own Postgres settings, making sure to change your username, password, and port if need be.

2. Run the following scripts to create the database, create tables, and seed tables.

```zsh
npm run create-database
```

```zsh
npm run create-tables
```

```zsh
npm run seed-tables
```

## Contributing

Contributors limited to Iulia Sharnina and Cat Turnbull. As this is a learning project, pull requests generally won't be completed.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## FAQ

**The create-datbase, create-tables, and seed-tables scripts don't work.**

Assuming your Postgres is on and running, sometimes you may need to run the scripts as a specific user, with a specific password, or with a specific port. As a start, try altering the scripts in package.json to suit this format, explicitly identifying your own Postgres details. If this fails, first check that your details are correct, and then consult the [psql documentation](https://www.postgresql.org/docs/10/app-psql.html).

```json
psql -U username -h localhost -p portnumber -f filename.sql
```
## Acknowledgements

* Harry Aydin
* INCO Academy