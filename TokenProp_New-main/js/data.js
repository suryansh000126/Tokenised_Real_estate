(function (root, factory) {
  const data = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  } else {
    root.TokenPropData = data;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const properties = [
    { id: 1, name: "Skyline Residences", location: "Manhattan, New York", type: "Residential", price: 125, nav: 128, yield: 8.5, funded: 87, tokenSupply: 10000, tokensAvailable: 1300, monthlyRent: 42000, rentalIncome: 42000, owner: "Skyline Property Group", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop", description: "A verified residential investment in Manhattan with steady rental demand, professional property management, and transparent ownership records.", risk: "Low" },
    { id: 2, name: "Oceanview Villa", location: "Miami Beach, Florida", type: "Hospitality", price: 200, nav: 210, yield: 9.2, funded: 64, tokenSupply: 5000, tokensAvailable: 1800, monthlyRent: 38000, rentalIncome: 38000, owner: "Coastal Stays LLC", image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&auto=format&fit=crop", description: "A professionally operated coastal hospitality property with seasonal demand and fractional stay-credit benefits.", risk: "Medium" },
    { id: 3, name: "Austin Tech Innovation Campus", location: "Austin, Texas", type: "Commercial", price: 85, nav: 88, yield: 7.9, funded: 74, tokenSupply: 8000, tokensAvailable: 2080, monthlyRent: 51000, rentalIncome: 51000, owner: "Austin Commercial Partners", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop", description: "A multi-tenant technology campus with long-term commercial leases and energy-efficiency investment plans.", risk: "Low" },
    { id: 4, name: "Marina Bay Commercial Hub", location: "Singapore", type: "Commercial", price: 150, nav: 154, yield: 8.1, funded: 71, tokenSupply: 9000, tokensAvailable: 2610, monthlyRent: 64000, rentalIncome: 64000, owner: "Marina Bay Assets", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&auto=format&fit=crop", description: "Prime commercial space in Singapore with diversified tenants and predictable contracted rental income.", risk: "Medium" },
    { id: 5, name: "Napa Valley Vineyard Estate", location: "Napa Valley, California", type: "Agricultural", price: 95, nav: 101, yield: 7.2, funded: 64, tokenSupply: 7000, tokensAvailable: 2520, monthlyRent: 29000, rentalIncome: 29000, owner: "Vineyard Estate Holdings", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&auto=format&fit=crop", description: "A managed vineyard estate combining agricultural operations, event revenue, and land-backed value.", risk: "Medium" },
    { id: 6, name: "Tokyo Tech Park", location: "Tokyo, Japan", type: "Commercial", price: 110, nav: 114, yield: 8.0, funded: 76, tokenSupply: 6000, tokensAvailable: 1440, monthlyRent: 46000, rentalIncome: 46000, owner: "Tokyo Innovation Properties", image: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1200&auto=format&fit=crop", description: "A modern technology campus with stable commercial tenants and a proposed rooftop solar installation.", risk: "Low" }
  ];

  const rentalEstimates = {
    1: { monthlyRent: 42000, annualRent: 504000, comparableCount: 18, confidence: 0.91, trend: 3.8, source: "simulated RentCast estimate" },
    2: { monthlyRent: 38000, annualRent: 456000, comparableCount: 14, confidence: 0.86, trend: 4.2, source: "simulated RentCast estimate" },
    3: { monthlyRent: 51000, annualRent: 612000, comparableCount: 22, confidence: 0.93, trend: 5.1, source: "simulated RentCast estimate" },
    4: { monthlyRent: 64000, annualRent: 768000, comparableCount: 17, confidence: 0.88, trend: 2.9, source: "simulated RentCast estimate" },
    5: { monthlyRent: 29000, annualRent: 348000, comparableCount: 11, confidence: 0.82, trend: 2.4, source: "simulated RentCast estimate" },
    6: { monthlyRent: 46000, annualRent: 552000, comparableCount: 16, confidence: 0.9, trend: 4.6, source: "simulated RentCast estimate" }
  };

  const disasterAlerts = [
    { id: "alert-ny-01", propertyId: 1, type: "Coastal flood advisory", severity: "low", region: "Manhattan, New York", status: "monitoring", issuedAt: "2026-10-28T08:00:00Z", simulated: true },
    { id: "alert-miami-01", propertyId: 2, type: "Tropical storm watch", severity: "high", region: "Miami Beach, Florida", status: "active", issuedAt: "2026-10-28T12:30:00Z", simulated: true },
    { id: "alert-tokyo-01", propertyId: 6, type: "Heavy rainfall advisory", severity: "medium", region: "Tokyo, Japan", status: "monitoring", issuedAt: "2026-10-27T18:00:00Z", simulated: true }
  ];

  const daoProposals = [
    { id: "TP-2026-001", title: "Develop Rooftop Garden — Skyline Residences", propertyId: 1, category: "Development", status: "active", votes: { for: 6420, against: 1230, abstain: 350 } },
    { id: "TP-2026-002", title: "Lease Ground Floor to Premium Retailer", propertyId: 4, category: "Leasing", status: "active", votes: { for: 8900, against: 2100, abstain: 800 } },
    { id: "TP-2026-003", title: "Install Solar Panels — Tokyo Tech Park", propertyId: 6, category: "Sustainability", status: "active", votes: { for: 15200, against: 3800, abstain: 1200 } },
    { id: "TP-2026-004", title: "Upgrade Energy Systems — Austin Tech Campus", propertyId: 3, category: "Operations", status: "passed", votes: { for: 11800, against: 2200, abstain: 700 } },
    { id: "TP-2026-005", title: "Expand Parking at Marina Bay Hub", propertyId: 4, category: "Operations", status: "rejected", votes: { for: 3100, against: 7400, abstain: 500 } }
  ];

  const userData = {
    displayName: "Demo Investor",
    wallet: "0x71C7...3aF9",
    poi: { ownership: 72, activity: 85, duration: 68, score: 76 },
    financialWeight: 3.1,
    governanceWeight: 4.2,
    holdings: [
      { propertyId: 1, tokens: 120, averagePrice: 118 },
      { propertyId: 2, tokens: 45, averagePrice: 192 },
      { propertyId: 3, tokens: 80, averagePrice: 81 }
    ],
    activities: [
      { type: "Rent received", propertyId: 1, detail: "Monthly rental distribution", amount: "12.5 POL", date: "2026-10-24" },
      { type: "Vote cast", propertyId: 1, detail: "Rooftop Garden proposal", amount: "For", date: "2026-10-22" },
      { type: "Tokens purchased", propertyId: 3, detail: "Austin Tech Innovation Campus", amount: "20 tokens", date: "2026-10-18" },
      { type: "Secondary sale", propertyId: 5, detail: "Vineyard Estate", amount: "20 tokens", date: "2026-10-12" }
    ],
    monthlyIncome: 612.5
  };

  const transparencyEvents = [
    { type: "TDS", title: "Automated TDS remitted to government treasury", property: "Skyline Residences", blockNumber: 15423891, amount: "1,250.00 POL", txHash: "0x6a8f4c20d5e713b9a2c6f18e40d937a5b1c8e6f4a2d0b7c9e3f51628a4c0d731", simulated: true },
    { type: "RENT", title: "Monthly rental yield deposited and checkpointed", property: "Skyline Residences", blockNumber: 15423890, amount: "12,500.00 POL", txHash: "0x73c2e9a416b8d5f017a3c6e94b2d8f105e7a3c9b64d1f820a5e3c7b9d246f18a", simulated: true },
    { type: "SWAP", title: "Secondary orderbook swap completed", property: "Oceanview Villa", blockNumber: 15423872, amount: "3.20 POL", txHash: "0x4d9b21e7c3a6f8150b2e9d47a1c8f3065e4b7a9d2c1f8306b5e7a4d9c2f16803", simulated: true }
  ];

  function scoreProperty(property) {
    const yieldScore = Math.min(100, Math.max(0, property.yield * 10));
    const fundingScore = Math.min(100, Math.max(0, property.funded));
    const rentScore = Math.min(100, Math.max(0, (property.monthlyRent / 650) * 100));
    const score = Math.round(yieldScore * 0.4 + fundingScore * 0.35 + rentScore * 0.25);
    const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
    const risk = score >= 80 ? "Low" : score >= 65 ? "Medium" : "High";
    const badge = score >= 85 ? "High Liquidity" : score >= 70 ? "Moderate Liquidity" : "Developing Liquidity";
    return {
      score,
      grade,
      risk,
      badge,
      breakdown: [
        { name: "Expected yield", weight: 40, score: Math.round(yieldScore) },
        { name: "Funding progress", weight: 35, score: Math.round(fundingScore) },
        { name: "Rental demand", weight: 25, score: Math.round(rentScore) }
      ],
      recommendation: score >= 80 ? "Strong simulated liquidity indicators; review the underlying assumptions before investing." : "Consider the property's funding progress and rental assumptions as part of your due diligence."
    };
  }

  const price = { symbol: "POL", usd: 0.55, source: "simulated price feed", updatedAt: "2026-10-29T00:00:00Z" };

  return Object.freeze({
    properties: properties,
    rentalEstimates: rentalEstimates,
    disasterAlerts: disasterAlerts,
    daoProposals: daoProposals,
    userData: userData,
    transparencyEvents: transparencyEvents,
    price: price,
    scoreProperty: scoreProperty
  });
});
