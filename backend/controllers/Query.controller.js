import Database from "../models/Database.model.js";
import { executeQuery } from "../services/DatabaseService.js";
import axios from "axios";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Sequelize } from "sequelize";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const callGeminiAPI = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("❌ Gemini API error:", error.message);
    throw error;
  }
};


// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Cache schemas for multiple databases (keyed by databaseId)
const dbSchemaCache = {};

async function getDatabaseSchema(databaseId) {
  if (dbSchemaCache[databaseId]) {
    console.log("📦 Using cached DB schema for:", databaseId);
    return dbSchemaCache[databaseId];
  }

  try {
    const dbEntry = await Database.findByPk(databaseId);

    if (!dbEntry || !dbEntry.connectionURI) {
      throw new Error("Invalid database ID or missing connection URI.");
    }

    console.log("📡 Connecting to external DB:", dbEntry.databaseName);

    // Temporary Sequelize instance
    const tempSequelize = new Sequelize(dbEntry.connectionURI, {
      dialect: "postgres",
      logging: false,
    });

    const [tablesResult] = await tempSequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    const tables = tablesResult.map((row) => row.table_name);
    const schema = {};

    for (const table of tables) {
      const [columnsResult] = await tempSequelize.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = :table
      `, {
        replacements: { table },
      });

      schema[table] = columnsResult.map((row) => ({
        name: row.column_name,
        type: row.data_type,
      }));
    }

    dbSchemaCache[databaseId] = schema;
    console.log("✅ Fetched schema for", dbEntry.databaseName);
    return schema;
  } catch (error) {
    console.error("❌ Error fetching schema for DB ID:", databaseId, error.message);
    throw error;
  }
}

const FASTAPI_BASE_URL = "http://127.0.0.1:8000";

// ✅ Controller to process voice → SQL → DB
// Node.js Controller - processQuery
export const processQuery = async (req, res) => {
  try {
    console.log("🔍 Processing Gemini to SQL query...");
    const userId = req.user.id;
    const { databaseId } = req.params;
    const { transcript } = req.body;
    console.log("🗣️ Transcript:", transcript);

    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required." });
    }

    // Step 1: Check DB access
    const dbEntry = await Database.findOne({
      where: { id: databaseId, userId },
    });

    if (!dbEntry) {
      return res.status(403).json({ error: "You are not connected to this database." });
    }

    // Step 2: Get schema
    const schema = await getDatabaseSchema(databaseId);
    console.log("🔹 Database schema:", schema);

    if (!schema || typeof schema !== "object") {
      return res.status(400).json({ error: "Database schema not available or invalid." });
    }

    // Step 3: Extract table relationships
    const tables = Object.keys(schema);
    const relationships = {};

    for (const sourceTable of tables) {
      const columns = schema[sourceTable];
      for (const column of columns) {
        if (column.name.endsWith('_id')) {
          const potentialEntity = column.name.replace('_id', '');
          for (const targetTable of tables) {
            const singularTarget = targetTable.endsWith('s') ? targetTable.slice(0, -1) : targetTable;
            if (potentialEntity === targetTable || potentialEntity === singularTarget) {
              const relationKey = JSON.stringify([targetTable, sourceTable]);
              if (!relationships[relationKey]) {
                relationships[relationKey] = {
                  [`${targetTable}.id`]: `${sourceTable}.${column.name}`
                };
                console.log(`🔗 Found relationship: ${targetTable}.id -> ${sourceTable}.${column.name}`);
              }
            }
          }
        }
      }
    }

    console.log("🔹 Identified relationships:", relationships);

    // Step 4: Generate SQL using Gemini API directly
    const sqlPrompt = `
Given the following database schema and table relationships, generate an accurate SQL query from the user's request also make it feasible for any number of joins'

Schema:
${JSON.stringify(schema, null, 2)}
 
Relationships:
${JSON.stringify(relationships, null, 2)}

User query:
"${transcript}"

Only return the SQL query as plain text, without explanations or formatting.
    `;
    console.log(schema)
    console.log(relationships)
    const geminiQueryResponse = await callGeminiAPI(sqlPrompt);
    const sqlQuery = geminiQueryResponse.trim();

    console.log("🧠 Gemini SQL Output:", sqlQuery);

    // Step 5: Execute the generated SQL query
    const result = await executeQuery(dbEntry, sqlQuery);
    console.log(result)

    return res.status(200).json({
      success: true,
      sql: sqlQuery,
      data: result
    });

  } catch (error) {
    console.error("❌ Gemini SQL processing error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to generate SQL from Gemini." });
  }
};

export { getDatabaseSchema}
