import { DataTypes } from "sequelize";
import sequelize from "../config/Database.config.js";
import User from "./User.model.js";

const Database = sequelize.define("Database", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    databaseName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    connectionURI: {
        type: DataTypes.STRING, // Used for cloud DB connections
        allowNull: true,
    },
    role: {
        type: DataTypes.ENUM("owner", "read-only"),
        allowNull: false,
        defaultValue: "read-only", // By default, a connected database is read-only
    }
});

User.hasMany(Database, { foreignKey: "userId", onDelete: "CASCADE" });
Database.belongsTo(User, { foreignKey: "userId" });

export default Database; 