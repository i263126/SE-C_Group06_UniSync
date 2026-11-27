/* Script for the Debate Society About page (i263131) */
(() => {
  "use strict";

  // Parse a "YYYY-MM-DD" date string in local time so timezones never shift the day.
  function parseLocalDate(dateText) {
    const parts = String(dateText || "").split("-");
    if (parts.length !== 3) {
      return null;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    const parsed = new Date(year, month - 1, day);

    if (
      Number.isNaN(parsed.getTime()) ||
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return null;
    }

    return parsed;
  }

  // Format a Date object like "Wed, 2 Dec".
  function formatShortDate(dateObj) {
    const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(dateObj);
    const day = new Intl.DateTimeFormat("en-GB", { day: "numeric" }).format(dateObj);
    const month = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(dateObj);
    return `${weekday}, ${day} ${month}`;
  }

  // Join start and end times cleanly, e.g. "3:00 pm" + "3:45 pm" -> "3:00–3:45 pm".
  function formatTimeRange(startTime, endTime) {
    const start = String(startTime || "").trim();
    const end = String(endTime || "").trim();

    if (!start) {
      return end;
    }
    if (!end) {
      return start;
    }

    const startMatch = start.match(/^(.+?)\s+(am|pm)$/i);
    const endMatch = end.match(/^(.+?)\s+(am|pm)$/i);

    if (startMatch && endMatch && startMatch[2].toLowerCase() === endMatch[2].toLowerCase()) {
      return `${startMatch[1]}\u2013${endMatch[1]} ${endMatch[2].toLowerCase()}`;
    }

    return `${start}\u2013${end}`;
  }

  // Find the meeting with the earliest valid date in the array.
  function findEarliestMeeting(meetings) {
    let earliest = null;
    let earliestTime = Infinity;

    for (const meeting of meetings) {
      const dateObj = parseLocalDate(meeting && meeting.date);
      if (!dateObj) {
        continue;
      }

      const timestamp = dateObj.getTime();
      if (timestamp < earliestTime) {
        earliestTime = timestamp;
        earliest = { meeting, dateObj };
      }
    }

    return earliest;
  }

  // Fill the #next-meeting paragraph safely using DOM nodes (never raw HTML).
  function renderNextMeeting() {
    const target = document.getElementById("next-meeting");
    if (!target) {
      return;
    }

    const societies = Array.isArray(window.UniSyncDebateData) ? window.UniSyncDebateData : [];
    const society = societies.find((item) => item && item.id === "debate") || societies[0];
    const meetings = society && Array.isArray(society.meetings) ? society.meetings : [];

    const result = findEarliestMeeting(meetings);
    if (!result) {
      target.textContent = "No meeting planned yet.";
      return;
    }

    const { meeting, dateObj } = result;
    const timeEl = document.createElement("time");
    timeEl.setAttribute("datetime", String(meeting.date));
    timeEl.textContent = formatShortDate(dateObj);

    const timeRange = formatTimeRange(meeting.startTime, meeting.endTime);
    const venue = String(meeting.venue || "").trim();

    // Build the readable text line with text nodes so data cannot inject HTML.
    const parts = [timeRange, venue].filter(Boolean);
    const suffix = parts.length > 0 ? ` \u00b7 ${parts.join(" \u00b7 ")}` : "";

    target.replaceChildren(timeEl, document.createTextNode(suffix));
  }

  // Toggle the mobile navigation menu on narrow screens (mirrors js/computing.js).
  function initMobileNav() {
    if (window.UniSyncShell) {
      return;
    }

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
  }

  // Allow Left/Right arrow keys to move focus between the section tabs.
  function initSectionTabsKeyboard() {
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
  }

  // Run page setup once the HTML document has loaded.
  document.addEventListener("DOMContentLoaded", () => {
    renderNextMeeting();
    initMobileNav();
    initSectionTabsKeyboard();
  });
})();
