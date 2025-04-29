import express from 'express';
import { handleBusinessChat } from '../controllers/ChatBot.controller.js';

const router = express.Router();

router.post('/business-chat', handleBusinessChat);

export default router;