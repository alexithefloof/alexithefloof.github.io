
"use strict";

document.addEventListener("DOMContentLoaded", async function () {
    async function loadComponent(name, selector) {
        const target = document.querySelector(selector);

        if (!target) {
            console.error(`Missing HTML placeholder: ${selector}`);
            return;
        }

        try {
            const response = await fetch(`./components/${name}.html`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.url}`);
            }

            target.innerHTML = await response.text();
        } catch (error) {
            console.error(`Could not load ${name}.html:`, error);
        }
    }

    await Promise.all([
        loadComponent("_header", '[data="header"]'),
        loadComponent("_footer", '[data="footer"]')
    ]);

    document.querySelectorAll("[current-year]").forEach(function (element) {
        element.textContent = new Date().getFullYear();
    });

    document.querySelectorAll("[data-site-href]").forEach(function (link) {
        link.href = new URL(link.dataset.siteHref, document.baseURI).href;
    });

    const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";

    document.querySelectorAll(".site-header [data-site-href]").forEach(function (link) {
        const target = new URL(link.href);
        const targetPath = target.pathname.replace(/\/+$/, "") || "/";

        if (targetPath === currentPath && !target.hash) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });

    document.dispatchEvent(new CustomEvent("site-layout-loaded"));
});
