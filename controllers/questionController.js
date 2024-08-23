import fs from "fs";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const summarizeData = (dataObject) => {
    // Implement summarization logic here
    // For example, truncate text fields or remove unnecessary information
    // This is just a placeholder example
    const { ipAddress, paragraphs } = dataObject;
    const summarizedParagraphs = paragraphs.slice(0, 10); // Keep only the first 10 paragraphs
    return { ipAddress, paragraphs: summarizedParagraphs };
  };

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  temperature: 0,
  maxRetries: 2,
  apiKey: process.env.GOOGLE_API_KEY,
});

export const question = async (req, res) => {
  try {
    const { question } = req.body;

    fs.readFile("AIChatbotFile/scrapedData.json", "utf-8", async (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send("An error occurred while reading the file.");
      }

      const dataObject = await JSON.parse(data);
    const summarizedData = summarizeData(dataObject);

    //   const ipAddress = dataObject.ipAddress;
      //   console.log(ipAddress);

      // Convert the data object to a string
      const dataString = JSON.stringify(summarizedData);

      // Construct the prompt using the provided data and question
      const aiMsg = await llm.invoke([
        ["system", dataString],
        ["human", question],
      ]);

    //   console.log(aiMsg.content);
      res.send(aiMsg.content)
    });
  } catch (error) {
    console.log(error);
  }
};
