exports.up = function (knex) {
    return knex.schema.createTable('draft_user', function (table) {
      table.integer('user_id').notNullable().references('user_id').inTable('user_account');
      table.integer('draft_id').notNullable().references('draft_id').inTable('draft').onDelete('CASCADE');
      table.primary(['user_id', 'draft_id']);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('draft_user');
  };