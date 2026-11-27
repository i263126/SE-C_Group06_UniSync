"use strict";

// All society details live here so the HTML stays free of hardcoded data
const greenCampusSociety = {
  id: "green-campus",
  name: "Green Campus Society",
  description: "Volunteer on campus clean-ups and help with the garden.",
  aboutTitle: "What we do",
  aboutLead: "Practical student action for a cleaner, greener campus.",
  aboutBody:
    "Green Campus Society brings students together each week to care for campus green spaces, reduce single-use plastic, and run hands-on sustainability workshops. No prior experience is needed—tools, gloves, and guidance are provided at every session.",
  highlights: [
    {
      title: "Campus clean-ups",
      text: "Monthly litter drives across quads, walkways, and student lawns."
    },
    {
      title: "Campus garden",
      text: "Weekly planting, composting, and herb bed care behind the greenhouse."
    },
    {
      title: "Eco campaigns",
      text: "Student stalls promoting reusable bottles and plastic-free habits."
    }
  ],
  meeting: "Sat, 5 Dec · 10:00–11:00 am · Campus Garden",
  joinSummary:
    "Join Green Campus Society to get updates on weekly gardening sessions, eco campaigns, and campus clean-up drives.",
  joinBenefits: [
    "Weekly schedule updates for garden workdays and clean-ups",
    "Priority spots for tree planting and compost workshops",
    "Verified volunteer hours logged for your semester record"
  ],
  events: [
    {
      id: "tree-planting-day",
      date: "Sat, 12 Dec · 9:00 am",
      title: "Tree Planting Day",
      place: "East Lawn",
      spots: 6,
      hours: 3
    },
    {
      id: "garden-cleanup",
      date: "Wed, 16 Dec · 2:00 pm",
      title: "Campus Garden Clean-Up",
      place: "Campus Garden",
      spots: 4,
      hours: 2
    },
    {
      id: "plastic-free-week",
      date: "Mon, 21 Dec · 11:00 am",
      title: "Plastic-Free Week Stall",
      place: "Student Centre Foyer",
      spots: 1,
      hours: 2
    },
    {
      id: "compost-workshop",
      date: "Fri, 25 Dec · 3:00 pm",
      title: "Compost & Soil Workshop",
      place: "Greenhouse Shed",
      spots: 0,
      hours: 2
    }
  ]
};

const SIGNUPS_KEY = "greenSignups";
const JOINED_KEY = "joinedSocieties";

// Safe localStorage helpers wrapped in try/catch in case storage is blocked
function showStorageBlockedNote() {
  const note = document.getElementById("storage-note");
  if (note) {
    note.hidden = false;
  }
}

function readStorageArray(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    showStorageBlockedNote();
    return [];
  }
}

function writeStorageArray(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    showStorageBlockedNote();
    return false;
  }
}

// In-memory state loaded from localStorage on startup
let signedUpIds = readStorageArray(SIGNUPS_KEY);
let joinedSocieties = readStorageArray(JOINED_KEY);

// Fill header, About section, meeting details, and Join copy from the JS object
function populateSocietyInfo() {
  document.getElementById("society-name").textContent = greenCampusSociety.name;
  document.getElementById("society-description").textContent = greenCampusSociety.description;
  document.getElementById("about-heading").textContent = greenCampusSociety.aboutTitle;
  document.getElementById("about-lead").textContent = greenCampusSociety.aboutLead;
  document.getElementById("about-body").textContent = greenCampusSociety.aboutBody;
  document.getElementById("meeting-details").textContent = greenCampusSociety.meeting;
  document.getElementById("join-summary").textContent = greenCampusSociety.joinSummary;

  // Render the 3 focus-area cards in the About tab
  const highlightsEl = document.getElementById("about-highlights");
  highlightsEl.innerHTML = "";
  greenCampusSociety.highlights.forEach((item) => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-4";

    const card = document.createElement("div");
    card.className = "gc-highlight-card";

    const title = document.createElement("h3");
    title.className = "gc-highlight-title";
    title.textContent = item.title;

    const text = document.createElement("p");
    text.className = "gc-highlight-text";
    text.textContent = item.text;

    card.append(title, text);
    col.append(card);
    highlightsEl.append(col);
  });

  // Render member benefits list in the Join tab
  const benefitsEl = document.getElementById("join-benefits");
  benefitsEl.innerHTML = "";
  greenCampusSociety.joinBenefits.forEach((benefit) => {
    const li = document.createElement("li");
    li.textContent = benefit;
    benefitsEl.append(li);
  });
}

// Switch active tab, update aria-selected, roving tabindex, and visible panel
function activateTab(selectedTab, moveFocus) {
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));

  tabs.forEach((tab) => {
    const isSelected = tab === selectedTab;
    tab.setAttribute("aria-selected", String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;

    const panelId = tab.getAttribute("aria-controls");
    const panel = document.getElementById(panelId);
    if (panel) {
      panel.hidden = !isSelected;
    }
  });

  if (moveFocus) {
    selectedTab.focus();
  }
}

// Set up click and Left/Right arrow key navigation on the tablist
function initTabs() {
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      activateTab(tab, false);
    });

    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
        return;
      }

      event.preventDefault();
      const step = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (index + step + tabs.length) % tabs.length;
      activateTab(tabs[nextIndex], true);
    });
  });

  // "See events" button inside the About tab jumps straight to the Events tab
  const seeEventsBtn = document.getElementById("see-events-btn");
  const eventsTab = document.getElementById("tab-events");
  seeEventsBtn.addEventListener("click", () => {
    activateTab(eventsTab, true);
  });
}

// Toggle Next meeting visibility and swap minus (-) and plus (+) signs
function initMeetingToggle() {
  const toggleBtn = document.getElementById("meeting-toggle");
  const details = document.getElementById("meeting-details");
  const sign = document.getElementById("meeting-sign");

  toggleBtn.addEventListener("click", () => {
    const isOpen = toggleBtn.getAttribute("aria-expanded") === "true";
    const nextOpen = !isOpen;

    toggleBtn.setAttribute("aria-expanded", String(nextOpen));
    details.hidden = !nextOpen;
    sign.textContent = nextOpen ? "−" : "+";
  });
}

// Calculate remaining spots for an event based on whether the user signed up
function getRemainingSpots(eventItem) {
  const isSignedUp = signedUpIds.includes(eventItem.id);
  const usedSpot = isSignedUp ? 1 : 0;
  return Math.max(0, eventItem.spots - usedSpot);
}

// Update the counter above the event cards (count + total volunteer hours)
function renderSignupCounter() {
  const counterEl = document.getElementById("signup-counter");
  const signedEvents = greenCampusSociety.events.filter((ev) =>
    signedUpIds.includes(ev.id)
  );

  if (signedEvents.length === 0) {
    counterEl.textContent = "No events yet";
    return;
  }

  const totalHours = signedEvents.reduce((sum, ev) => sum + ev.hours, 0);
  const eventWord = signedEvents.length === 1 ? "event" : "events";
  const hourWord = totalHours === 1 ? "hour" : "hours";

  counterEl.textContent =
    "You signed up for " +
    signedEvents.length +
    " " +
    eventWord +
    " (" +
    totalHours +
    " volunteer " +
    hourWord +
    ")";
}

// Render the 4 event cards from greenCampusSociety.events
function renderEvents() {
  const listEl = document.getElementById("events-list");
  listEl.innerHTML = "";

  greenCampusSociety.events.forEach((eventItem) => {
    const isSignedUp = signedUpIds.includes(eventItem.id);
    const spotsLeft = getRemainingSpots(eventItem);

    const col = document.createElement("div");
    col.className = "col-12 col-md-6";

    const card = document.createElement("article");
    card.className = "gc-event-card";

    const infoBlock = document.createElement("div");

    const dateEl = document.createElement("p");
    dateEl.className = "gc-event-date";
    dateEl.textContent = eventItem.date;

    const titleEl = document.createElement("h2");
    titleEl.className = "gc-event-title";
    titleEl.textContent = eventItem.title;

    const placeEl = document.createElement("p");
    placeEl.className = "gc-event-meta";
    placeEl.textContent = eventItem.place + " · " + eventItem.hours + " hrs";

    const spotsEl = document.createElement("p");
    spotsEl.className = spotsLeft === 0 ? "gc-event-spots gc-event-spots--full" : "gc-event-spots";
    spotsEl.textContent = spotsLeft === 1 ? "1 spot left" : spotsLeft + " spots left";

    infoBlock.append(dateEl, titleEl, placeEl, spotsEl);

    // Action area: Sign up, Full (disabled), or Signed up + Cancel
    const actionsEl = document.createElement("div");
    actionsEl.className = "d-flex align-items-center gap-2 flex-wrap";

    if (isSignedUp) {
      const signedBadge = document.createElement("span");
      signedBadge.className = "gc-signed-pill";
      signedBadge.textContent = "Signed up";

      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "gc-btn-cancel";
      cancelBtn.textContent = "Cancel";
      cancelBtn.addEventListener("click", () => handleCancel(eventItem.id));

      actionsEl.append(signedBadge, cancelBtn);
    } else if (spotsLeft === 0) {
      const fullBtn = document.createElement("button");
      fullBtn.type = "button";
      fullBtn.className = "gc-btn-primary";
      fullBtn.textContent = "Full";
      fullBtn.disabled = true;

      actionsEl.append(fullBtn);
    } else {
      const signUpBtn = document.createElement("button");
      signUpBtn.type = "button";
      signUpBtn.className = "gc-btn-primary";
      signUpBtn.textContent = "Sign up";
      signUpBtn.addEventListener("click", () => handleSignUp(eventItem.id));

      actionsEl.append(signUpBtn);
    }

    card.append(infoBlock, actionsEl);
    col.append(card);
    listEl.append(col);
  });

  renderSignupCounter();
}

function handleSignUp(eventId) {
  const eventItem = greenCampusSociety.events.find((ev) => ev.id === eventId);
  if (!eventItem || getRemainingSpots(eventItem) === 0) {
    return;
  }

  if (!signedUpIds.includes(eventId)) {
    signedUpIds.push(eventId);
    writeStorageArray(SIGNUPS_KEY, signedUpIds);
  }
  renderEvents();
}

function handleCancel(eventId) {
  signedUpIds = signedUpIds.filter((id) => id !== eventId);
  writeStorageArray(SIGNUPS_KEY, signedUpIds);
  renderEvents();
}

// Render and handle the Join button while preserving existing joinedSocieties IDs
function initJoinSection() {
  const joinBtn = document.getElementById("join-btn");
  const joinStatus = document.getElementById("join-status");

  function updateJoinUI() {
    const isJoined = joinedSocieties.includes(greenCampusSociety.id);
    if (isJoined) {
      joinBtn.textContent = "Joined";
      joinBtn.disabled = true;
      joinStatus.textContent = "You joined Green Campus Society";
      joinStatus.hidden = false;
    } else {
      joinBtn.textContent = "Join";
      joinBtn.disabled = false;
      joinStatus.hidden = true;
    }
  }

  joinBtn.addEventListener("click", () => {
    // Re-read first so any societies joined in another tab or page stay in the list
    const latestJoined = readStorageArray(JOINED_KEY);
    if (latestJoined.length > 0) {
      joinedSocieties = latestJoined;
    }

    if (!joinedSocieties.includes(greenCampusSociety.id)) {
      joinedSocieties.push(greenCampusSociety.id);
      writeStorageArray(JOINED_KEY, joinedSocieties);
    }

    updateJoinUI();
  });

  updateJoinUI();
}

// Simple plain-JS fallback for mobile menu toggle if Bootstrap CDN fails offline
function initNavFallback() {
  if (window.bootstrap) {
    return;
  }

  const toggler = document.querySelector(".gc-toggler");
  const navCollapse = document.getElementById("mainNav");
  if (!toggler || !navCollapse) {
    return;
  }

  toggler.addEventListener("click", () => {
    const isOpen = navCollapse.classList.toggle("show");
    toggler.setAttribute("aria-expanded", String(isOpen));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  populateSocietyInfo();
  initTabs();
  initMeetingToggle();
  renderEvents();
  initJoinSection();
  initNavFallback();
});
