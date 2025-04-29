import Database from "../models/Database.model.js";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDatabaseSchema } from "./Query.controller.js"; // Assuming this is exported

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get natural language descriptions of all databases for the current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Natural language descriptions of all user databases
 */
export const getDatabaseNaturalDescriptions = async (req, res) => {
    try {
      console.log("🔍 Generating natural language descriptions for user databases...");
      const userId = req.user.id;
      
      // Get all databases for the current user - removed dbType from attributes
      const databases = await Database.findAll({
        where: { userId },
        attributes: ['id', 'databaseName',  'connectionURI']
      });
  
      if (!databases || databases.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No databases found for this user",
          databases: []
        });
      }
  
      // Process each database to get schema and natural language description
      const databaseDescriptions = await Promise.all(databases.map(async (database) => {
        try {
          // Get schema for each database
          const schema = await getDatabaseSchema(database.id);
          
          if (!schema || typeof schema !== "object") {
            return {
              id: database.id,
              name: database.databaseName,
              // Remove or replace type with a default value
              type: "database", // default value or you can omit this field completely
            //   description: database.description || "No description available",
              naturalDescription: "Could not generate schema information for this database",
              error: "Invalid schema"
            };
          }
          
         
        // Extract relationships between tables
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
                  }
                }
              }
            }
          }
        }

        // Generate natural language description using LLM
        const prompt = `
        Generate a natural language description of this database schema:
        
        Database Name: ${database.databaseName}
        
        Schema:
        ${JSON.stringify(schema, null, 2)}
        
        Relationships:
        ${JSON.stringify(relationships, null, 2)}
        
        Rules:
        1. Describe the database structure in clear, non-technical language that a business user would understand
        2. Explain what kind of data is stored in this database
        3. Mention important tables and their relationships
        4. Suggest 3-5 example questions that could be asked of this database
        5. Keep the description under 300 words
        6. Format your response in this JSON structure:
        {
          "summary": "Brief 1-2 sentence overview",
          "tableDescriptions": {
            "tableName": "description of table purpose and important columns",
            ...
          },
          "relationships": "Description of how tables relate to each other",
          "exampleQueries": [
            "Example question 1",
            "Example question 2",
            ...
          ]
        }
      `;
        const geminiResponse = await callGeminiAPI(prompt);
        let naturalDescription;
        
        try {
          // Extract JSON from the response
          const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
          naturalDescription = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
          
          if (!naturalDescription) {
            throw new Error("Failed to parse natural description");
          }
        } catch (error) {
          console.warn(`Failed to parse description for database ${database.id}:`, error.message);
          naturalDescription = {
            summary: "Database schema available but description generation failed",
            tableDescriptions: {},
            relationships: "Could not generate relationship descriptions",
            exampleQueries: ["What tables are in this database?"]
          };
        }
        
        return {
            id: database.id,
            name: database.databaseName,
            // Remove or replace type with a default value
            type: "database", // default value or you can omit this field
            // userDescription: database.description || "",
            naturalDescription,
            tableCount: tables.length,
            tables: tables, // Include table names for frontend reference
            hasSchema: true
          };
        } catch (error) {
          console.error(`Error processing database ${database.id}:`, error);
          return {
            id: database.id,
            name: database.databaseName,
            // Remove or replace type with a default value
            type: "database", // default value or you can omit this field
            // userDescription: database.description || "",
            naturalDescription: {
              summary: "Could not analyze this database",
              tableDescriptions: {},
              relationships: "No information available",
              exampleQueries: ["Is this database connected properly?"]
            },
            tableCount: 0,
            tables: [],
            hasSchema: false,
            error: error.message
          };
        }
      }));
  
      return res.status(200).json({
        success: true,
        databases: databaseDescriptions
      });
  
    } catch (error) {
      console.error("❌ Error generating database descriptions:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to generate database descriptions",
        error: error.message
      });
    }
  };
  async function callGeminiAPI(prompt) {
    try {
      const modelName = "gemini-1.5-flash";
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });
      
      return result.response.text();
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error("Failed to generate mappings with Gemini API");
    }
  }