(function () {
  "use strict";

  const usdPrices = [125, 200, 85];
  let currency = "USD";
  let polUsd = 0.55;

  function formatPrice(usd) {
    if (currency === "POL") return (usd / polUsd).toFixed(2) + " POL";
    if (currency === "INR") return "₹" + (usd * 83.1).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return "$" + usd.toFixed(2);
  }

  function setMarketplaceCurrency(nextCurrency) {
    if (!["USD", "POL", "INR"].includes(nextCurrency)) return;
    currency = nextCurrency;
    document.querySelectorAll(".property-card").forEach(function (card, index) {
      const price = card.querySelector('div[style*="margin-bottom: 12px"] span[style*="font-weight: 700"]');
      if (price && usdPrices[index] !== undefined) price.textContent = formatPrice(usdPrices[index]);
    });
    document.querySelectorAll("[data-currency-choice]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.currencyChoice === currency));
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".neon-tag--cyan, .neon-tag--purple, .neon-tag--amber").forEach(function (button) {
      const label = button.textContent.trim();
      if (label === "$ USD") button.dataset.currencyChoice = "USD";
      if (label === "POL / MATIC") button.dataset.currencyChoice = "POL";
      if (label === "₹ INR") button.dataset.currencyChoice = "INR";
    });
    TokenPropApi.polPrice().then(function (price) {
      polUsd = price.usd;
      const ticker = [...document.querySelectorAll(".ticker-item")].find(function (item) { return item.textContent.includes("POL/USD"); });
      if (ticker) ticker.innerHTML = ticker.innerHTML.replace(/\$[\d.]+/, "$" + price.usd.toFixed(2));
    }).catch(function (error) {
      console.error("Could not load simulated POL price:", error);
    });
    window.setMarketplaceCurrency = setMarketplaceCurrency;
    setMarketplaceCurrency("USD");
  });
})();
