DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS schedules;

CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY UNIQUE,
  surname VARCHAR(50) NOT NULL,
  firstname VARCHAR(50) NOT NULL,
  email VARCHAR(320) NOT NULL UNIQUE,
  password CHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS schedules (
  id serial PRIMARY KEY UNIQUE,
  id_user INT REFERENCES users(id) ON DELETE CASCADE,
  day SMALLINT NOT NULL CHECK (day >= 1 AND day <= 7),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL CHECK (end_time > start_time)
);
