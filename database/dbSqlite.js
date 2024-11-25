import { Database } from "bun:sqlite";
import path from "path";
import fs from "fs";
import { execute } from "./execute.js";


const dbPath = path.resolve(__dirname, "movies.sqlite");

if (!fs.existsSync(path.dirname(dbPath))) {
  console.log("Creating 'database' directory...");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

// Open or create the database
const db = new Database(dbPath, { create: true, strict: true });

const main = async () => {
  try {
    // Create the table
    execute(
      db,
      `CREATE TABLE IF NOT EXISTS FavVideos (
        id INTEGER PRIMARY KEY,
        videoName TEXT NOT NULL,
        channelName TEXT NOT NULL,
        duration REAL NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );`
    );
    console.log("Table Created");

    // Insert a row into the table
    execute(
      db,
      `INSERT INTO FavVideos (videoName, channelName, duration) VALUES (?, ?, ?)`,
      ["Sample Video", "Sample Channel", 10.5]
    );
    console.log("Row Inserted");
  } catch (error) {
    console.log("Error:", error);
  } finally {
    db.close();
    console.log("Database connection closed");
  }
};

await main();
