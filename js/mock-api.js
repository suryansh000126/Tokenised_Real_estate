(function () {
  "use strict";

  async function request(url, options) {
    const response = await fetch(url, options);
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "The demo service returned an error.");
    }
    return payload;
  }

  function post(url, body) {
    return request(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  }

  function walletId() {
    const account = window.ethereum && window.ethereum.selectedAddress;
    return account || window.sessionStorage.getItem("tokenprop-demo-wallet") || "demo-wallet";
  }

  window.TokenPropApi = Object.freeze({
    request: request,
    post: post,
    walletId: walletId,
    properties: function () { return request("/api/properties"); },
    property: function (id) { return request("/api/properties/" + encodeURIComponent(id)); },
    rentEstimate: function (id) { return request("/api/rentcast/" + encodeURIComponent(id)); },
    alerts: function (id) { return request("/api/disaster-alerts?propertyId=" + encodeURIComponent(id)); },
    polPrice: function () { return request("/api/price/pol"); },
    portfolio: function () { return request("/api/portfolio/demo"); },
    kycStatus: function () { return post("/api/kyc/status", { wallet: walletId() }); }
  });
})();
