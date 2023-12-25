exports.up = function(knex) {
    return knex.schema.createTable('nba_player_news', function(table) {
      table.integer('player_id').unsigned().notNullable();
      table.integer('rotowire_id');
      table.string('title');
      table.text('summary');
      table.text('analysis');
      table.date('news_date');
      table.string('injury_status');
      table.text('fantasy_outlook');
      table.primary('player_id');
      table.foreign('player_id').references('nba_player.player_id');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('nba_player_news');
  };