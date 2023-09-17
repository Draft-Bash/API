exports.up = function (knex) {
    return knex.schema.createTable('nba_team', function (table) {
      table.integer('team_id').primary();
      table.string('team_abbreviation', 3).notNullable();
      table.string('team_name').notNullable();
      table.string('city_name').notNullable();
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('nba_team');
  };