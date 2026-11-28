(() => {
  "use strict";

  const COMPUTING_EVENT = Object.freeze({
    title: "Code Together",
    dateTime: "Tue, 1 Dec · 4:00–5:00 pm",
    location: "IT Lab 2",
    duration: "60 minutes",
    note: "Bring a laptop if you have one."
  });

  window.UniSyncComputing = Object.freeze({
    event: COMPUTING_EVENT
  });

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

    setMenuOpen(false);

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
      if (window.innerWidth > 640 && nav.classList.contains("is-open")) {
        setMenuOpen(false);
      }
    });
  };

  const renderEventDetails = (container) => {
    const fieldMap = {
      title: COMPUTING_EVENT.title,
      dateTime: COMPUTING_EVENT.dateTime,
      location: COMPUTING_EVENT.location,
      duration: COMPUTING_EVENT.duration,
      note: COMPUTING_EVENT.note
    };

    Object.entries(fieldMap).forEach(([field, value]) => {
      const target = container.querySelector(`[data-event-field="${field}"]`);
      if (target) {
        target.textContent = value;
      }
    });
  };

  const initMeetingDisclosure = () => {
    const disclosure = document.getElementById("next-meeting-disclosure");
    if (!disclosure) {
      return;
    }

    renderEventDetails(disclosure);

    // Keep expanded on page load while letting the user collapse/expand it natively.
    disclosure.open = true;
  };

  const initEventCards = () => {
    const eventCards = document.querySelectorAll("[data-computing-event]");
    eventCards.forEach((card) => {
      renderEventDetails(card);
    });
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
    initEventCards();
    initSectionTabsKeyboard();
  });
})();
