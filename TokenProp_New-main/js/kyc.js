(function () {
  "use strict";

  const overlay = document.getElementById("kyc-modal-overlay");
  let countdownTimer = null;
  let returnFocus = null;

  function setError(id, message) {
    const element = document.getElementById(id);
    if (element) element.textContent = message || "";
  }

  function showStep(step) {
    document.querySelectorAll(".kyc-step-panel").forEach(function (panel) {
      panel.classList.toggle("active", panel.id === "kyc-step-" + step);
    });
    document.querySelectorAll(".kyc-step-dot").forEach(function (dot, index) {
      dot.classList.toggle("active", index < step);
    });
  }

  function setBadgeVerified() {
    document.querySelectorAll(".kyc-badge, #kyc-verify-card").forEach(function (badge) {
      badge.classList.remove("kyc-badge--unverified");
      badge.classList.add("kyc-badge--verified");
      if (badge.id === "kyc-verify-card") {
        const title = badge.querySelector("h3") || badge.querySelector(".kyc-card-title");
        if (title) title.textContent = "KYC: Demo Verified ✓";
        const status = badge.querySelector(".kyc-card-hint") || badge.querySelector("div[style*='Global Investment']");
        if (status) {
          status.textContent = "✓ Demo verification active; governance voting unlocked.";
          status.style.color = "#00d4a1";
        }
      } else {
        const label = badge.lastChild;
        if (label && label.nodeType === Node.TEXT_NODE) label.textContent = " Demo Verified";
      }
    });
    document.querySelectorAll(".voting-gate").forEach(function (gate) {
      gate.remove();
    });
    document.querySelectorAll(".kyc-gate-overlay").forEach(function (gate) {
      gate.hidden = true;
    });
    document.querySelectorAll(".voting-controls > button, .vote-btn").forEach(function (button) {
      button.disabled = false;
      button.classList.add("demo-vote-enabled");
    });
    window.dispatchEvent(new CustomEvent("tokenprop:kyc-verified"));
  }

  function showOverlay() {
    if (!overlay) {
      window.location.href = "dashboard.html";
      return;
    }
    returnFocus = document.activeElement;
    overlay.style.display = "flex";
    overlay.setAttribute("aria-hidden", "false");
    if (document.getElementById("kyc-wallet-addr")) {
      document.getElementById("kyc-wallet-addr").textContent = TokenPropApi.walletId();
    }
    document.getElementById("kyc-close-btn")?.focus();
  }

  function hideOverlay() {
    if (!overlay) return;
    overlay.style.display = "none";
    overlay.setAttribute("aria-hidden", "true");
    if (returnFocus && typeof returnFocus.focus === "function") returnFocus.focus();
  }

  function startResendCountdown(seconds) {
    const button = document.getElementById("kyc-resend-btn");
    const timer = document.getElementById("kyc-resend-timer");
    if (!button || !timer) return;
    window.clearInterval(countdownTimer);
    let remaining = seconds;
    button.disabled = true;
    timer.textContent = "(" + remaining + "s)";
    countdownTimer = window.setInterval(function () {
      remaining -= 1;
      timer.textContent = remaining > 0 ? "(" + remaining + "s)" : "";
      if (remaining <= 0) {
        window.clearInterval(countdownTimer);
        button.disabled = false;
      }
    }, 1000);
  }

  async function sendOtp() {
    setError("kyc-aadhaar-error", "");
    setError("kyc-otp-error", "");
    const email = document.getElementById("kyc-email")?.value.trim() || "";
    const sendButton = document.getElementById("kyc-send-btn");
    if (sendButton) sendButton.disabled = true;
    try {
      const result = await TokenPropApi.post("/api/kyc/send-otp", {
        email: email,
        wallet: TokenPropApi.walletId()
      });
      showStep(2);
      const info = document.getElementById("kyc-otp-info");
      if (info) info.textContent = "Demo code: " + result.demoOtp + ". No email or SMS was sent.";
      startResendCountdown(15);
      document.querySelector(".kyc-otp-digit")?.focus();
    } catch (error) {
      setError("kyc-aadhaar-error", error.message);
      if (sendButton) sendButton.disabled = false;
    }
  }

  async function verifyOtp() {
    const otp = [...document.querySelectorAll(".kyc-otp-digit")].map(function (input) {
      return input.value;
    }).join("");
    const verifyButton = document.getElementById("kyc-verify-btn");
    setError("kyc-otp-error", "");
    if (!/^\d{6}$/.test(otp)) {
      setError("kyc-otp-error", "Enter all 6 digits of the demo code.");
      return;
    }
    if (verifyButton) verifyButton.disabled = true;
    try {
      const result = await TokenPropApi.post("/api/kyc/verify-otp", {
        wallet: TokenPropApi.walletId(),
        otp: otp
      });
      if (!result.verified) throw new Error("Demo verification was not completed.");
      window.sessionStorage.setItem("tokenprop-demo-kyc", "verified");
      setBadgeVerified();
      const successMessage = document.getElementById("kyc-success-msg");
      if (successMessage) successMessage.textContent = "Demo verification complete. Simulated voting and whitelisted actions are now enabled.";
      const txLink = document.getElementById("kyc-tx-hash");
      if (txLink) {
        txLink.textContent = "Demo verification active";
        txLink.removeAttribute("href");
      }
      showStep(3);
    } catch (error) {
      setError("kyc-otp-error", error.message);
    } finally {
      if (verifyButton) verifyButton.disabled = false;
    }
  }

  function setupOtpInputs() {
    const inputs = [...document.querySelectorAll(".kyc-otp-digit")];
    inputs.forEach(function (input, index) {
      input.inputMode = "numeric";
      input.addEventListener("input", function () {
        input.value = input.value.replace(/\D/g, "").slice(-1);
        if (input.value && inputs[index + 1]) inputs[index + 1].focus();
        const verifyButton = document.getElementById("kyc-verify-btn");
        if (verifyButton) verifyButton.disabled = inputs.some(function (item) { return !item.value; });
      });
      input.addEventListener("keydown", function (event) {
        if (event.key === "Backspace" && !input.value && inputs[index - 1]) inputs[index - 1].focus();
      });
      input.addEventListener("paste", function (event) {
        const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, inputs.length);
        if (!pasted) return;
        event.preventDefault();
        inputs.forEach(function (digit, digitIndex) { digit.value = pasted[digitIndex] || ""; });
        const verifyButton = document.getElementById("kyc-verify-btn");
        if (verifyButton) verifyButton.disabled = pasted.length !== inputs.length;
        inputs[Math.min(pasted.length, inputs.length - 1)].focus();
      });
    });
  }

  function setup() {
    if (overlay) {
      overlay.style.display = "none";
      overlay.setAttribute("aria-hidden", "true");
      overlay.addEventListener("click", function (event) {
        if (event.target === overlay) hideOverlay();
      });
    }

    document.querySelectorAll(".kyc-badge, #kyc-verify-card, .kyc-gate-btn").forEach(function (button) {
      button.addEventListener("click", showOverlay);
    });
    document.querySelectorAll(".kyc-close-btn, .kyc-success-done-btn").forEach(function (button) {
      button.addEventListener("click", hideOverlay);
    });
    document.getElementById("kyc-send-btn")?.addEventListener("click", sendOtp);
    document.getElementById("kyc-resend-btn")?.addEventListener("click", sendOtp);
    document.getElementById("kyc-verify-btn")?.addEventListener("click", verifyOtp);
    setupOtpInputs();
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && overlay && overlay.style.display !== "none") hideOverlay();
    });

    if (window.sessionStorage.getItem("tokenprop-demo-kyc") === "verified") {
      setBadgeVerified();
    } else {
      TokenPropApi.kycStatus().then(function (result) {
        if (result.verified) setBadgeVerified();
      }).catch(function (error) {
        console.error("Could not retrieve demo verification status:", error);
      });
    }
  }

  window.openKYCModal = showOverlay;
  window.closeKYCModal = hideOverlay;
  window.sendKYCOTP = sendOtp;
  window.resendOTP = sendOtp;
  window.verifyKYCOTP = verifyOtp;

  document.addEventListener("DOMContentLoaded", setup);
})();
