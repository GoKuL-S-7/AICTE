import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import { execSync } from "child_process";
import { connectDB, getDBStatus } from "./db";
import { csrfCookieMiddleware, verifyCsrfToken } from "./middleware/csrf";
import authRouter from "./routes/auth";
import institutionRouter from "./routes/institution";
import fdRouter from "./routes/fd";
import vigilanceRouter from "./routes/vigilance";
import auditRouter from "./routes/audit";
import pgrcRouter from "./routes/pgrc";
import publicRouter from "./routes/public";
import chatbotRouter from "./routes/chatbot";
import { errorHandler } from "./middleware/errorHandler";
import { seedDevAccounts } from "./seed/seedDevAccounts";

dotenv.config();
dotenv.config({ path: "../.env" });

const app = express();
const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || "0.0.0.0";
const isProduction = process.env.NODE_ENV === "production";
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aicte_unified";

app.set("trust proxy", 1);


const allowedOrigins = [
  "https://aicte-lime.vercel.app",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
];

console.log("Allowed frontend origins:", allowedOrigins);


app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        (!isProduction && origin.startsWith("http://localhost:")) ||
        (process.env.ALLOWED_DOMAIN_SUFFIX && origin.endsWith(process.env.ALLOWED_DOMAIN_SUFFIX))
      ) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

function healthPayload() {
  return {
    status: "ok",
    service: "unified-aicte-api",
    timestamp: new Date().toISOString(),
    dbStatus: getDBStatus(),
  };
}

app.get("/", (_req, res) => {
  res.json({
    name: "Unified AICTE Portal API",
    status: "ok",
    health: "/api/health",
    frontend: process.env.FRONTEND_URL || "http://localhost:3000",
  });
});
app.get("/health", (_req, res) => {
  res.json(healthPayload());
});
app.get("/api/health", (_req, res) => {
  res.json(healthPayload());
});

async function start() {
  const db = await connectDB();

  const sessionConfig: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "dev-secret-please-change",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 24,
    },
  };
  if (db.ok) {
    const client = mongoose.connection.getClient();
    sessionConfig.store = client
      ? MongoStore.create({
          client: client as any,
          collectionName: "sessions",
        })
      : MongoStore.create({
          mongoUrl: mongoUri,
          collectionName: "sessions",
        });
  } else {
    console.warn("Using in-memory session store because MongoDB is unavailable. Sessions will not persist across restarts.");
  }

  app.use(session(sessionConfig));

  app.use(csrfCookieMiddleware);
  app.use(verifyCsrfToken);

  app.use("/api/auth", authRouter);
  app.use("/api/institution", institutionRouter);
  app.use("/api/fd", fdRouter);
  app.use("/api/vigilance", vigilanceRouter);
  app.use("/api/audit", auditRouter);
  app.use("/api/pgrc", pgrcRouter);
  app.use("/api/public", publicRouter);
  app.use("/api/chatbot", chatbotRouter);

  app.use((req, res) => {
    res.status(404).json({
      message: `Unknown route: ${req.method} ${req.originalUrl}`,
      code: "NOT_FOUND",
    });
  });
  app.use(errorHandler);

  if (db.ok) {
    try {
      const { HandbookClause } = await import("./models/HandbookClause");
      const { seedHandbookDatabase } = await import("./seed/seedHandbook");
      const count = await HandbookClause.countDocuments();
      if (count === 0) {
        await seedHandbookDatabase();
      }
    } catch (e) {
      console.warn("Auto-seed handbook check failed");
    }
    if (!isProduction) {
      try {
        await seedDevAccounts();
      } catch (e) {
        console.warn("Development account seed skipped");
      }
    }
  } else {
    console.error("MongoDB is not available. Database-backed routes will return errors until it is running.");
    if (isProduction) {
      throw new Error(`Critical startup failure: MongoDB connection could not be established in production (${(db as any).error?.message || "connection failed"}). Halting startup.`);
    }
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`Backend server listening on http://${HOST}:${PORT}`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      let extra = "";
      if (process.platform === "win32") {
        try {
          const out = execSync("netstat -ano -p tcp", { encoding: "utf8" });
          const pids = [
            ...new Set(
              out
                .split(/\r?\n/)
                .filter((line) => line.includes(`:${PORT}`) && line.includes("LISTENING"))
                .map((line) => line.trim().split(/\s+/).pop())
                .filter(Boolean)
            ),
          ];
          if (pids.length) extra = ` Occupying PID(s): ${pids.join(", ")}.`;
        } catch {
          extra = "";
        }
      }
      console.error(`Port ${PORT} is already in use.${extra} Stop that process or set PORT to a free port.`);
      process.exit(1);
    }
    console.error("Failed to start backend server");
    process.exit(1);
  });
}

start().catch((err) => {
  console.error("Backend startup failed:", err instanceof Error ? err.message : "unknown error");
  process.exit(1);
});
