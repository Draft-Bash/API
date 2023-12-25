exports.up = function (knex) {
    return knex.schema.table('draft_user', function (table) {
      // Add the new boolean column with a default value of false
      table.boolean('is_autopick_on').defaultTo(false);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.table('draft_user', function (table) {
      // Drop the new column if needed (reverse of the 'up' operation)
      table.dropColumn('is_autopick_on');
    });
  };