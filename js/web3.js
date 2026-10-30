(function () {
  "use strict";

  window.connectWallet = async function () {
    const button = document.getElementById("wallet-btn") || document.getElementById("nav-wallet-btn");
    if (!window.ethereum || typeof window.ethereum.request !== "function") {
      window.alert("No Ethereum wallet was detected. Install MetaMask or another compatible wallet and try again.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (!Array.isArray(accounts) || accounts.length === 0) {
        throw new Error("The wallet did not return an account.");
      }

      if (button) {
        const address = accounts[0];
        const label = address.slice(0, 6) + "..." + address.slice(-4);
        if (button.querySelector(".wallet-dot")) {
          button.lastChild.textContent = " " + label;
        } else {
          button.textContent = label;
        }
        button.classList.add("is-connected");
        button.setAttribute("aria-label", "Connected wallet " + address);
      }
    } catch (error) {
      if (error && error.code === 4001) {
        window.alert("Wallet connection was cancelled.");
        return;
      }
      console.error("Wallet connection failed:", error);
      window.alert("Could not connect to your wallet. Please unlock it and try again.");
    }
  };
})();
