# TokenProp – Simulated Data & API Mimicking Guide

This document outlines all areas within the TokenProp platform where mock data or feature mimicking is currently implemented. This "Simulated Data Layer" is designed specifically for robust hackathon demonstrations, ensuring no rate limits, paid API restrictions, or missing blockchain deployments break the user experience during a pitch.

---

## 1. External Third-Party APIs

### Weather & Disaster API (Insurance Logic)
* **File:** `backend/services/disasterMonitor.js`
* **What is mimicked:** Instead of hitting live NOAA or OpenWeather APIs (which cost money and are complex to mock for specific alerts on demand), we mapped hardcoded GPS coordinates to each property. 
* **Mock Data:** The system relies on a `SIMULATED_ALERTS` array that triggers realistic fake events (like a Category 3 Hurricane in Manhattan or a Flood Warning in Mumbai). This allows the Smart Contract Insurance mechanism to react visibly and instantly.

### RentCast / Real Estate Pricing API
* **File:** `backend/services/rentcast.js`
* **What is mimicked:** The codebase attempts to use a live RentCast API key to fetch property rental valuations. 
* **Mock Data:** If the API key is not supplied (or fails), it smoothly falls back to the `MOCK_RENTAL_ESTIMATES` dictionary. This provides highly realistic market trends, comparable rents, confidence intervals, and demographic data tailored to the specific property type (e.g., Commercial vs. Agricultural).

### CoinGecko Live Price API
* **File:** `backend/services/coingecko.js`
* **What is mimicked:** The system genuinely tries to fetch the live POL/MATIC USD price from CoinGecko.
* **Mock Data:** Because CoinGecko’s free tier rate-limits very quickly, the backend intercepts the `HTTP 429` error and gracefully falls back to a statically simulated price of `$0.55`. This ensures the UI never breaks during the demo.

---

## 2. AI & Off-Chain Verification

### AI Liquidity Scoring Engine
* **Files:** `backend/services/scoringEngine.js` & `js/data.js`
* **What is mimicked:** The flagship feature that assigns a Risk Level (Low/Medium/High), an A-F Grade, and a Liquidity Badge to properties is mimicking a live Machine Learning API.
* **Mock Data:** It is powered by a robust "Rule-based Engine" (V1) rather than connecting to an OpenAI point. The rules programmatically assign weights based on hardcoded conditions like `expectedYield`, `rentalIncome`, and percentage funded.

### KYC / Aadhaar Verification
* **Files:** `backend/routes/kyc.js` & `js/kyc.js`
* **What is mimicked:** A real Indian UIDAI Aadhaar verification requires a secured banking license and a paid SMS API provider like Twilio or MSG91.
* **Mock Data:** We mock the server-side OTP dispatch mechanism. Instead of SMS, it uses Ethereal Email (a dummy NodeMailer testing service) to “send” the OTP, and internally validates against a temporary server-side memory Map.

---

## 3. Blockchain & Smart Contracts

> **Note:** The Smart Contracts are fully written (found in the `/contracts` directory) and compiled, but currently **not deployed** to the Polygon Amoy testnet. The ".env" file is empty. Therefore, the system bypasses ethers.js reads and operates in an intelligent fallback mode.

### Property Database & Yields
* **Files:** `backend/routes/properties.js`, `js/data.js`
* **What is mimicked:** The core property registry.
* **Mock Data:** The backend bypasses the `getRegistryEntry` blockchain call entirely and serves a mocked JSON array called `SIMULATED_PROPERTIES`. This safely populates the Marketplace, images, metadata, yields, and token supply without needing the testnet.

### User Portfolio & DAO Governance
* **File:** `js/data.js`
* **What is mimicked:** The entire Governance Voting Dashboard, proposal voting history, and the user's dashboard transaction log (e.g., "Sold 20 tokens of Vineyard Estate").
* **Mock Data:** Mock arrays like `DAO_PROPOSALS` and `USER_DATA` artificially inflate the user's "Proof-of-Involvement" (POI) score and voting history so there is data to showcase right out of the box, avoiding an empty dashboard state.

### Cross-Chain Purchase Bridging
* **File:** `js/property.js`
* **What is mimicked:** The UI flow allowing investors to buy property tokens natively from Ethereum, Base, or BNB networks.
* **Mock Data:** Instead of implementing a true cross-chain bridge (like LayerZero or Axelar) that can take 15 minutes to settle on-chain, the frontend UI simulates the interaction using a visual `setTimeout` loader to mimic bridging latency before confirming success.
