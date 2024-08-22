import express from 'express'
import * as cheerio from 'cheerio';
import cors from 'cors';
import fs from 'fs';
// import readline from 'readline';
// import bodyParser from 'body-parser';
// import axios from 'axios';
// import path from 'path';
import dotenv from 'dotenv';
import fetchDataRoute from './routers/fetchData.router.js';
import questionRoute from './routers/question.router.js';
dotenv.config();

const port = 8000;

const app = express();
app.use(express.json());
// app.use(express.json({ limit: '50mb' }));
app.use(cors());

app.use('/api',fetchDataRoute);
app.use('/api/query', questionRoute)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});