import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Ensure the upload directory exists
// Create __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File to store the last numeric part (acts as a persistent storage for the counter)
const counterFile = path.join(__dirname, "counter.txt");

// Generate a random alphanumeric prefix (7 characters long)
const generatePrefix = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let prefix = "";
    for (let i = 0; i < 7; i++) {
        prefix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix;
};

// Increment the numeric part
const getNextCode = async () => {
    try {
        // Check if the counter file exists
        if (!fs.existsSync(counterFile)) {
            fs.writeFileSync(counterFile, "100"); // Initialize the counter
        }

        // Read the current counter value
        let counter = parseInt(fs.readFileSync(counterFile, "utf8"), 10);

        // Increment the counter
        counter++;

        // Save the updated counter back to the file
        fs.writeFileSync(counterFile, counter.toString());

        // Generate the full code
        const prefix = generatePrefix();
        return `${prefix}${counter}`;
    } catch (error) {
        console.error("Error generating code:", error);
        throw error;
    }
};

export default {
    getNextCode,
  };