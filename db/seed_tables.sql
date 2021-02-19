-- Seed users table
INSERT INTO users(surname, firstname, email, password)
VALUES ('Smith', 'John', 'pretend@email.com', 'b6b7fb4cad4bc020f76e16889a8e9065cb708d0f8c304a8a3db609b644da9536');

INSERT INTO users(surname, firstname, email, password)
VALUES ('Sue', 'Mary', 'mary@sue.com', 'a836ebba36776b21dd0f5cdca497bff65c5bdfc8411cfbfe0111f27bde1c1894');

INSERT INTO users(surname, firstname, email, password)
VALUES ('Bond', 'James', 'james.bond@gmail.com', '3b5fe14857124335bb8832cc602f8edcfa12db42be36b135bef5bca47e3f2b9c');

-- Seed schedules table
INSERT INTO schedules(ID_user, day, start_time, end_time)
VALUES (1, 1,'2021-03-09 14:00:00', '2021-03-09 16:00:00');

INSERT INTO schedules(ID_user, day, start_time, end_time)
VALUES (1, 2, '2021-03-09 14:00:00', '2021-03-09 16:00:00');

INSERT INTO schedules(ID_user, day, start_time, end_time)
VALUES (3, 4, '2021-03-09 08:00:00', '2021-03-09 18:00:00');