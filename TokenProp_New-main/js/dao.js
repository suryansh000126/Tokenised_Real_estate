(function () {
  "use strict";

  const proposals = [
    {
      id: "TP-2026-001",
      title: "Develop Rooftop Garden & Lounge — Skyline Residences",
      description: "Convert the unused rooftop space into a community garden with seating areas and panoramic Manhattan skyline views, projected to boost rental yields by 3.5%–5%.",
      property: "Skyline Residences",
      category: "Development",
      author: "0xA3f...8d2E",
      endDate: "2026-11-12",
      status: "active",
      quorum: "Met (78%)",
      votes: { for: 6420, against: 1230, abstain: 350 }
    },
    {
      id: "TP-2026-002",
      title: "Lease Ground Floor to Premium Organic Market",
      description: "Approve leasing the vacant ground floor commercial space of Marina Bay Hub to a high-end specialty grocery brand for a 5-year lease at $28,000/month with 3% annual escalation.",
      property: "Marina Bay Commercial Hub",
      category: "Leasing",
      author: "0xB7c...2f4A",
      endDate: "2026-11-15",
      status: "active",
      quorum: "Met (84%)",
      votes: { for: 8900, against: 2100, abstain: 800 }
    },
    {
      id: "TP-2026-003",
      title: "Install 200kW Solar Microgrid — Tokyo Tech Park",
      description: "Fund a state-of-the-art rooftop solar array projected to reduce campus energy costs by 40% and qualify the property for municipal green building tax credits.",
      property: "Tokyo Tech Park",
      category: "Sustainability",
      author: "0xC1d...6g8B",
      endDate: "2026-11-18",
      status: "active",
      quorum: "Met (92%)",
      votes: { for: 15200, against: 3800, abstain: 1200 }
    },
    {
      id: "TP-2026-004",
      title: "Upgrade HVAC Energy Systems — Austin Tech Campus",
      description: "Install smart AI-driven HVAC controls to lower peak electric demand and enhance tenant comfort across all three tech campus buildings.",
      property: "Austin Tech Innovation Campus",
      category: "Operations",
      author: "0x91E...A530",
      endDate: "2026-10-12",
      status: "passed",
      quorum: "Met (89%)",
      votes: { for: 11800, against: 2200, abstain: 700 }
    },
    {
      id: "TP-2026-005",
      title: "Expand Underground Parking — Marina Bay Hub",
      description: "Review proposal for subterranean parking expansion. Community voted against due to high capital expenditure and preference for public transit incentives.",
      property: "Marina Bay Commercial Hub",
      category: "Operations",
      author: "0x4F2...c061",
      endDate: "2026-10-08",
      status: "rejected",
      quorum: "Met (71%)",
      votes: { for: 3100, against: 7400, abstain: 500 }
    }
  ];

  const poiFactors = [
    { name: "Ownership Tokens", weight: 40, score: 72, icon: "🪙" },
    { name: "Activity & Staking", weight: 35, score: 85, icon: "⚡" },
    { name: "Holding Duration", weight: 25, score: 68, icon: "⏱️" }
  ];

  let selectedFilter = "active";
  let demoVerified = window.sessionStorage.getItem("tokenprop-demo-kyc") === "verified";
  const userVotes = new Map(); // proposalId -> voteType ("for" | "against" | "abstain")

  function percentage(value, total) {
    return total === 0 ? 0 : (value / total) * 100;
  }

  function formatVotes(value) {
    return value.toLocaleString("en-US");
  }

  function showToast(message) {
    const toast = document.getElementById("vote-toast");
    const text = document.getElementById("toast-text");
    if (toast && text) {
      text.textContent = message;
      toast.classList.add("is-visible");
      setTimeout(() => {
        toast.classList.remove("is-visible");
      }, 3000);
    }
  }

  function proposalCard(proposal) {
    const total = proposal.votes.for + proposal.votes.against + proposal.votes.abstain;
    const forPct = Math.round(percentage(proposal.votes.for, total));
    const againstPct = Math.round(percentage(proposal.votes.against, total));
    const abstainPct = Math.max(0, 100 - forPct - againstPct);

    const myVote = userVotes.get(proposal.id);
    const hasVoted = Boolean(myVote);
    const isActive = proposal.status === "active";

    const rowsHtml = [
      { key: "for", icon: "👍", label: "For", count: proposal.votes.for, pct: forPct },
      { key: "against", icon: "👎", label: "Against", count: proposal.votes.against, pct: againstPct },
      { key: "abstain", icon: "🙌", label: "Abstain", count: proposal.votes.abstain, pct: abstainPct }
    ].map(v => {
      const fillPct = percentage(v.count, total);
      return '<div class="vote-result vote-result--' + v.key + '">' +
        '<div class="vote-result-heading">' +
          '<span>' + v.icon + ' ' + v.label + ' (' + formatVotes(v.count) + ' votes)</span>' +
          '<strong>' + v.pct + '%</strong>' +
        '</div>' +
        '<div class="vote-bar">' +
          '<span class="vote-bar-fill" style="width:' + fillPct.toFixed(1) + '%"></span>' +
        '</div>' +
      '</div>';
    }).join("");

    let statusPillClass = "proposal-status--active";
    if (proposal.status === "passed") statusPillClass = "proposal-status--passed";
    if (proposal.status === "rejected") statusPillClass = "proposal-status--rejected";

    let controlsHtml = "";
    if (isActive) {
      if (!demoVerified) {
        controlsHtml = '<div class="voting-controls">' +
          '<div class="voting-gate">' +
            '<span>🔒 KYC Verification required to cast weighted votes</span>' +
            '<button type="button" class="voting-gate-btn" data-verify-identity>Verify KYC Now</button>' +
          '</div>' +
          '<button type="button" class="vote-btn vote-btn--for" disabled>👍 Vote For</button>' +
          '<button type="button" class="vote-btn vote-btn--against" disabled>👎 Vote Against</button>' +
          '<button type="button" class="vote-btn vote-btn--abstain" disabled>🙌 Abstain</button>' +
        '</div>';
      } else if (hasVoted) {
        controlsHtml = '<div class="voting-controls" style="grid-template-columns: 1fr;">' +
          '<div style="text-align:center;padding:8px 0;font-size:0.82rem;color:#00d4a1;font-weight:750;">' +
            '✓ You voted <strong style="text-transform:uppercase;">' + myVote + '</strong> with 76 POI voting power' +
          '</div>' +
        '</div>';
      } else {
        controlsHtml = '<div class="voting-controls">' +
          '<button type="button" class="vote-btn vote-btn--for" data-vote="for">👍 Vote For</button>' +
          '<button type="button" class="vote-btn vote-btn--against" data-vote="against">👎 Vote Against</button>' +
          '<button type="button" class="vote-btn vote-btn--abstain" data-vote="abstain">🙌 Abstain</button>' +
        '</div>';
      }
    } else {
      controlsHtml = '<div style="padding-top:14px;border-top:1px solid rgba(255,255,255,.05);font-size:0.78rem;color:var(--text-muted);display:flex;justify-content:space-between;">' +
        '<span>Voting concluded on ' + proposal.endDate + '</span>' +
        '<span style="font-weight:700;color:' + (proposal.status === "passed" ? "#7eacff" : "#ff777d") + '">Outcome: ' + proposal.status.toUpperCase() + '</span>' +
      '</div>';
    }

    return '<article class="proposal-card" data-proposal-id="' + proposal.id + '">' +
      '<div class="proposal-topline">' +
        '<div style="display:flex;gap:8px;align-items:center;">' +
          '<span class="proposal-id-badge">' + proposal.id + '</span>' +
          '<span class="proposal-category-pill">' + proposal.category + '</span>' +
        '</div>' +
        '<span class="proposal-status ' + statusPillClass + '">' + proposal.status + '</span>' +
      '</div>' +
      '<h3 class="proposal-title">' + proposal.title + '</h3>' +
      '<p class="proposal-description">' + proposal.description + '</p>' +
      '<div class="proposal-meta">' +
        '<span class="proposal-meta-item">🏢 <strong>' + proposal.property + '</strong></span>' +
        '<span class="proposal-meta-item">👤 Author: <strong>' + proposal.author + '</strong></span>' +
        '<span class="proposal-meta-item">🗓️ Ends: <strong>' + proposal.endDate + '</strong></span>' +
        '<span class="proposal-meta-item">⚖️ Quorum: <strong>' + proposal.quorum + '</strong></span>' +
      '</div>' +
      '<div class="vote-results">' + rowsHtml + '</div>' +
      controlsHtml +
    '</article>';
  }

  function renderProposals(filter) {
    selectedFilter = filter || selectedFilter;
    const list = document.getElementById("proposals-list");
    if (!list) return;

    const visible = selectedFilter === "all"
      ? proposals
      : proposals.filter(p => p.status === selectedFilter);

    if (visible.length === 0) {
      list.innerHTML = '<div class="empty-proposals">There are no ' + selectedFilter + ' proposals currently.</div>';
      return;
    }

    list.innerHTML = '<div class="proposal-list">' + visible.map(proposalCard).join("") + '</div>';
  }

  function renderPoi() {
    const score = Math.round(poiFactors.reduce((sum, f) => sum + (f.score * f.weight) / 100, 0));
    const scoreEl = document.getElementById("poi-score-num");
    if (scoreEl) scoreEl.textContent = String(score);

    const ringFill = document.querySelector(".poi-ring .ring-fill");
    if (ringFill) {
      const circumference = 408.4;
      ringFill.style.strokeDashoffset = String(circumference * (1 - score / 100));
    }

    const breakdownEl = document.getElementById("poi-breakdown");
    if (breakdownEl) {
      breakdownEl.innerHTML = poiFactors.map(f => {
        return '<div class="poi-breakdown-item">' +
          '<div class="poi-factor">' +
            '<span class="poi-factor-icon">' + f.icon + '</span>' +
            '<div>' +
              '<span class="poi-factor-name">' + f.name + '</span>' +
              '<span class="poi-factor-weight">Weight: ' + f.weight + '%</span>' +
            '</div>' +
          '</div>' +
          '<strong class="poi-factor-score">' + f.score + '/100</strong>' +
        '</div>';
      }).join("");
    }
  }

  function renderStats() {
    const body = document.getElementById("dao-stats-body");
    if (!body) return;

    const activeCount = proposals.filter(p => p.status === "active").length;
    const passedCount = proposals.filter(p => p.status === "passed").length;
    const totalVotes = proposals.reduce((sum, p) => sum + p.votes.for + p.votes.against + p.votes.abstain, 0);

    const rows = [
      ["Total Members", "12,480"],
      ["Active Proposals", String(activeCount)],
      ["Proposals Passed", String(passedCount)],
      ["Total Votes Cast", totalVotes.toLocaleString("en-US")],
      ["Treasury Assets", "$2.4M POL"],
      ["Avg Quorum Participation", "79.2%"]
    ];

    body.innerHTML = rows.map(r => {
      return '<div class="dao-stat-row">' +
        '<span>' + r[0] + '</span>' +
        '<strong>' + r[1] + '</strong>' +
      '</div>';
    }).join("");
  }

  function setupFilters() {
    const tabs = document.querySelector(".proposals-tabs");
    if (!tabs) return;
    tabs.addEventListener("click", function (event) {
      const btn = event.target.closest("button[data-tab]");
      if (!btn) return;
      tabs.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderProposals(btn.dataset.tab);
    });
  }

  function setupVotingListener() {
    const list = document.getElementById("proposals-list");
    if (!list) return;

    list.addEventListener("click", function (e) {
      if (e.target.closest("[data-verify-identity]")) {
        if (typeof window.openKYCModal === "function") {
          window.openKYCModal();
        }
        return;
      }

      const voteBtn = e.target.closest("[data-vote]");
      if (!voteBtn || voteBtn.disabled) return;

      const card = voteBtn.closest(".proposal-card");
      if (!card) return;
      const propId = card.dataset.proposalId;
      const proposal = proposals.find(p => p.id === propId);
      if (!proposal || proposal.status !== "active") return;

      const voteType = voteBtn.dataset.vote; // "for", "against", "abstain"
      // Add user's POI weight (76)
      proposal.votes[voteType] += 76;
      userVotes.set(propId, voteType);

      renderProposals(selectedFilter);
      renderStats();
      showToast("Voted " + voteType.toUpperCase() + " on " + proposal.id + "! 76 POI weight applied.");
    });
  }

  function setupProposalModal() {
    const openBtn = document.getElementById("btn-open-create-prop");
    const closeBtn = document.getElementById("prop-close-btn");
    const modal = document.getElementById("prop-modal-overlay");
    const form = document.getElementById("create-prop-form");

    if (openBtn && modal) {
      openBtn.addEventListener("click", () => modal.classList.add("active"));
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => modal.classList.remove("active"));
    }
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("active");
      });
    }

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const title = document.getElementById("prop-title").value.trim();
        const property = document.getElementById("prop-property").value;
        const category = document.getElementById("prop-category").value;
        const desc = document.getElementById("prop-desc").value.trim();

        if (!title || !desc) return;

        const newId = "TP-2026-00" + (proposals.length + 1);
        const newProp = {
          id: newId,
          title: title,
          description: desc,
          property: property,
          category: category,
          author: "0x71C7...3aF9 (You)",
          endDate: "2026-11-25",
          status: "active",
          quorum: "Just Started (0%)",
          votes: { for: 76, against: 0, abstain: 0 }
        };

        // User automatically votes 'for' their proposal
        userVotes.set(newId, "for");
        proposals.unshift(newProp);

        form.reset();
        modal.classList.remove("active");
        renderProposals(selectedFilter);
        renderStats();
        showToast("Proposal " + newId + " submitted successfully with your POI vote!");
      });
    }
  }

  function handleKycVerified() {
    demoVerified = true;
    window.sessionStorage.setItem("tokenprop-demo-kyc", "verified");
    const kycBtn = document.getElementById("kyc-open-btn");
    if (kycBtn) {
      kycBtn.classList.remove("kyc-badge--unverified");
      kycBtn.classList.add("kyc-badge--verified");
      kycBtn.innerHTML = '<span class="kyc-badge-dot" style="background:#00d4a1;box-shadow:0 0 8px #00d4a1;"></span> Demo Verified';
    }
    renderProposals(selectedFilter);
  }

  window.addEventListener("tokenprop:kyc-verified", handleKycVerified);

  document.addEventListener("DOMContentLoaded", function () {
    renderProposals("active");
    renderPoi();
    renderStats();
    setupFilters();
    setupVotingListener();
    setupProposalModal();

    if (demoVerified) {
      handleKycVerified();
    }
  });
})();
