import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Check if a connection string is provided (for cloud DBs)
const isUsingConnectionString = process.env.DATABASE_URL ? true : false;
console.log("Database Password:", process.env.DB_PASSWORD);
// Create Sequelize instance
const sequelize = isUsingConnectionString
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Allow self-signed certificates (for some cloud DBs)
        },
      },
      logging: false, // Disable SQL query logs
    })
  : new Sequelize(
      process.env.DB_NAME, // Database name
      process.env.DB_USER, // Username
      process.env.DB_PASSWORD, // Password
      {
        host: process.env.DB_HOST, // Hostname (localhost or remote)
        port: process.env.DB_PORT, // PostgreSQL port (default 5432)
        dialect: "postgres",
        logging: false, // Disable SQL query logs
      }
    );

// Function to test DB connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected successfully!");
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error);
  }
};

// Run the test connection
testConnection();

export default sequelize;