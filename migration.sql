DROP TABLE IF EXISTS login CASCADE;
DROP TABLE IF EXISTS workout_plans CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS client_goals CASCADE;

CREATE TABLE login (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL, 
    password VARCHAR(50) NOT NULL,
    email VARCHAR(355) UNIQUE NOT NULL
);

CREATE TABLE workout_plans (
    id SERIAL PRIMARY KEY,
    plan VARCHAR
);

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    plan_week VARCHAR,
    current_squat INT,
    current_bench INT,
    current_deadlift INT,
    current_weight FLOAT,
    workout_plan_id INT,
        CONSTRAINT workout_plan_id
        FOREIGN KEY (workout_plan_id)
        REFERENCES workout_plans(id)
        ON DELETE CASCADE,
    login_id INT,
        CONSTRAINT login_id
        FOREIGN KEY (login_id)
        REFERENCES login(id)
        ON DELETE CASCADE
);

CREATE TABLE client_goals (
    id SERIAL PRIMARY KEY,
    squat INT,
    bench INT,
    deadlift INT,
    weight FLOAT,
    time DATE,
    client_id INT,
        CONSTRAINT client_id
        FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE CASCADE
);
