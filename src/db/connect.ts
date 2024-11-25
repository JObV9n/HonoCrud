import { MongoClient } from "mongodb";

// Get MongoDB URI from the environment variable
let MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

(async () => {
  const client: MongoClient = await MongoClient.connect(MONGODB_URI);

  try {
    console.log("Connected to MongoDB successfully");

    const adminDb = client.db().admin();

    // Fetch the list of databases
    const { databases } = await adminDb.listDatabases();
    if (!databases || databases.length === 0) {
      console.log("No databases found");
      return;
    }

    // Filter databases starting with "sample_"
    const sampleDbs = databases.filter((db) => db.name.startsWith("sample_"));

    if (sampleDbs.length === 0) {
      console.log("No sample databases found to drop");
      return;
    }

    console.log(`Found ${sampleDbs.length} sample databases:`, sampleDbs.map((db) => db.name));

    // Drop each database
    for (const dbInfo of sampleDbs) {
      const dbName = dbInfo.name;
      try {
        await client.db(dbName).dropDatabase();
        console.log(`✓ Dropped database: ${dbName}`);
      } catch (error: unknown) {
        console.error(`✗ Failed to drop database ${dbName}:`, error instanceof Error ? error.message : error);
      }
    }
  } catch (error: unknown) {
    console.error("An error occurred:", error instanceof Error ? error.message : error);
  } finally {
    // Close the client connection
    await client.close();
    console.log("MongoDB connection closed");
  }
})();
