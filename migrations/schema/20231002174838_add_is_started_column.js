exports.up = function (knex) {
    return knex.schema.table('draft', function (table) {
        // Add the new boolean column with a default value of false
        table.boolean('is_started').defaultTo(false);
    });
};
  
exports.down = function (knex) {
    return knex.schema.table('draft', function (table) {
        // Drop the new column if needed (reverse of the 'up' operation)
        table.dropColumn('is_started');
    });
};