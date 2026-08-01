import { spawn } from "node:child_process";
import path from "node:path";

const node = process.execPath;
const root = process.cwd();
const commands = [
  [path.join(root, "node_modules", "tsx", "dist", "cli.mjs"), "watch", "server/index.ts"],
  [path.join(root, "node_modules", "vite", "bin", "vite.js"), "--host", "0.0.0.0", "--port", "3000"]
];
const children = commands.map((args) => spawn(node, args, { stdio: "inherit", shell: false }));

function shutdown(code = 0) {
  for (const child of children) child.kill();
  process.exit(code);
}

for (const child of children) {
  child.on("exit", (code) => {
    if (code && code !== 0) shutdown(code);
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
