import express from "express";
import { createDatabase, connectDatabase, disconnectDatabase, listDatabases , getDatabaseInfo} from "../controllers/Database.controller.js";
import AuthUser from "../middleware/AuthUser.js";
import { getDatabaseNaturalDescriptions } from '../controllers/DatabaseDiscription.controller.js';

const router = express.Router();

router.post("/create", AuthUser, createDatabase);
router.post("/connect", AuthUser, connectDatabase);
router.post("/disconnect", AuthUser, disconnectDatabase);
router.get("/list", AuthUser, listDatabases);
router.get('/db-info/:id', getDatabaseInfo);
router.get('/natural-descriptions', AuthUser,getDatabaseNaturalDescriptions);


export default router;