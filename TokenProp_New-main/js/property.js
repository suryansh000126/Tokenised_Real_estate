(function () {
  "use strict";

  let currentProperty = null;
  let selectedChain = null;
  let selectedQuantity = 1;

  function text(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function money(value) {
    return "$" + Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  function renderProperty(property, estimate, alerts) {
    currentProperty = property;
    document.title = property.name + " — TokenProp Demo";
    text("prop-title", property.name);
    text("prop-location", "📍 " + property.location);
    text("prop-desc-text", property.description);
    text("invest-price", money(property.price));
    text("invest-yield-val", property.yield.toFixed(1) + "%");
    text("invest-funded-val", property.funded + "%");
    text("invest-remaining-val", property.tokensAvailable.toLocaleString("en-US"));
    text("owner-name", property.owner);
    text("owner-props", "1");
    text("owner-total", money(property.price * property.tokenSupply));
    text("tax-gross", money(estimate.monthlyRent));
    text("tax-deducted", "−" + money(estimate.monthlyRent * 0.1));
    text("tax-net", money(estimate.monthlyRent * 0.9));

    const image = document.getElementById("gallery-img");
    if (image) {
      image.src = property.image;
      image.alt = property.name;
    }
    const tagContainer = document.getElementById("prop-tags");
    if (tagContainer) {
      tagContainer.textContent = property.type + " · " + property.risk + " risk · Simulated listing";
    }
    const breakdown = document.getElementById("ai-breakdown");
    const score = property.liquidity;
    if (breakdown) {
      breakdown.innerHTML = score.breakdown.map(function (item) {
        return '<div class="ai-breakdown-row"><span>' + item.name + ' (' + item.weight + '%)</span><strong>' + item.score + '</strong></div>';
      }).join("");
    }
    text("score-value", score.score);
    text("score-grade", score.grade);
    text("ai-liquidity-badge", score.badge);
    text("ai-expert-status", score.risk + " simulated risk · rule-based demo");
    text("ai-recommendation", score.recommendation);

    const details = document.getElementById("details-grid");
    if (details) {
      const rows = [
        ["Asset type", property.type],
        ["Token supply", property.tokenSupply.toLocaleString("en-US")],
        ["Tokens available", property.tokensAvailable.toLocaleString("en-US")],
        ["Monthly rental estimate", money(estimate.monthlyRent)],
        ["Comparable properties", estimate.comparableCount],
        ["Estimate confidence", Math.round(estimate.confidence * 100) + "% (simulated)"]
      ];
      details.innerHTML = rows.map(function (row) {
        return '<div class="detail-item"><span>' + row[0] + '</span><strong>' + row[1] + '</strong></div>';
      }).join("");
    }

    const alertsNode = document.getElementById("insurance-alerts");
    if (alertsNode) {
      alertsNode.innerHTML = alerts.length ? alerts.map(function (alert) {
        return '<div class="insurance-alert insurance-alert--' + alert.severity + '">' +
          '<strong>' + alert.severity.toUpperCase() + ' · ' + alert.type + '</strong>' +
          '<p>' + alert.region + ' · ' + alert.status + ' · Simulated alert only</p>' +
        '</div>';
      }).join("") : '<div class="no-alerts">No active simulated disaster alerts for this property.</div>';
    }

    text("ins-pool-balance", money(property.price * property.tokenSupply * 0.015));
    text("ins-premium-status", "Demo coverage");
    text("ins-next-due", "2026-12-01");
    updateBuyTotal();
  }

  function updateBuyTotal() {
    const quantityInput = document.getElementById("calc-qty");
    if (!currentProperty || !quantityInput) return;
    const quantity = Math.min(currentProperty.tokensAvailable, Math.max(1, Math.floor(Number(quantityInput.value) || 1)));
    quantityInput.value = String(quantity);
    selectedQuantity = quantity;
    text("calc-total", money(quantity * currentProperty.price));
  }

  function showMessage(message) {
    const info = document.getElementById("crosschain-info");
    if (info) info.textContent = message;
  }

  async function simulateBridgePurchase() {
    if (!currentProperty || !selectedChain) {
      showMessage("Choose a source chain first.");
      return;
    }
    const button = document.getElementById("btn-crosschain-buy");
    if (button) {
      button.disabled = true;
      button.textContent = "Simulating bridge…";
    }
    try {
      const result = await TokenPropApi.post("/api/purchases/bridge", {
        propertyId: currentProperty.id,
        chain: selectedChain,
        quantity: selectedQuantity
      });
      showMessage(result.message + " Demo reference: " + result.demoReference);
    } catch (error) {
      showMessage("Bridge demo failed: " + error.message);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "🌉 Bridge & Buy Tokens";
      }
    }
  }

  function selectChain(element, chain) {
    selectedChain = chain;
    document.querySelectorAll(".chain-option").forEach(function (option) {
      option.classList.toggle("active", option === element);
    });
    const button = document.getElementById("btn-crosschain-buy");
    if (button) button.disabled = false;
    showMessage(chain + " selected. This is a local bridge simulation; no wallet transaction will be sent.");
  }

  async function loadProperty() {
    const requestedId = new URLSearchParams(window.location.search).get("id") || "1";
    try {
      const results = await Promise.all([
        TokenPropApi.property(requestedId),
        TokenPropApi.rentEstimate(requestedId),
        TokenPropApi.alerts(requestedId)
      ]);
      renderProperty(results[0].property, results[1], results[2].alerts);
    } catch (error) {
      text("prop-title", "Property data unavailable");
      text("prop-desc-text", "Could not load the simulated property data: " + error.message);
      console.error("Property demo data failed to load:", error);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const qtyInput = document.getElementById("calc-qty");
    qtyInput?.addEventListener("input", updateBuyTotal);
    document.getElementById("calc-minus")?.addEventListener("click", function () {
      if (qtyInput) qtyInput.value = String(Math.max(1, Number(qtyInput.value || 1) - 1));
      updateBuyTotal();
    });
    document.getElementById("calc-plus")?.addEventListener("click", function () {
      if (qtyInput) qtyInput.value = String(Number(qtyInput.value || 1) + 1);
      updateBuyTotal();
    });
    document.getElementById("btn-crosschain-buy")?.addEventListener("click", simulateBridgePurchase);
    document.getElementById("buy-btn")?.addEventListener("click", function () {
      if (window.sessionStorage.getItem("tokenprop-demo-kyc") === "verified") {
        window.alert("Demo purchase complete. No wallet transaction or token transfer occurred.");
      } else {
        window.openKYCModal();
      }
    });
    window.selectChain = selectChain;
    window.initCrossChainPurchase = simulateBridgePurchase;
    loadProperty();
  });
})();
