(function () {
  "use strict";

  function renderFeaturedProperties() {
    const grid = document.getElementById("featured-grid");
    const data = window.TokenPropData;
    if (!grid || !data || !Array.isArray(data.properties)) return;

    grid.innerHTML = data.properties.slice(0, 3).map(function (property) {
      return '<article class="featured-property glass-card">' +
        '<div class="featured-property-art"><h3>' + property.name + '</h3></div>' +
        '<div class="featured-property-body">' +
          '<div class="featured-property-loc">📍 ' + property.location + '</div>' +
          '<div class="featured-property-data"><span>Token price</span><strong>$' + property.price.toFixed(2) + '</strong></div>' +
          '<div class="featured-property-data"><span>Expected yield</span><strong>' + property.yield.toFixed(1) + '%</strong></div>' +
          '<div class="featured-property-data"><span>Funding progress</span><strong>' + property.funded + '%</strong></div>' +
          '<a class="btn btn-secondary" href="property.html?id=' + property.id + '">View property</a>' +
        '</div>' +
      '</article>';
    }).join("");
  }

  function setupNavigation() {
    const toggle = document.getElementById("nav-toggle");
    const links = document.getElementById("nav-links");
    if (!toggle || !links) return;

    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", function () {
      const open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function setFinalStat(element) {
    const target = Number(element.dataset.count);
    if (!Number.isFinite(target)) return;
    element.textContent = (element.dataset.prefix || "") +
      target.toFixed(Number(element.dataset.decimal || 0)) +
      (element.dataset.suffix || "");
  }

  function animateStats() {
    const stats = document.querySelectorAll("[data-count]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stats.forEach(setFinalStat);
      return;
    }

    const observer = new IntersectionObserver(function (entries, currentObserver) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const target = Number(element.dataset.count);
        const decimals = Number(element.dataset.decimal || 0);
        if (!Number.isFinite(target)) return;
        const start = performance.now();
        const duration = 900;

        function frame(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          element.textContent = (element.dataset.prefix || "") +
            (target * eased).toFixed(decimals) +
            (element.dataset.suffix || "");
          if (progress < 1) window.requestAnimationFrame(frame);
        }

        window.requestAnimationFrame(frame);
        currentObserver.unobserve(element);
      });
    }, { threshold: 0.4 });

    stats.forEach(function (element) { observer.observe(element); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderFeaturedProperties();
    setupNavigation();
    animateStats();
  });
})();
