exports.up = function(knex) {
	return knex.schema.createTable("nba_player_projections", function (table) {
	  table.integer("player_id").unsigned().notNullable();
	  table.integer("points_total");
	  table.integer("rebounds_total");
	  table.integer("assists_total");
	  table.integer("blocks_total");
	  table.integer("steals_total");
	  table.float("fieldgoal_percentage");
	  table.float("freethrow_percentage");
	  table.integer("threepointers_total");
	  table.integer("games_played");
	  table.integer("minutes_played");
	  table.integer("turnovers_total");
	  table.primary(["player_id"]);
	  table.foreign("player_id").references("nba_player.player_id").onDelete('CASCADE'); // Adding onDelete('CASCADE') for the foreign key constraint
	});
  };
  
  exports.down = function(knex) {
	return knex.schema.dropTable("nba_player_projections");
  };