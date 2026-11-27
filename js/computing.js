(() => {
  "use strict";

  const initMobileNav = () => {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("primary-navigation");

    if (!toggle || !nav) {
      return;
    }

    const setMenuOpen = (isOpen) => {
      nav.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    };

    toggle.addEventListener("click", () => {
      const currentlyOpen = toggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!currentlyOpen);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setMenuOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 600 && nav.classList.contains("is-open")) {
        setMenuOpen(false);
      }
    });
  };

  const initMeetingDisclosure = () => {
    const disclosure = document.getElementById("next-meeting-disclosure");
    if (!disclosure) {
      return;
    }

    const summary = disclosure.querySelector("summary");
    if (!summary) {
      return;
    }

    const syncExpandedState = () => {
      summary.setAttribute("aria-expanded", String(disclosure.open));
    };

    syncExpandedState();
    disclosure.addEventListener("toggle", syncExpandedState);
  };

  const initSectionTabsKeyboard = () => {
    const tabLinks = Array.from(document.querySelectorAll(".section-tabs .tab-link"));
    if (tabLinks.length === 0) {
      return;
    }

    tabLinks.forEach((link, index) => {
      link.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
          return;
        }

        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (index + direction + tabLinks.length) % tabLinks.length;
        tabLinks[nextIndex].focus();
      });
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    initMobileNav();
    initMeetingDisclosure();
    initSectionTabsKeyboard();
  });
})();
