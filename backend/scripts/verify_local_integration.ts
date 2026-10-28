import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { connectDB, closeDB, getDBStatus } from "../src/db";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: path.join(root, ".env") });
dotenv.config({ path: path.join(root, "backend", ".env") });

const BASE = process.env.BACKEND_URL || "http://127.0.0.1:5000";

type Check = { name: string; ok: boolean; detail: string };

async function request(path: string, init: RequestInit = {}, cookie = "") {
  const headers = new Headers(init.headers);
  if (cookie) headers.set("Cookie", cookie);
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const setCookie = res.headers.get("set-cookie") || "";
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { res, json, text, setCookie };
}

function cookieFrom(setCookie: string, previous = "") {
  const match = setCookie.match(/connect\.sid=[^;]+/);
  if (match) return match[0];
  return previous;
}

async function main() {
  const checks: Check[] = [];
  const db = await connectDB();
  checks.push({
    name: "database connectivity",
    ok: db.ok && getDBStatus() === "connected",
    detail: getDBStatus(),
  });

  try {
    const health = await request("/api/health");
    checks.push({
      name: "GET /api/health",
      ok: health.res.ok && health.json?.status === "ok",
      detail: `${health.res.status} ${JSON.stringify(health.json)}`,
    });

    const root = await request("/");
    checks.push({
      name: "GET /",
      ok: root.res.ok && (root.json?.status === "ok" || root.json?.health === "/api/health"),
      detail: `${root.res.status} ${root.text.slice(0, 180)}`,
    });

    const unauth = await request("/api/fd/dashboard");
    checks.push({
      name: "protected route without session",
      ok: unauth.res.status === 401,
      detail: `status ${unauth.res.status}`,
    });

    const invalid = await request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "not-a-user", password: "incorrect" }),
    });
    checks.push({
      name: "invalid login",
      ok: invalid.res.status === 401,
      detail: `status ${invalid.res.status} code=${invalid.json?.code || "none"}`,
    });

    const creds = String(process.env.DEV_EMP_PASSWORDS || "");
    const fdPair = creds.split(",").find((p) => p.trim().startsWith("fd_emp:"));
    const fdPass = fdPair?.split(":")[1];
    if (!fdPass) {
      checks.push({
        name: "valid FD login",
        ok: false,
        detail: "DEV_EMP_PASSWORDS does not include fd_emp",
      });
    } else {
      const login = await request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "fd_emp", password: fdPass }),
      });
      const cookie = cookieFrom(login.setCookie);
      checks.push({
        name: "valid FD login",
        ok: login.res.ok && login.json?.role === "AICTE_FD_EMPLOYEE",
        detail: `status ${login.res.status} role=${login.json?.role || "none"}`,
      });

      const me = await request("/api/auth/me", {}, cookie);
      checks.push({
        name: "GET /api/auth/me",
        ok: me.res.ok && me.json?.role === "AICTE_FD_EMPLOYEE",
        detail: `status ${me.res.status}`,
      });

      const dash = await request("/api/fd/dashboard", {}, cookie);
      checks.push({
        name: "GET /api/fd/dashboard",
        ok: dash.res.ok && typeof dash.json?.totalApplications === "number",
        detail: `status ${dash.res.status}`,
      });

      const apps = await request("/api/fd/applications", {}, cookie);
      checks.push({
        name: "GET /api/fd/applications",
        ok: apps.res.ok && Array.isArray(apps.json),
        detail: `status ${apps.res.status} count=${Array.isArray(apps.json) ? apps.json.length : "n/a"}`,
      });

      const pgrc = await request("/api/pgrc/dashboard", {}, cookie);
      checks.push({
        name: "FD employee blocked from PGRC dashboard",
        ok: pgrc.res.status === 403,
        detail: `status ${pgrc.res.status}`,
      });
    }
  } catch (err: any) {
    checks.push({
      name: "HTTP integration",
      ok: false,
      detail: err?.message || "request failed — is the backend running?",
    });
  }

  const failed = checks.filter((c) => !c.ok);
  for (const c of checks) {
    console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name} — ${c.detail}`);
  }
  await closeDB();
  if (failed.length) {
    process.exitCode = 1;
  }
}

main();
