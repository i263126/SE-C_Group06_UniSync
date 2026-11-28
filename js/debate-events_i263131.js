/* Script for the Debate Society Events page (i263131) */
(() => {
  "use strict";

  const STORAGE_KEY = "unisync_debate_events_filter_i263131";
  const MONTH_OPTIONS = [
    { value: "", label: "All months" },
    { value: "2026-12", label: "December 2026" }
  ];

  // Parse a "YYYY-MM-DD" string in local time so timezones never shift the day.
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

  // Read the Debate Society events array from window.UniSyncDebateData.
  function getEvents() {
    const societies = Array.isArray(window.UniSyncDebateData) ? window.UniSyncDebateData : [];
    const society = societies.find((item) => item && item.id === "debate") || societies[0];
    return society && Array.isArray(society.events) ? society.events.slice() : [];
  }

  // Sort events from earliest date to latest date.
  function sortEventsByDate(events) {
    return events.slice().sort((a, b) => {
      const dateA = parseLocalDate(a && a.date);
      const dateB = parseLocalDate(b && b.date);
      const timeA = dateA ? dateA.getTime() : Infinity;
      const timeB = dateB ? dateB.getTime() : Infinity;
      return timeA - timeB;
    });
  }

  // Save the user's current search text and month choice in localStorage.
  function saveFilterState(searchText, monthValue) {
    try {
      const data = JSON.stringify({
        search: searchText,
        month: monthValue
      });
      window.localStorage.setItem(STORAGE_KEY, data);
    } catch (_error) {
      // Ignore storage failures (e.g. private mode or disabled storage).
    }
  }

  // Load saved search text and month choice, or fall back to empty defaults on any error.
  function loadFilterState(validMonths) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { search: "", month: "" };
      }

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return { search: "", month: "" };
      }

      const search = typeof parsed.search === "string" ? parsed.search : "";
      const month =
        typeof parsed.month === "string" && validMonths.includes(parsed.month)
          ? parsed.month
          : "";

      return { search, month };
    } catch (_error) {
      // Ignore corrupted localStorage values and show the full list.
      return { search: "", month: "" };
    }
  }

  // Build the accessible search box and month dropdown above the event list.
  function createFilterControls() {
    const wrapper = document.createElement("div");
    wrapper.className = "event-controls";

    const searchGroup = document.createElement("div");
    searchGroup.className = "event-control";

    const searchLabel = document.createElement("label");
    searchLabel.className = "event-control-label";
    searchLabel.setAttribute("for", "event-search");
    searchLabel.textContent = "Search events";

    const searchInput = document.createElement("input");
    searchInput.className = "event-control-input";
    searchInput.id = "event-search";
    searchInput.type = "search";
    searchInput.placeholder = "Search by title or venue";

    searchGroup.append(searchLabel, searchInput);

    const monthGroup = document.createElement("div");
    monthGroup.className = "event-control";

    const monthLabel = document.createElement("label");
    monthLabel.className = "event-control-label";
    monthLabel.setAttribute("for", "event-month");
    monthLabel.textContent = "Filter by month";

    const monthSelect = document.createElement("select");
    monthSelect.className = "event-control-select";
    monthSelect.id = "event-month";

    for (const optionData of MONTH_OPTIONS) {
      const option = document.createElement("option");
      option.value = optionData.value;
      option.textContent = optionData.label;
      monthSelect.appendChild(option);
    }

    monthGroup.append(monthLabel, monthSelect);
    wrapper.append(searchGroup, monthGroup);

    return { wrapper, searchInput, monthSelect };
  }

  // Build one .event-card element safely using textContent (never raw HTML).
  function createEventCard(eventData) {
    const card = document.createElement("article");
    card.className = "event-card";

    const title = document.createElement("h2");
    title.className = "event-title";
    title.textContent = String((eventData && eventData.title) || "Untitled event");
    card.appendChild(title);

    const meta = document.createElement("p");
    meta.className = "event-meta";

    const dateObj = parseLocalDate(eventData && eventData.date);
    if (dateObj) {
      const dateEl = document.createElement("time");
      dateEl.setAttribute("datetime", String(eventData.date));
      dateEl.textContent = formatShortDate(dateObj);
      meta.appendChild(dateEl);
    } else if (eventData && eventData.date) {
      const dateFallback = document.createElement("span");
      dateFallback.textContent = String(eventData.date);
      meta.appendChild(dateFallback);
    }

    const timeRange = formatTimeRange(eventData && eventData.startTime, eventData && eventData.endTime);
    if (timeRange) {
      const timeEl = document.createElement("span");
      timeEl.textContent = timeRange;
      meta.appendChild(timeEl);
    }

    const venueText = String((eventData && eventData.venue) || "").trim();
    if (venueText) {
      const venueEl = document.createElement("span");
      venueEl.textContent = venueText;
      meta.appendChild(venueEl);
    }

    card.appendChild(meta);

    const noteText = String((eventData && eventData.note) || "").trim();
    if (noteText) {
      const noteEl = document.createElement("p");
      noteEl.className = "event-note";
      noteEl.textContent = noteText;
      card.appendChild(noteEl);
    }

    const rawCapacity = eventData ? eventData.capacity : undefined;
    const isFull =
      rawCapacity !== "" &&
      rawCapacity !== null &&
      rawCapacity !== undefined &&
      Number(rawCapacity) === 0;

    const statusEl = document.createElement("span");
    statusEl.className = isFull ? "event-status is-full" : "event-status";
    statusEl.textContent = isFull ? "Full" : "Upcoming";
    card.appendChild(statusEl);

    return card;
  }

  // Show an empty-state message inside a .event-empty div.
  function renderEmptyMessage(container, message) {
    const emptyBox = document.createElement("div");
    emptyBox.className = "event-empty";
    emptyBox.textContent = message;
    container.replaceChildren(emptyBox);
  }

  // Filter and render the events into #event-list.
  function renderEventList(container, sortedEvents, searchText, monthValue) {
    if (sortedEvents.length === 0) {
      renderEmptyMessage(container, "No events planned yet.");
      return;
    }

    const query = searchText.trim().toLowerCase();
    const filtered = sortedEvents.filter((eventData) => {
      const title = String((eventData && eventData.title) || "").toLowerCase();
      const venue = String((eventData && eventData.venue) || "").toLowerCase();
      const matchesSearch = !query || title.includes(query) || venue.includes(query);

      const dateStr = String((eventData && eventData.date) || "");
      const matchesMonth = !monthValue || dateStr.startsWith(`${monthValue}-`);

      return matchesSearch && matchesMonth;
    });

    if (filtered.length === 0) {
      renderEmptyMessage(container, "No events match your search.");
      return;
    }

    const cards = filtered.map((eventData) => createEventCard(eventData));
    container.replaceChildren(...cards);
  }

  // Set up the search/filter controls, restore saved filters, and render the events list.
  function initEventsPage() {
    const eventList = document.getElementById("event-list");
    if (!eventList || !eventList.parentNode) {
      return;
    }

    const sortedEvents = sortEventsByDate(getEvents());
    const { wrapper, searchInput, monthSelect } = createFilterControls();

    // Place the search and month filter controls directly above #event-list.
    eventList.parentNode.insertBefore(wrapper, eventList);

    const validMonths = MONTH_OPTIONS.map((option) => option.value);
    const savedState = loadFilterState(validMonths);
    searchInput.value = savedState.search;
    monthSelect.value = savedState.month;

    const updateList = () => {
      saveFilterState(searchInput.value, monthSelect.value);
      renderEventList(eventList, sortedEvents, searchInput.value, monthSelect.value);
    };

    searchInput.addEventListener("input", updateList);
    monthSelect.addEventListener("change", updateList);

    renderEventList(eventList, sortedEvents, searchInput.value, monthSelect.value);
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
    initEventsPage();
    initMobileNav();
    initSectionTabsKeyboard();
  });
})();
