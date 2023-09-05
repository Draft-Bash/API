CREATE TABLE user_account (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE draft (
    draft_id SERIAL PRIMARY KEY,
    draft_type VARCHAR(255) DEFAULT 'snake',
    scoring_type VARCHAR(255) DEFAULT 'points',
    pick_time_seconds VARCHAR(255) DEFAULT 90,
    team_count SMALLINT DEFAULT 10,
    pointguard_slots SMALLINT DEFAULT 1,
    shootingguard_slots SMALLINT DEFAULT 1,
    guard_slots SMALLINT DEFAULT 1,
    smallforward_slots SMALLINT DEFAULT 1,
    powerforward_slots SMALLINT DEFAULT 1,
    forward_slots SMALLINT DEFAULT 1,
    center_slots SMALLINT DEFAULT 1,
    utility_slots SMALLINT DEFAULT 3,
    bench_slots SMALLINT DEFAULT 4,
    scheduled_by_user_id INT REFERENCES user_account(user_id) ON DELETE CASCADE
);

CREATE TABLE draft_pick (
    player_id INT REFERENCES nba_player(player_id),
    draft_id INT REFERENCES draft(draft_id),
    picked_by_user_id INT REFERENCES users(user_id),
    picked_by_bot_number SMALLINT,
    pick_number SMALLINT,
    PRIMARY KEY (player_id, draft_id)
)

CREATE TABLE draft_order (
    draft_order_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES user_account(user_id),
    draft_id INT NOT NULL REFERENCES draft(draft_id) ON DELETE CASCADE,
    bot_number SMALLINT,
    pick_number SMALLINT,
    is_picked BOOLEAN DEFAULT FALSE
);

CREATE TABLE nba_team (
    team_id INTEGER PRIMARY KEY,
    team_abbreviation CHAR(3) NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    city_name VARCHAR(255) NOT NULL
);

CREATE TABLE draft_user (
    user_id INT NOT NULL REFERENCES user_account(user_id),
    draft_id INT NOT NULL REFERENCES draft(draft_id) ON DELETE CASCADE
);

CREATE TABLE nba_player (
    player_id INTEGER PRIMARY KEY,
    player_age SMALLINT,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    is_pointguard BOOLEAN,
    is_shootingguard BOOLEAN,
    is_smallforward BOOLEAN,
    is_powerforward BOOLEAN,
    is_center BOOLEAN,
    team_id INT REFERENCES nba_team(team_id) ON DELETE SET NULL
);

CREATE TABLE points_draft_ranking (
    points_draft_ranking_id SERIAL PRIMARY KEY,
    rank_number SMALLINT NOT NULL,
    player_id INTEGER NOT NULL REFERENCES nba_player(player_id) ON DELETE CASCADE
);

CREATE TABLE nba_player_season_totals (
    player_season_id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES nba_player(player_id) ON DELETE CASCADE,
    season_name VARCHAR(255) NOT NULL,
    games_played SMALLINT,
    minutes_played SMALLINT,
    fieldgoals_made SMALLINT,
    fieldgoals_attempted SMALLINT,
    threes_made SMALLINT,
    threes_attempted SMALLINT,
    freethrows_made SMALLINT,
    freethrows_attempted SMALLINT,
    rebounds_total SMALLINT,
    assists_total SMALLINT,
    steals_total SMALLINT,
    blocks_total SMALLINT,
    turnovers_total SMALLINT,
    points_total SMALLINT
);