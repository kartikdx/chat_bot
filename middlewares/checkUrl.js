import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the current file path in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the JSON data once at the beginning
const jsonFilePath = path.join(__dirname, "../AIChatbot", "scrapedData.json");
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

export const checkUrlMiddleware = (req, res, next) => {
  const { url } = req.body; // Assuming the URL is sent in the request body

  if (!url) {
    return res.status(400).json({ success: false, message: "URL is required." });
  }

  const isMatch = url === jsonData.url;

  // Send true or false based on the match
  if (isMatch) {
    console.log("URL match found.");
    return res.status(200).json({ success: true, message: "URL matches.", isMatch: true });
  } else {
    console.log("No URL match found.");
    next()
    // return res.status(200).json({ success: false, message: "URL does not match.", isMatch: false });
  }
};
