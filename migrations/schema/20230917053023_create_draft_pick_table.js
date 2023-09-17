exports.up = function (knex) {
    return knex.schema.createTable('draft_pick', function (table) {
      table.integer('player_id').references('player_id').inTable('nba_player');
      table.integer('draft_id').references('draft_id').inTable('draft');
      table.integer('picked_by_user_id').references('user_id').inTable('user_account');
      table.smallint('picked_by_bot_number');
      table.smallint('pick_number');
      table.primary(['player_id', 'draft_id']);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('draft_pick');
  };
