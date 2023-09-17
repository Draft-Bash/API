exports.up = function (knex) {
    return knex.schema.createTable('nba_player_season_totals', function (table) {
      table.increments('player_season_id').primary();
      table.integer('player_id').notNullable().references('player_id').inTable('nba_player').onDelete('CASCADE');
      table.string('season_name', 255).notNullable();
      table.smallint('games_played');
      table.smallint('minutes_played');
      table.smallint('fieldgoals_made');
      table.smallint('fieldgoals_attempted');
      table.smallint('threes_made');
      table.smallint('threes_attempted');
      table.smallint('freethrows_made');
      table.smallint('freethrows_attempted');
      table.smallint('rebounds_total');
      table.smallint('assists_total');
      table.smallint('steals_total');
      table.smallint('blocks_total');
      table.smallint('turnovers_total');
      table.smallint('points_total');
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('nba_player_season_totals');
  };