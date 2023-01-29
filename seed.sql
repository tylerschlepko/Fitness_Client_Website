INSERT INTO login (username, password, email)
VALUES ('tschlepko', '1qaz2wsx', 'tylerschlepko@gmail.com');

INSERT INTO workout_plans (plan)
VALUES ('Strength Plan');

INSERT INTO clients (first_name, last_name, plan_week, current_squat, current_bench, current_deadlift, current_weight, workout_plan_id, login_id)
VALUES ('Tyler', 'Schlepko', 6, 405, 315, 495, 225, 1, 1);

INSERT INTO client_goals (squat, bench, deadlift, weight, time, client_id)
VALUES (445, 335, 515, 220, '2023-02-01', 1);