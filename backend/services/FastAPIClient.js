import axios from "axios";

const FASTAPI_BASE_URL = process.env.FASTAPI_URL || "http://localhost:8000/process-query"; // Change as needed

/**
 * Converts a natural language query into an SQL query using FastAPI.
 * @param {string} naturalQuery - The user's natural language query.
 * @param {string} databaseName - The name of the target database.
 * @returns {Promise<string>} - The generated SQL query.
 */
export const convertToSQL = async (naturalQuery, databaseName) => {
    try {
        const response = await axios.post(`${FASTAPI_BASE_URL}/generate_sql`, {
            query: naturalQuery,
            database: databaseName,
        });

        if (response.data && response.data.sql) {
            console.log(`✅ NLP -> SQL Conversion Successful: ${response.data.sql}`);
            return response.data.sql;
        } else {
            throw new Error("Invalid response from FastAPI.");
        }
    } catch (error) {
        console.error("❌ FastAPI NLP Processing Error:", error.response?.data || error.message);
        throw new Error("Failed to generate SQL query.");
    }
};