import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { connectDB, closeDB } from "../db";
import { seedDevAccounts } from "./seedDevAccounts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../..", ".env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function seed() {
  try {
    await connectDB();
    await seedDevAccounts();
  } catch (err) {
    console.error("Seed script failed:", err);
    process.exitCode = 1;
  } finally {
    await closeDB();
    process.exit();
  }
}

seed();
