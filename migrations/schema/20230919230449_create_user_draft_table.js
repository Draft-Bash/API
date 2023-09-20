exports.up = function (knex) {
    return knex.schema.createTable('draft_user', function (table) {
      table.integer('user_id').notNullable().references('user_account.user_id');
      table.integer('draft_id').notNullable().references('draft.draft_id').onDelete('CASCADE');
      table.primary(['user_id', 'draft_id']);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('draft_user');
  };