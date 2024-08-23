import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const visitedUrls = new Set(); // To keep track of visited URLs

// Helper function to fetch all links from a given URL
async function getLinks(url) {
  try {
    // console.log(`Fetching data from URL: ${url}`);
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const links = [];
    const baseURL = url;

    $("a").each((index, element) => {
      let link = $(element).attr("href");
      if (link) {
        try {
          // Check if link is relative or absolute
          if (!link.startsWith("http") && !link.startsWith("https")) {
            link = new URL(link, url).href; // Resolve relative URL
          }
          // Filter out unsupported protocols
          if (!link.startsWith("#") && !link.startsWith("mailto:") && !link.startsWith("tel:") && link.startsWith(baseURL)) {
            links.push(link); // Push valid links
          }
        } catch (error) {
          console.error(`Error resolving URL (${link}): ${error.message}`);
        }
      }
    });

    return links;
  } catch (error) {
    console.error(`Error fetching URL: ${error.message}`);
    return [];
  }
}

// Function to perform retry with delay
async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url);
    } catch (error) {
      if (i < retries - 1) {
        console.error(`Retrying fetch for URL ${url}. Attempt ${i + 2}`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error(`Failed to fetch URL ${url} after ${retries} attempts`);
        throw error;
      }
    }
  }
}

export const scrapeLinks = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const ipResponse = await axios.get("https://api.ipify.org/?format=json");
    const ipAddress = ipResponse.data.ip;

    const aiChatbotDir = path.join(__dirname, "../AIChatbot");
    if (!fs.existsSync(aiChatbotDir)) {
      fs.mkdirSync(aiChatbotDir);
    }

    const aggregatedFilePath = path.join(aiChatbotDir, "scrapedData.json");

    const paragraphs = [];
    const pendingUrls = [url];

    while (pendingUrls.length > 0) {
      const currentUrl = pendingUrls.pop();

      if (visitedUrls.has(currentUrl)) {
        continue; // Skip already visited URLs
      }
      visitedUrls.add(currentUrl);

      try {
        const response = await fetchWithRetry(currentUrl);
        const html = response.data;
        const $ = cheerio.load(html);

        $("body")
          .find("p, span, div, li, h1, h2, h3, h4, h5, h6, a")
          .each((idx, element) => {
            const text = $(element).text().trim();
            if (text) {
              paragraphs.push(text); // Add to the main paragraphs array
            }
          });

        // Get all the links from the current page
        const links = await getLinks(currentUrl);
        for (const link of links) {
          if (!visitedUrls.has(link)) {
            pendingUrls.push(link);
          }
        }
      } catch (error) {
        console.error(`Error fetching page (${currentUrl}): ${error.message}`);
      }
    }

    console.log(visitedUrls,"pendingUrls")

    if (paragraphs.length === 0) {
      return res.status(404).json({ message: "No content found to save" });
    }

    // Write the data to the JSON file
    const fileData = {
      url,
      ipAddress,
      filePath: aggregatedFilePath,
      paragraphs,
      createdAt: new Date(),
    };
    fs.writeFileSync(aggregatedFilePath, JSON.stringify(fileData, null, 2));

    res.json({
      message: "Data saved successfully",
      filePath: aggregatedFilePath,
      paragraphs,
      ipAddress,
      isMatch: false
    });
  } catch (error) {
    console.error("Error fetching the URL:", error);
    res.status(500).json({ error: "Failed to fetch the URL" });
  }
};