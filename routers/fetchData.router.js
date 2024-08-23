import express from 'express'
import { scrapeLinks } from '../controllers/fetchData.js'
// import { checkUrlMiddleware } from '../middlewares/checkUrl.js';
const router = express.Router();

router.post("/scrape", scrapeLinks);

export default router;