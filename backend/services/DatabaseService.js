import { Sequelize } from "sequelize";

/**
 * Executes an SQL query on a user-selected database.
 * @param {Object} dbEntry - The database entry from the Database model.
 * @param {string} sqlQuery - The SQL query to execute.
 * @returns {Promise<Object>} - Query result.
 */
export const executeQuery = async (dbEntry, sqlQuery) => {
    let sequelize;
    try {
        // 🔹 Step 1: Establish a dynamic database connection
        if (dbEntry.connectionURI) {
            // ✅ Use connection URI if provided (e.g., cloud databases)
            sequelize = new Sequelize(dbEntry.connectionURI, {
                dialect: "postgres",
                logging: false,
            });
        } else {
            // ✅ Use manual credentials for local/private databases
            sequelize = new Sequelize({
                dialect: "postgres",
                host: dbEntry.host || "localhost",
                port: dbEntry.port || 5432,
                username: dbEntry.username,
                password: dbEntry.password,
                database: dbEntry.databaseName,
                logging: false,
            });
        }

        console.log(`✅ Connected to database: ${dbEntry.databaseName || "via URI"}`);

        // 🔹 Step 2: Execute the SQL query
        const [results, metadata] = await sequelize.query(sqlQuery);

        console.log("✅ Query executed successfully.");

        // // 🔹 Step 3: Close the connection after execution
        // await sequelize.close();
        // console.log("🔌 Database connection closed.");

        return results; // Return query results

    } catch (error) {
        console.error("❌ Database query execution error:", error);
        throw new Error("Failed to execute query.");
    }
};