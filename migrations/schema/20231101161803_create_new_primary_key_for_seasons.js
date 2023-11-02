exports.up = function(knex) {
  return knex.schema.alterTable("nba_player_season_totals", function(table) {
      // Drop the player_season_id column if it exists
      table.dropColumn("player_season_id");

      // Create a new primary key using player_id and season_name
      table.primary(["player_id", "season_name"]);
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable("nba_player_season_totals", function(table) {
      // Recreate the player_season_id column without making it the primary key
      table.dropPrimary();
      table.integer("player_season_id").notNullable().defaultTo(0);

      // Replace null values in the player_season_id column
      knex("nba_player_season_totals")
          .whereNull("player_season_id")
          .update("player_season_id", 0);
  });
};