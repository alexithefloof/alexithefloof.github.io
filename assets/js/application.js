
"use strict";

(async function () {
    const script = document.querySelector('script[src$="assets/js/layout.js"]');

    if (!script) {
        console.error("Layout script could not identify its own path.");
        return;
    }

    // Determine the site root from /assets/js/layout.js.
    const scriptURL = new URL(script.src, window.location.href);
    const scriptPath = scriptURL.pathname;
    const marker = "/assets/js/layout.js";
    const markerIndex = scriptPath.lastIndexOf(marker);

    if (markerIndex === -1) {
        console.error("Unexpected layout.js location:", scriptPath);
        return;
    }

    const siteRoot = scriptPath.slice(0, markerIndex);

    function siteURL(path) {
        return `${siteRoot}/${path}`.replace(/\/+/g, "/");
    }

    async function loadComponent(name, selector) {
        const target = document.querySelector(selector);

        if (!target) {
            return;
        }

        try {
            const response = await fetch(siteURL(`components/${name}`));

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            target.innerHTML = await response.text();
        } catch (error) {
            console.error(`Could not load ${name}:`, error);
        }
    }

    await Promise.all([
        loadComponent("_header", "[data='header']"),
        loadComponent("_footer", "[data='footer']")
    ]);

    // Fix internal links for root sites and repository-based GitHub Pages.
    document.querySelectorAll("[data-site-href]").forEach(function (link) {
        const path = link.dataset.siteHref;
        link.href = siteURL(path);
    });

    // Update the copyright year.
    document.querySelectorAll("[current-year]").forEach(function (element) {
        element.textContent = new Date().getFullYear();
    });

    // Mark the active navigation link.
    const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
    const currentHash = window.location.hash;

    document.querySelectorAll(".site-header [data-site-href]").forEach(function (link) {
        const target = new URL(link.href, window.location.href);
        const targetPath = target.pathname.replace(/\/+$/, "") || "/";

        const isHome = targetPath === siteRoot + "/" ||
            targetPath === siteRoot + "/" ||
            (siteRoot === "" && targetPath === "/") ||
            (siteRoot === "" && targetPath === "/");

        const isCurrentPage = targetPath === currentPath ||
            (isHome && (currentPath === siteRoot || currentPath === siteRoot + "/"));

        const isCurrentSection = isCurrentPage &&
            target.hash &&
            target.hash === currentHash;

        if (isCurrentSection || (isCurrentPage && !target.hash && !currentHash)) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });
});

/* Modals */
document.addEventListener("DOMContentLoaded", function () {
    const modalElement = document.getElementById("project-modal");
    if (!modalElement || !window.bootstrap) return;

    const projectModal = bootstrap.Modal.getOrCreateInstance(modalElement);

    const modalTag = document.getElementById("modal-tag");
    const modalDate = document.getElementById("modal-date");
    const modalTitle = document.getElementById("modal-title");
    const modalImage = document.getElementById("modal-image");
    const modalDescription = document.getElementById("modal-description");

    function openProject(card) {
        const title = card.querySelector(".project-title")?.textContent.trim() || "Project";
        const categories = card.querySelectorAll(".project-category");
        const date = card.querySelector(".project-date")?.textContent.trim() || "";
        const image = card.querySelector(".project-image");
        const description = card.querySelector(".project-full-description");

        // Display all categories as individual badges
        modalTag.replaceChildren();

        categories.forEach(function (category) {
            const badge = document.createElement("span");
            badge.className = "modal-tag badge";
            badge.textContent = category.textContent.trim();
            modalTag.appendChild(badge);
        });

        modalDate.textContent = date;
        modalDate.hidden = !date;
        modalTitle.textContent = title;

        if (image) {
            modalImage.src = image.src;
            modalImage.alt = image.alt || title;
            modalImage.hidden = false;
        } else {
            modalImage.hidden = true;
        }

        modalDescription.innerHTML = description
            ? description.innerHTML
            : (card.querySelector(".project-excerpt")?.innerHTML || "");

        projectModal.show();
    }

    document.querySelectorAll(".portfolio-card").forEach(function (card) {
        card.addEventListener("click", function (event) {
            if (event.target.closest("a, button, input, select, textarea, [data-bs-dismiss]")) return;

            openProject(card);
        });

        card.addEventListener("keydown", function (event) {
            if (event.target !== card) return;

            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openProject(card);
            }
        });
    });
});