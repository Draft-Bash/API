# Folder structure
The migrations folder contains the database migrations (That is, schema versions) and seed. The seed
is run with npx knex seed:run. It seeds your database with data such as players, teams, etc.

nbaData contains the CSV files that are used to seed the database.

The seeds folder contains the functions for seeding the database. These functions are executed when the seed1.js script
in the migration's folder seed folder is executed with npx knex seed:run

src contains the source code for the project. It contains the websocket, app.ts (entry point), database connecton in db.ts,
the controllers, models, routes and utils. The controlls, models, and routes are explained in DesignPattern.md.

The utils folder contains utility scripts for things like email, generating the draft order, fetching data, etc.

