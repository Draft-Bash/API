exports.up = function (knex) {
    return knex.schema.createTable('nba_player', function (table) {
      table.increments('player_id').primary();
      table.smallint('player_age');
      table.string('first_name', 255);
      table.string('last_name', 255);
      table.boolean('is_pointguard');
      table.boolean('is_shootingguard');
      table.boolean('is_smallforward');
      table.boolean('is_powerforward');
      table.boolean('is_center');
      table.integer('team_id').unsigned().references('team_id').inTable('nba_team').onDelete('SET NULL');
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('nba_player');
  };