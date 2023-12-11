# Individual Developer Process & Configuration

### Environment Setup
- Code written primarily in Typescript.
1. Before cloning the repository, make sure you have Postgresql downloaded on your local machine.
2. After cloning, switch test branch by running 'git checkout -b test origin/test'.
3. Run 'npm install' to install the dependencies.
4. When developing a feature, make your own branch by running 'git checkout -b name-of-feature-branch'
5. After cloning the repository, run 'npm install' to install the dependencies.
6. (Server repository) Once you clone the server repository, add a .env file to the root folder with these variables:
    DB_HOST=localhost
    DB_NAME=yourPostgresqlDBName
    DB_USER=yourPostgresqlUsername
    DB_PASSWORD=yourPostgresqlPassword
    DB_PORT=5432
    SSL=false
    JWT_SECRET=anyStringWillDo
    API_URL=http://localhost:3000/api/v1
    CLIENT_URL=http://localhost:5173
7. (Server repository) To seed the database with data, run 'npx knex seed:run' only once.
8. Run 'npm run dev' to start the server on localhost:3000 with hot reload. It will automatically run the database migrations for you
9. Any changes to the database schema must be through knex.js. To create a migration, run 'npx knex migrate:make migration_name'.
   After running the command, a new file will be added to the schema folder in the migrations folder. Go to it and add the neccessary up/down migration code. Research online the syntax for doing this with knex.js
11. (Client repository) Clone the Client repository.
12. After cloning, switch test branch by running 'git checkout -b test origin/test'.
13. When developing a feature, make your own branch by running 'git checkout -b name-of-feature-branch'
14. Run 'npm install' to install the dependencies.
15. Add a .env file to the root folder with these variables:
    VITE_API_URL=http://localhost:3000/api/v1
    VITE_SERVER_URL=http://localhost:3000
16. While the server-side code is running on localhost:3000, run 'npm run dev' to start the frontend with hot reload
17. The frontend is now on localhost:5173. To see it, add locahost:5173 in your browser's search URL.