exports.up = function (knex) {
    return knex.schema.table('draft_order', function (table) {
        table.dropColumn('is_picked');
    });
  };
  
exports.down = function (knex) {
    return knex.schema.table('draft_order', function (table) {
        table.boolean('is_picked').defaultTo(false);
    });
};