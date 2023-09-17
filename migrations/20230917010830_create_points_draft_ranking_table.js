exports.up = function (knex) {
    return knex.schema.createTable('points_draft_ranking', function (table) {
      table.increments('points_draft_ranking_id').primary();
      table.smallint('rank_number').notNullable();
      table.integer('player_id').unique().notNullable().references('player_id').inTable('nba_player').onDelete('CASCADE');
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('points_draft_ranking');
  };
