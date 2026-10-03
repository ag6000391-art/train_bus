import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8" };
const server = createServer((req, res) => {
  const path = req.url === "/" ? "index.html" : decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "");
  const file = normalize(join(root, path));
  if (!file.startsWith(root) || !existsSync(file)) { res.writeHead(404); res.end("Not found"); return; }
  res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
  createReadStream(file).pipe(res);
});
server.listen(4173, () => console.log("Mumbai Bus Dashboard: http://localhost:4173"));
