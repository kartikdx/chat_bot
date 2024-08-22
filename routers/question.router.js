import express from 'express'
import { question } from '../controllers/questionController.js'
const router = express.Router();

router.post("/search", question);

export default router;