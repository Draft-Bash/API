exports.up = function (knex) {
    return knex.schema.table('draft_user', function (table) {
        table.dropColumn('is_autopick_on');
    });
  };
  
exports.down = function (knex) {
    return knex.schema.table('draft_user', function (table) {
        table.boolean('is_autopick_on').defaultTo(false);
    });
};
