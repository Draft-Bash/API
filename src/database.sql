CREATE TABLE user_account (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255), NOT NULL UNIQUE
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
);