/**
 * Production server for Expo deployment.
 *
 * On startup: builds the Expo web export if not present.
 * Then serves:
 * - GET / and all web routes → Expo web build (static-build/web/)
 * - GET /manifest with expo-platform header → native app manifest JSON
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const STATIC_ROOT = path.resolve(__dirname, "..", "static-build");
const WEB_ROOT = path.join(STATIC_ROOT, "web");
const PROJECT_ROOT = path.resolve(__dirname, "..");
const basePath = (process.env.BASE_PATH || "/").replace(/\/+$/, "");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".map": "application/json",
};

function buildWebIfNeeded() {
  const indexPath = path.join(WEB_ROOT, "index.html");
  if (fs.existsSync(indexPath)) {
    console.log("Web build found, skipping build step.");
    return;
  }

  console.log("Web build not found. Running expo export...");
  fs.mkdirSync(WEB_ROOT, { recursive: true });

  const result = spawnSync(
    "npx",
    ["expo", "export", "--platform", "web", "--output-dir", "static-build/web"],
    {
      cwd: PROJECT_ROOT,
      stdio: "inherit",
      timeout: 300_000, // 5 minutes
      env: { ...process.env },
    }
  );

  if (result.status !== 0) {
    console.error("expo export failed with status:", result.status);
    process.exit(1);
  }

  console.log("Web build complete.");
}

function serveManifest(platform, res) {
  const manifestPath = path.join(STATIC_ROOT, platform, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: `Manifest not found for platform: ${platform}` }));
    return;
  }
  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.writeHead(200, {
    "content-type": "application/json",
    "expo-protocol-version": "1",
    "expo-sfv-version": "0",
  });
  res.end(manifest);
}

function serveWebApp(urlPath, res) {
  const safePath = path.normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(WEB_ROOT, safePath);

  if (!filePath.startsWith(WEB_ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  // Serve file if it exists and is not a directory
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "content-type": contentType });
    res.end(fs.readFileSync(filePath));
    return;
  }

  // SPA fallback: always serve index.html for client-side routing
  const indexPath = path.join(WEB_ROOT, "index.html");
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(fs.readFileSync(indexPath));
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
}

// Build first (synchronously), then start serving
buildWebIfNeeded();

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  let pathname = url.pathname;

  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || "/";
  }

  // Native Expo manifest routes
  if (pathname === "/manifest" || pathname === "/") {
    const platform = req.headers["expo-platform"];
    if (platform === "ios" || platform === "android") {
      return serveManifest(platform, res);
    }
  }

  // Serve web app
  serveWebApp(pathname, res);
});

const port = parseInt(process.env.PORT || "3000", 10);
server.listen(port, "0.0.0.0", () => {
  console.log(`Serving JobTrack web app on port ${port}`);
});
