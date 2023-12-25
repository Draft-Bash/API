exports.up = function (knex) {
    return knex.schema.createTable('pick_queue', function (table) {
            table.integer('user_id').unsigned().references('user_id').inTable('user_account');
            table.integer('draft_id').unsigned().references('draft_id').inTable('draft');
            table.integer('player_id').unsigned().references('player_id').inTable('nba_player');
            table.smallint('rank');
            table.primary(['user_id', 'player_id', 'draft_id']);
        });
    };
      
exports.down = function (knex) {
    return knex.schema.dropTable('pick_queue');
};