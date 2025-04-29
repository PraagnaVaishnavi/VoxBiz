import express from "express";
import { processQuery } from "../controllers/Query.controller.js";
import AuthUser from "../middleware/AuthUser.js";

const router = express.Router();

router.post("/process/:databaseId", AuthUser, processQuery);

export default router;