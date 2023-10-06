exports.up = function (knex) {
    return knex.schema.table('draft_user', function (table) {
        table.boolean('is_invite_read').defaultTo(false);
        table.boolean('is_invite_accepted').defaultTo(false);
    });
};
  
exports.down = function (knex) {
    return knex.schema.table('draft_user', function (table) {
        // Drop the new column if needed (reverse of the 'up' operation)
        table.dropColumn('is_invite_read');
        table.dropColumn('is_invite_accepted');
    });
};
