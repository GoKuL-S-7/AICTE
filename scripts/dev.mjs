import { spawn, execSync } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const BACKEND_PORT = Number(process.env.PORT || 5000);
const FRONTEND_PORT = Number(process.env.FRONTEND_PORT || 3000);

function findWindowsPid(port) {
  try {
    const out = execSync("netstat -ano -p tcp", { encoding: "utf8" });
    const needle = `:${port}`;
    const lines = out.split(/\r?\n/).filter((line) => line.includes(needle) && line.includes("LISTENING"));
    return [...new Set(lines.map((line) => line.trim().split(/\s+/).pop()).filter(Boolean))];
  } catch {
    return [];
  }
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "0.0.0.0");
  });
}

async function assertPort(port, label) {
  const free = await isPortFree(port);
  if (free) return;
  const pids = process.platform === "win32" ? findWindowsPid(port) : [];
  const pidInfo = pids.length ? ` Occupying PID(s): ${pids.join(", ")}.` : "";
  console.error(
    `[dev] ${label} port ${port} is already in use.${pidInfo} Stop that specific process, or set ${
      label === "Backend" ? "PORT" : "FRONTEND_PORT"
    } to a free port.`
  );
  process.exit(1);
}

function run(command, args, cwd, name, extraEnv = {}) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, ...extraEnv },
  });
  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`[dev] ${name} exited with code ${code}`);
    }
  });
  return child;
}

async function waitForHealth(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // backend not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

await assertPort(BACKEND_PORT, "Backend");
await assertPort(FRONTEND_PORT, "Frontend");

console.log(`[dev] Starting backend on http://localhost:${BACKEND_PORT}`);
console.log(`[dev] Frontend will be available at http://localhost:${FRONTEND_PORT}`);
console.log("[dev] MongoDB must already be running at MONGODB_URI (see .env.example).");

const children = [];
children.push(
  run("npm", ["run", "dev"], path.join(root, "backend"), "backend", {
    PORT: String(BACKEND_PORT),
  })
);

const ready = await waitForHealth(`http://127.0.0.1:${BACKEND_PORT}/api/health`);
if (!ready) {
  console.warn("[dev] Backend /api/health did not become ready within 60s. Starting frontend anyway.");
} else {
  console.log("[dev] Backend health check passed. Starting frontend.");
}

children.push(
  run("npm", ["run", "dev", "--", "-p", String(FRONTEND_PORT)], path.join(root, "frontend"), "frontend", {
    PORT: String(FRONTEND_PORT),
    BACKEND_URL: process.env.BACKEND_URL || `http://localhost:${BACKEND_PORT}`,
  })
);

function shutdown() {
  for (const child of children) {
    try {
      child.kill("SIGTERM");
    } catch {
      // ignore
    }
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
