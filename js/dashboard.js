(function () {
  "use strict";

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function renderPortfolio(portfolio) {
    setText("ov-total-value", "$" + portfolio.totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 }));
    setText("ov-total-tokens", portfolio.totalTokens.toLocaleString("en-US"));
    setText("ov-properties", portfolio.propertyCount);
    setText("ov-monthly", "$" + portfolio.monthlyIncome.toLocaleString("en-US", { maximumFractionDigits: 0 }));
    setText("ov-gain", "+" + portfolio.gainPercent.toFixed(1) + "%");
    setText("ov-poi", portfolio.poi.score + "/100");
    setText("ov-rank", "Rank #128");
    setText("gov-score-num", portfolio.poi.score);
    setText("gov-rank", "Rank #128 of 12,480 members");
    setText("dash-greeting-name", portfolio.displayName || "Demo Investor");

    // Animate circular ring for governance score
    const ringFill = document.querySelector(".gov-mini-ring .ring-fill");
    if (ringFill) {
      const circumference = 2 * Math.PI * 45; // ~282.74
      ringFill.style.strokeDasharray = circumference;
      const offset = circumference * (1 - (portfolio.poi.score || 76) / 100);
      ringFill.style.strokeDashoffset = offset;
    }

    // Render Holdings with rich cards
    const holdings = document.getElementById("holdings-list");
    if (holdings && portfolio.holdings) {
      holdings.innerHTML = portfolio.holdings.map(function (holding) {
        const gainVal = holding.gain || ((holding.currentPrice - holding.averagePrice) * holding.tokens);
        const gainPct = holding.averagePrice ? ((holding.currentPrice - holding.averagePrice) / holding.averagePrice * 100).toFixed(1) : "0.0";
        const isPos = gainVal >= 0;

        return '<article class="holding-item glass-card">' +
          '<div>' +
            '<div class="holding-name">🏢 ' + holding.property + '</div>' +
            '<p class="holding-detail">📍 ' + holding.location + ' &bull; <strong>' + holding.tokens + ' tokens</strong> (avg $' + holding.averagePrice + ')</p>' +
          '</div>' +
          '<div class="holding-value">' +
            '<div class="holding-price">$' + (holding.value || (holding.tokens * (holding.currentPrice || 100))).toLocaleString("en-US", { maximumFractionDigits: 0 }) + '</div>' +
            '<div class="holding-gain ' + (isPos ? 'positive' : 'negative') + '">' +
              (isPos ? '▲ +' : '▼ ') + gainPct + '% ($' + Math.abs(gainVal).toFixed(0) + ')' +
            '</div>' +
          '</div>' +
        '</article>';
      }).join("");
    }

    // Render Timeline with icons & badges
    const timeline = document.getElementById("timeline-list");
    if (timeline && portfolio.activities) {
      const typeIcons = {
        "Rent received": { icon: "💰", class: "rent" },
        "Vote cast": { icon: "🗳️", class: "vote" },
        "Tokens purchased": { icon: "🛒", class: "buy" },
        "Secondary sale": { icon: "🤝", class: "sell" }
      };

      timeline.innerHTML = portfolio.activities.map(function (activity) {
        const conf = typeIcons[activity.type] || { icon: "📌", class: "buy" };
        return '<div class="timeline-item">' +
          '<div class="timeline-icon ' + conf.class + '">' + conf.icon + '</div>' +
          '<div class="timeline-content">' +
            '<div class="timeline-type">' + activity.type + '</div>' +
            '<div class="timeline-detail">' + activity.detail + '</div>' +
            '<div class="timeline-meta">' +
              '<span>' + activity.date + '</span>' +
              '&bull;' +
              '<span class="amount">' + activity.amount + '</span>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join("");
    }

    // Monthly income box
    const incAmount = document.getElementById("income-amount");
    if (incAmount) {
      incAmount.textContent = "$" + (portfolio.monthlyIncome || 612.5).toLocaleString("en-US", { maximumFractionDigits: 1 });
    }

    // Chart.js render
    if (window.Chart) {
      const canvas = document.getElementById("portfolio-chart");
      if (canvas) {
        const ctx = canvas.getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, 0, 240);
        gradient.addColorStop(0, "rgba(66, 184, 255, 0.35)");
        gradient.addColorStop(1, "rgba(66, 184, 255, 0.0)");

        new window.Chart(canvas, {
          type: "line",
          data: {
            labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
            datasets: [{
              label: "Portfolio Value (USD)",
              data: [
                Math.round(portfolio.totalValue * 0.88),
                Math.round(portfolio.totalValue * 0.91),
                Math.round(portfolio.totalValue * 0.93),
                Math.round(portfolio.totalValue * 0.96),
                Math.round(portfolio.totalValue * 0.98),
                Math.round(portfolio.totalValue)
              ],
              borderColor: "#42b8ff",
              borderWidth: 2.5,
              backgroundColor: gradient,
              fill: true,
              tension: 0.38,
              pointBackgroundColor: "#42b8ff",
              pointBorderColor: "#fff",
              pointBorderWidth: 1.5,
              pointRadius: 4,
              pointHoverRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: "#172238",
                titleColor: "#f4f7ff",
                bodyColor: "#00d4a1",
                borderColor: "rgba(165,190,235,.2)",
                borderWidth: 1,
                callbacks: {
                  label: function (ctx) {
                    return " $" + ctx.parsed.y.toLocaleString("en-US");
                  }
                }
              }
            },
            scales: {
              x: {
                grid: { color: "rgba(255,255,255,0.04)" },
                ticks: { color: "#8290a8", font: { size: 11 } }
              },
              y: {
                grid: { color: "rgba(255,255,255,0.04)" },
                ticks: {
                  color: "#8290a8",
                  font: { size: 11 },
                  callback: function (val) { return "$" + (val / 1000).toFixed(0) + "k"; }
                }
              }
            }
          }
        });
      }
    }
  }

  function renderAlerts(alerts) {
    const container = document.getElementById("dash-insurance-alerts");
    if (!container) return;
    if (!alerts || !alerts.length) {
      container.innerHTML = '<div class="no-alerts">🛡️ No simulated active disaster alerts. All properties running smoothly.</div>';
      return;
    }
    container.innerHTML = alerts.map(function (alert) {
      const sev = (alert.severity || "low").toLowerCase();
      return '<div class="alert-item ' + sev + '">' +
        '<div>' +
          '<span class="alert-severity ' + sev + '">' + sev + '</span>' +
          '<strong>' + alert.type + '</strong>' +
        '</div>' +
        '<div style="font-size:0.75rem;margin-top:4px;opacity:0.85;">' + alert.region + ' &bull; Status: ' + alert.status + '</div>' +
      '</div>';
    }).join("");
  }

  async function runPortfolioSimulation() {
    const ids = [1, 2, 3];
    const weights = ids.map(function (id, index) {
      const value = Number(document.getElementById("alloc-slider-" + (index + 1))?.value || 0);
      setText("slider-val-" + (index + 1), value + "%");
      return { id: id, weight: value };
    });
    try {
      const result = await TokenPropApi.post("/api/portfolio/simulate", { allocations: weights });
      const summary = result.simulationSummary;
      setText("sim-yield", summary.expectedAnnualYield);
      setText("sim-risk", summary.compositeRiskScore + " / 100");
      setText("sim-div", summary.diversificationScore + " / 100");
      setText("sim-rating", summary.rating + " ✓");
      setText("sim-rec", result.recommendation);
    } catch (error) {
      console.error("Portfolio simulation failed:", error);
      setText("sim-rec", "Could not calculate the demo scenario: " + error.message);
    }
  }

  // Real-time live streaming rent counter animation
  let dashStreamVal = 0.04821040;
  setInterval(function () {
    dashStreamVal += 0.00000035;
    const el = document.getElementById("dash-stream-val");
    if (el) el.innerText = dashStreamVal.toFixed(8) + " POL";
  }, 120);

  document.addEventListener("DOMContentLoaded", function () {
    TokenPropApi.portfolio().then(function (result) {
      renderPortfolio(result.portfolio);
    }).catch(function (error) {
      console.error("Could not load simulated portfolio:", error);
      setText("holdings-list", "Could not load demo portfolio: " + error.message);
    });

    TokenPropApi.alerts().then(function (result) {
      renderAlerts(result.alerts);
    }).catch(function (error) {
      console.error("Could not load simulated property alerts:", error);
      setText("dash-insurance-alerts", "Could not load demo alerts: " + error.message);
    });

    window.runPortfolioSimulation = runPortfolioSimulation;
    runPortfolioSimulation();
  });
})();
