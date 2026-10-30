// TokenProp local demo server: static frontend plus deterministic mock API.
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const data = require("./js/data.js");

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = __dirname;
const MAX_BODY_BYTES = 32 * 1024;
const DEMO_OTP = "123456";
const kycSessions = new Map();

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf"
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    let exceededLimit = false;
    req.on("data", (chunk) => {
      if (exceededLimit) return;
      body += chunk;
      if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
        exceededLimit = true;
        reject(Object.assign(new Error("Request body is too large."), { status: 413 }));
      }
    });
    req.on("end", () => {
      if (exceededLimit) return;
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(Object.assign(new Error("Request body must be valid JSON."), { status: 400 }));
      }
    });
    req.on("error", reject);
  });
}

function getProperty(id) {
  const numericId = Number(id);
  return data.properties.find((property) => property.id === numericId);
}

function propertyWithScore(property) {
  return { ...property, liquidity: data.scoreProperty(property) };
}

function getPortfolio() {
  const holdings = data.userData.holdings.map((holding) => {
    const property = getProperty(holding.propertyId);
    const value = property.price * holding.tokens;
    return {
      ...holding,
      property: property.name,
      location: property.location,
      currentPrice: property.price,
      yield: property.yield,
      value,
      gain: (property.price - holding.averagePrice) * holding.tokens
    };
  });
  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);
  const totalTokens = holdings.reduce((sum, holding) => sum + holding.tokens, 0);
  return {
    ...data.userData,
    holdings,
    totalValue,
    totalTokens,
    propertyCount: holdings.length,
    gainPercent: holdings.length
      ? holdings.reduce((sum, holding) => sum + holding.gain, 0) / (totalValue || 1) * 100
      : 0
  };
}

function simulatePortfolio(body) {
  const allocations = body.allocations;
  if (!Array.isArray(allocations) || allocations.length === 0) {
    return { error: "allocations must be a non-empty array." };
  }

  const normalized = allocations.map((allocation) => ({
    property: getProperty(allocation.id),
    weight: Number(allocation.weight)
  }));
  if (normalized.some((item) => !item.property || !Number.isFinite(item.weight) || item.weight < 0 || item.weight > 100)) {
    return { error: "Each allocation needs a valid property id and a weight between 0 and 100." };
  }

  const totalWeight = normalized.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight === 0) return { error: "At least one allocation must have a positive weight." };

  const expectedYield = normalized.reduce((sum, item) => sum + item.property.yield * item.weight, 0) / totalWeight;
  const weightedRisk = normalized.reduce((sum, item) => {
    const risk = item.property.risk === "Low" ? 22 : item.property.risk === "Medium" ? 48 : 72;
    return sum + risk * item.weight;
  }, 0) / totalWeight;
  const nonZero = normalized.filter((item) => item.weight > 0);
  const diversification = Math.min(100, Math.round(nonZero.length * 22 + Math.max(0, 100 - Math.max(...nonZero.map((item) => item.weight / totalWeight * 100))) * 0.3));
  const compositeRisk = Math.round(weightedRisk);
  const rating = diversification >= 70 ? "High Diversification" : diversification >= 40 ? "Moderate Diversification" : "Concentrated Portfolio";

  return {
    simulationSummary: {
      expectedAnnualYield: expectedYield.toFixed(2) + "%",
      compositeRiskScore: compositeRisk,
      diversificationScore: diversification,
      rating
    },
    recommendation: diversification >= 70
      ? "The simulated allocation is spread across multiple property types. Review the assumptions and concentration limits before investing."
      : "Consider diversifying across more properties to reduce concentration in this simulated portfolio.",
    disclaimer: "Illustrative demo calculation only; not financial advice."
  };
}

async function handleApi(req, res, url) {
  const pathname = url.pathname;
  if (req.method === "GET" && pathname === "/api/health") {
    return sendJson(res, 200, { status: "ok", mode: "simulated-demo", timestamp: new Date().toISOString() });
  }
  if (req.method === "GET" && pathname === "/api/properties") {
    return sendJson(res, 200, { mode: "simulated-demo", properties: data.properties.map(propertyWithScore) });
  }
  if (req.method === "GET" && pathname === "/api/price/pol") {
    return sendJson(res, 200, data.price);
  }
  if (req.method === "GET" && pathname === "/api/portfolio/demo") {
    return sendJson(res, 200, { mode: "simulated-demo", portfolio: getPortfolio() });
  }
  if (req.method === "GET" && pathname === "/api/transparency") {
    return sendJson(res, 200, { mode: "simulated-demo", recentOnChainEvents: data.transparencyEvents });
  }
  if (req.method === "GET" && pathname === "/api/disaster-alerts") {
    const propertyId = url.searchParams.get("propertyId");
    const alerts = propertyId
      ? data.disasterAlerts.filter((alert) => alert.propertyId === Number(propertyId))
      : data.disasterAlerts;
    return sendJson(res, 200, { mode: "simulated-demo", alerts });
  }
  if (req.method === "GET" && pathname.startsWith("/api/rentcast/")) {
    const id = pathname.slice("/api/rentcast/".length);
    const estimate = data.rentalEstimates[id];
    if (!getProperty(id) || !estimate) return sendJson(res, 404, { error: "Property estimate not found." });
    return sendJson(res, 200, { propertyId: Number(id), ...estimate, disclaimer: "Simulated rental estimate; not a live valuation." });
  }
  if (req.method === "GET" && pathname.startsWith("/api/properties/")) {
    const id = pathname.slice("/api/properties/".length);
    const property = getProperty(id);
    if (!property) return sendJson(res, 404, { error: "Property not found." });
    return sendJson(res, 200, { mode: "simulated-demo", property: propertyWithScore(property) });
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await readJsonBody(req);
    } catch (error) {
      return sendJson(res, error.status || 400, { error: error.message });
    }

    if (pathname === "/api/portfolio/simulate") {
      const result = simulatePortfolio(body);
      if (result.error) return sendJson(res, 400, result);
      return sendJson(res, 200, { ...result, mode: "simulated-demo" });
    }
    if (pathname === "/api/ai-analyst/ask") {
      const property = getProperty(body.propertyId);
      const query = typeof body.query === "string" ? body.query.trim() : "";
      if (!property) return sendJson(res, 404, { error: "Property not found." });
      if (!query || query.length > 500) return sendJson(res, 400, { error: "query must contain 1 to 500 characters." });
      const estimate = data.rentalEstimates[property.id];
      const alert = data.disasterAlerts.find((item) => item.propertyId === property.id && item.status === "active");
      const answer = "Demo analysis for " + property.name + ": expected yield is " + property.yield.toFixed(1) +
        "%, the simulated rental estimate is $" + estimate.monthlyRent.toLocaleString("en-US") +
        " per month, and the rule-based liquidity score is " + data.scoreProperty(property).score +
        "/100. " + (alert ? "A simulated " + alert.type + " alert is active for this property." : "No active simulated disaster alert is currently listed.");
      return sendJson(res, 200, {
        answer,
        citations: ["Property Registry (simulated)", "Rental Estimate (simulated)", "Risk Monitor (simulated)"],
        disclaimer: "This deterministic demo response is not generated by AI and is not investment, legal, or insurance advice.",
        mode: "simulated-demo"
      });
    }
    if (pathname === "/api/kyc/send-otp") {
      const wallet = typeof body.wallet === "string" && body.wallet.trim()
        ? body.wallet.trim().slice(0, 100)
        : "demo-wallet";
      const email = typeof body.email === "string" ? body.email.trim() : "";
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return sendJson(res, 400, { error: "Enter a valid email address or leave it blank." });
      }
      const key = wallet.toLowerCase();
      kycSessions.set(key, { otp: DEMO_OTP, expiresAt: Date.now() + 10 * 60 * 1000, attempts: 0, verified: false });
      return sendJson(res, 200, {
        message: "Demo OTP created. No SMS or email was sent.",
        demoOtp: DEMO_OTP,
        expiresInSeconds: 600,
        mode: "simulated-demo"
      });
    }
    if (pathname === "/api/kyc/verify-otp") {
      const wallet = typeof body.wallet === "string" && body.wallet.trim()
        ? body.wallet.trim().slice(0, 100).toLowerCase()
        : "demo-wallet";
      const session = kycSessions.get(wallet);
      if (!session || session.expiresAt < Date.now()) {
        kycSessions.delete(wallet);
        return sendJson(res, 400, { error: "Demo OTP has expired or was not requested. Request a new code." });
      }
      if (session.attempts >= 5) return sendJson(res, 429, { error: "Too many incorrect attempts. Request a new demo code." });
      if (body.otp !== session.otp) {
        session.attempts += 1;
        return sendJson(res, 400, { error: "That demo code is incorrect." });
      }
      session.verified = true;
      return sendJson(res, 200, { verified: true, mode: "simulated-demo", message: "Demo verification complete; no government identity check occurred." });
    }
    if (pathname === "/api/kyc/status") {
      const wallet = typeof body.wallet === "string" && body.wallet.trim()
        ? body.wallet.trim().slice(0, 100).toLowerCase()
        : "demo-wallet";
      const session = kycSessions.get(wallet);
      return sendJson(res, 200, { verified: Boolean(session && session.verified && session.expiresAt > Date.now()), mode: "simulated-demo" });
    }
    if (pathname === "/api/purchases/bridge") {
      const property = getProperty(body.propertyId);
      const chain = ["ethereum", "base", "bnb"].includes(body.chain) ? body.chain : null;
      const quantity = Number(body.quantity);
      if (!property || !chain || !Number.isInteger(quantity) || quantity < 1 || quantity > property.tokensAvailable) {
        return sendJson(res, 400, { error: "Select a valid property, supported chain, and available whole-token quantity." });
      }
      return sendJson(res, 200, {
        status: "simulated",
        property: property.name,
        chain,
        quantity,
        demoReference: "DEMO-" + crypto.randomBytes(6).toString("hex").toUpperCase(),
        message: "Bridge simulation complete. No wallet transaction or token transfer occurred.",
        mode: "simulated-demo"
      });
    }
  }

  sendJson(res, 404, { error: "API endpoint not found." });
}

function handleStatic(req, res, url) {
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400);
    res.end("Bad Request");
    return;
  }
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.resolve(PUBLIC_DIR, relativePath);
  const rootPrefix = PUBLIC_DIR.endsWith(path.sep) ? PUBLIC_DIR : PUBLIC_DIR + path.sep;
  if (filePath !== PUBLIC_DIR && !filePath.startsWith(rootPrefix)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 Not Found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff"
    });
    const stream = fs.createReadStream(filePath);
    stream.on("error", () => {
      if (!res.headersSent) res.writeHead(500);
      res.end("Unable to read requested file.");
    });
    stream.pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname.startsWith("/api/")) {
    handleApi(req, res, url).catch((error) => {
      console.error("Mock API request failed:", error);
      if (!res.headersSent) sendJson(res, 500, { error: "Mock API request failed." });
      else res.end();
    });
    return;
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    res.end("Method Not Allowed");
    return;
  }
  handleStatic(req, res, url);
});

server.listen(PORT, () => {
  console.log("\n🌐 TokenProp demo running locally at: http://localhost:" + PORT);
  console.log("🧪 Deterministic mock API available under /api/; no external APIs or blockchain transactions are used.\n");
});
