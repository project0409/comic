import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildMockPages, chaptersBySeries, seriesList } from "../src/lib/mockData";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json());

const otpRequests = new Map<string, { email: string; otp: string; ipAddress: string; expiresAt: number }>();
const loginAudits: Array<{ email: string; loginTime: number; ipAddress: string; userAgent: string }> = [];

function getIp(req: express.Request) {
  const forwarded = req.header("x-forwarded-for");
  const real = req.header("x-real-ip");
  return (forwarded || real || req.socket.remoteAddress || "unknown").split(",")[0].trim();
}

app.get("/api/series", (_req, res) => res.json(seriesList));
app.get("/api/series/:id/chapters", (req, res) => res.json(chaptersBySeries[req.params.id] ?? []));
app.get("/api/chapters/:id/pages", (req, res) => res.json(buildMockPages(req.params.id)));
app.get("/api/user/wallet", (_req, res) => res.json({ coinBalance: 120, subscription: "Premium", unlockedChapterIds: ["c1", "c2"] }));
app.post("/api/economy/unlock", (req, res) => res.json({ ok: true, unlocked: true, received: req.body }));
app.post("/api/interactions/react", (req, res) => res.json({ ok: true, received: req.body }));
app.post("/api/loremaster/ask", (req, res) => {
  const q = String(req.body?.query_text ?? "").trim();
  const p = Number(req.body?.current_page ?? 1);
  res.json({
    answer_text: [
      `Spoiler-safe answer up to page ${p}:`,
      q ? `- About "${q}":` : "- Ask a question to get lore context.",
      "- The violet glow usually signifies forged intent (not destiny).",
      "- I can summarize the last pages you have read."
    ].join("\n")
  });
});
app.get("/api/auth/login-audits", (_req, res) => res.json({ ok: true, audits: loginAudits.slice(0, 100) }));
app.post("/api/auth/request-otp", (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  if (!email.includes("@")) return res.status(400).json({ ok: false, error: "Please enter a valid email address." });
  const ipAddress = getIp(req);
  const record = { email, otp: process.env.NODE_ENV === "production" ? String(Math.floor(100000 + Math.random() * 900000)) : "123456", ipAddress, expiresAt: Date.now() + 5 * 60 * 1000 };
  otpRequests.set(email, record);
  res.json({ ok: true, email, ipAddress, expiresAt: record.expiresAt, devOtp: process.env.NODE_ENV === "production" ? undefined : record.otp });
});
app.post("/api/auth/verify-otp", (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const otp = String(req.body?.otp ?? "").replace(/\D/g, "");
  const ipAddress = getIp(req);
  const record = otpRequests.get(email);
  if (!record) return res.status(400).json({ ok: false, reason: "no_pending", ipAddress });
  if (Date.now() > record.expiresAt) return res.status(400).json({ ok: false, reason: "expired", ipAddress });
  if (record.ipAddress !== ipAddress) return res.status(400).json({ ok: false, reason: "ip_mismatch", ipAddress });
  if (record.otp !== otp) return res.status(400).json({ ok: false, reason: "invalid", ipAddress });
  otpRequests.delete(email);
  loginAudits.unshift({ email, loginTime: Date.now(), ipAddress, userAgent: req.header("user-agent") ?? "unknown" });
  res.json({ ok: true, email, ipAddress });
});

const distPath = path.resolve(__dirname, "../dist");
app.use(express.static(distPath));
app.get(/.*/, (_req, res) => res.sendFile(path.join(distPath, "index.html")));

app.listen(port, () => {
  console.log(`FYP Express API running on http://localhost:${port}`);
});
