const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

/** @type {Record<string, Knex.Config>} */
const knexConfig = {
  client: 'pg', // Change to 'mysql2' or 'sqlite3' if needed
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'mydb',
  },
  migrations: {
    directory: './src/database/migrations',
    tableName: 'knex_migrations',
  },
};

export default knexConfig;
