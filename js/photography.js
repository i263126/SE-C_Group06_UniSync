(function () {
  "use strict";

  const NEXT_MEETING_STORAGE_KEY = "unisync.photography.nextMeetingOpen";
  const JOIN_REQUEST_STORAGE_KEY = "unisync.photography.joinRequest";

  const NEXT_MEETING = {
    title: "Campus Photo Walk",
    date: "2026-12-03",
    start: "16:00",
    end: "17:30",
    venue: "Main Courtyard",
    note: "Bring a phone or camera."
  };

  const EVENTS = [NEXT_MEETING];

  const JOIN_ACTIVITIES = [
    "Join photo walks",
    "Learn camera basics"
  ];

  function safeGetStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (_err) {
      return null;
    }
  }

  function safeSetStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (_err) {
      return false;
    }
  }

  function parseMeetingDateTime(dateStr, timeStr) {
    if (typeof dateStr !== "string" || typeof timeStr !== "string") {
      return null;
    }
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
    const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(timeStr.trim());
    if (!dateMatch || !timeMatch) {
      return null;
    }

    const year = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const day = Number(dateMatch[3]);
    const hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2]);

    const dt = new Date(year, month - 1, day, hour, minute, 0, 0);
    if (
      dt.getFullYear() !== year ||
      dt.getMonth() !== month - 1 ||
      dt.getDate() !== day ||
      dt.getHours() !== hour ||
      dt.getMinutes() !== minute
    ) {
      return null;
    }
    return dt;
  }

  function formatMeetingDate(dateObj) {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return `${weekdays[dateObj.getDay()]}, ${dateObj.getDate()} ${months[dateObj.getMonth()]}`;
  }

  function split12Hour(timeStr) {
    const parts = timeStr.split(":");
    const hour24 = Number(parts[0]);
    const minute = parts[1];
    const period = hour24 >= 12 ? "pm" : "am";
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return { text: `${hour12}:${minute}`, period: period };
  }

  function formatTimeRange(startStr, endStr) {
    const start = split12Hour(startStr);
    const end = split12Hour(endStr);
    if (start.period === end.period) {
      return `${start.text}\u2013${end.text} ${end.period}`;
    }
    return `${start.text} ${start.period}\u2013${end.text} ${end.period}`;
  }

  function formatPlural(value, unit) {
    return `${value} ${unit}${value === 1 ? "" : "s"}`;
  }

  function formatIsoDateTime(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const hour = String(dateObj.getHours()).padStart(2, "0");
    const minute = String(dateObj.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hour}:${minute}`;
  }

  function formatDuration(startDt, endDt) {
    const minutes = Math.round((endDt.getTime() - startDt.getTime()) / 60000);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      return "";
    }
    return formatPlural(minutes, "minute");
  }

  function normalizeEvent(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return null;
    }
    const title = typeof raw.title === "string" ? raw.title.trim() : "";
    const venue = typeof raw.venue === "string" ? raw.venue.trim() : "";
    const startDt = parseMeetingDateTime(raw.date, raw.start);
    const endDt = parseMeetingDateTime(raw.date, raw.end);
    if (!title || !venue || !startDt || !endDt || endDt <= startDt) {
      return null;
    }

    const durationText = formatDuration(startDt, endDt);
    if (!durationText) {
      return null;
    }

    const note = typeof raw.note === "string" ? raw.note.trim() : "";
    return {
      title: title,
      date: raw.date.trim(),
      start: raw.start.trim(),
      end: raw.end.trim(),
      startDt: startDt,
      endDt: endDt,
      venue: venue,
      durationText: durationText,
      note: note
    };
  }

  function getCountdownText(meeting, now) {
    if (!meeting || typeof meeting !== "object") {
      return "No upcoming meeting planned yet.";
    }
    const startDt = parseMeetingDateTime(meeting.date, meeting.start);
    const endDt = parseMeetingDateTime(meeting.date, meeting.end);
    if (!startDt || !endDt || endDt <= startDt) {
      return "No upcoming meeting planned yet.";
    }

    const nowMs = now.getTime();
    const startMs = startDt.getTime();
    const endMs = endDt.getTime();

    if (nowMs >= endMs) {
      return "This meeting has finished";
    }
    if (nowMs >= startMs) {
      return "This meeting is happening now";
    }

    const totalMinutes = Math.floor((startMs - nowMs) / 60000);
    if (totalMinutes < 1) {
      return "Starts in less than a minute";
    }

    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) {
      return hours > 0
        ? `Starts in ${formatPlural(days, "day")} ${formatPlural(hours, "hour")}`
        : `Starts in ${formatPlural(days, "day")}`;
    }
    if (hours > 0) {
      return minutes > 0
        ? `Starts in ${formatPlural(hours, "hour")} ${formatPlural(minutes, "minute")}`
        : `Starts in ${formatPlural(hours, "hour")}`;
    }
    return `Starts in ${formatPlural(minutes, "minute")}`;
  }

  function initMobileNav() {
    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("primary-nav");
    if (!toggle || !nav) {
      return;
    }

    function setOpen(isOpen) {
      nav.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    }

    toggle.addEventListener("click", function () {
      const currentlyOpen = toggle.getAttribute("aria-expanded") === "true";
      setOpen(!currentlyOpen);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  function initNextMeeting() {
    const toggle = document.getElementById("next-meeting-toggle");
    const marker = document.getElementById("next-meeting-marker");
    const panel = document.getElementById("next-meeting-panel");
    const titleEl = document.getElementById("meeting-title");
    const lineEl = document.getElementById("meeting-line");
    const countdownEl = document.getElementById("meeting-countdown");
    const noteEl = document.getElementById("meeting-note");

    if (!toggle || !marker || !panel || !lineEl || !countdownEl) {
      return;
    }

    const startDt = NEXT_MEETING ? parseMeetingDateTime(NEXT_MEETING.date, NEXT_MEETING.start) : null;
    const endDt = NEXT_MEETING ? parseMeetingDateTime(NEXT_MEETING.date, NEXT_MEETING.end) : null;
    const hasValidMeeting = Boolean(
      NEXT_MEETING &&
      startDt &&
      endDt &&
      endDt > startDt &&
      typeof NEXT_MEETING.venue === "string" &&
      NEXT_MEETING.venue.trim() !== ""
    );

    if (hasValidMeeting) {
      if (titleEl) {
        titleEl.textContent = NEXT_MEETING.title || "";
        titleEl.hidden = !NEXT_MEETING.title;
      }
      const dateText = formatMeetingDate(startDt);
      const timeText = formatTimeRange(NEXT_MEETING.start, NEXT_MEETING.end);
      lineEl.textContent = `${dateText} \u00b7 ${timeText} \u00b7 ${NEXT_MEETING.venue}`;
      lineEl.hidden = false;

      if (noteEl) {
        noteEl.textContent = NEXT_MEETING.note || "";
        noteEl.hidden = !NEXT_MEETING.note;
      }
    } else {
      if (titleEl) {
        titleEl.textContent = "";
        titleEl.hidden = true;
      }
      lineEl.textContent = "";
      lineEl.hidden = true;
      if (noteEl) {
        noteEl.textContent = "";
        noteEl.hidden = true;
      }
    }

    function refreshCountdown() {
      countdownEl.textContent = getCountdownText(NEXT_MEETING, new Date());
    }

    refreshCountdown();
    window.setInterval(refreshCountdown, 60000);

    function applyExpandedState(isOpen) {
      toggle.setAttribute("aria-expanded", String(isOpen));
      marker.textContent = isOpen ? "\u2212" : "+";
      panel.hidden = !isOpen;
    }

    const storedState = safeGetStorage(NEXT_MEETING_STORAGE_KEY);
    const initialOpen = storedState === "false" ? false : true;
    applyExpandedState(initialOpen);

    toggle.addEventListener("click", function () {
      const nextOpen = toggle.getAttribute("aria-expanded") !== "true";
      applyExpandedState(nextOpen);
      safeSetStorage(NEXT_MEETING_STORAGE_KEY, String(nextOpen));
    });
  }

  function getSavedJoinRequest() {
    const raw = safeGetStorage(JOIN_REQUEST_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw);
      const hasValidSavedAt =
        (typeof parsed.savedAt === "string" && parsed.savedAt.trim() !== "") ||
        (typeof parsed.savedAt === "number" && Number.isFinite(parsed.savedAt));

      if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed) ||
        typeof parsed.name !== "string" ||
        parsed.name.trim() === "" ||
        typeof parsed.activity !== "string" ||
        parsed.activity.trim() === "" ||
        !hasValidSavedAt
      ) {
        return null;
      }

      return parsed;
    } catch (_err) {
      return null;
    }
  }

  function initJoinRequestNote() {
    const noteEl = document.getElementById("join-request-note");
    if (!noteEl) {
      return;
    }

    const saved = getSavedJoinRequest();
    if (!saved) {
      return;
    }

    noteEl.textContent = `Join request saved \u00b7 ${saved.activity.trim()}`;
    noteEl.hidden = false;
  }

  function renderEventsList() {
    const listEl = document.getElementById("events-list");
    if (!listEl) {
      return;
    }

    listEl.textContent = "";

    const validEvents = (Array.isArray(EVENTS) ? EVENTS : [])
      .map(normalizeEvent)
      .filter(Boolean)
      .sort(function (a, b) {
        return a.startDt.getTime() - b.startDt.getTime();
      });

    if (validEvents.length === 0) {
      const emptyCard = document.createElement("div");
      emptyCard.className = "content-card";
      const emptyMsg = document.createElement("p");
      emptyMsg.className = "events-empty";
      emptyMsg.textContent = "No events planned yet.";
      emptyCard.appendChild(emptyMsg);
      listEl.appendChild(emptyCard);
      return;
    }

    validEvents.forEach(function (ev) {
      const card = document.createElement("article");
      card.className = "content-card";

      const titleEl = document.createElement("h2");
      titleEl.className = "event-title";
      titleEl.textContent = ev.title;
      card.appendChild(titleEl);

      const dateP = document.createElement("p");
      dateP.className = "event-meta";
      const timeEl = document.createElement("time");
      timeEl.dateTime = formatIsoDateTime(ev.startDt);
      timeEl.textContent = `${formatMeetingDate(ev.startDt)} \u00b7 ${formatTimeRange(ev.start, ev.end)}`;
      dateP.appendChild(timeEl);
      card.appendChild(dateP);

      const venueP = document.createElement("p");
      venueP.className = "event-meta";
      venueP.textContent = ev.venue;
      card.appendChild(venueP);

      const durationP = document.createElement("p");
      durationP.className = "event-duration";
      durationP.textContent = ev.durationText;
      card.appendChild(durationP);

      if (ev.note) {
        const noteP = document.createElement("p");
        noteP.className = "event-note";
        noteP.textContent = ev.note;
        card.appendChild(noteP);
      }

      listEl.appendChild(card);
    });
  }

  function initEventsJoinAction() {
    const joinBtn = document.getElementById("events-join-btn");
    const joinNote = document.getElementById("events-join-note");
    if (!joinBtn || !joinNote) {
      return;
    }

    const saved = getSavedJoinRequest();
    if (saved) {
      joinBtn.textContent = "View your join request";
      joinBtn.href = "photography-join.html";
      joinNote.textContent = "You have already requested to join";
      joinNote.hidden = false;
    } else {
      joinBtn.textContent = "Join this society";
      joinBtn.href = "photography-join.html";
      joinNote.textContent = "";
      joinNote.hidden = true;
    }
  }

  function populateJoinActivities(selectEl) {
    selectEl.textContent = "";

    const placeholderOpt = document.createElement("option");
    placeholderOpt.value = "";
    placeholderOpt.textContent = "Choose one";
    selectEl.appendChild(placeholderOpt);

    (Array.isArray(JOIN_ACTIVITIES) ? JOIN_ACTIVITIES : []).forEach(function (label) {
      if (typeof label !== "string" || label.trim() === "") {
        return;
      }
      const option = document.createElement("option");
      option.value = label.trim();
      option.textContent = label.trim();
      selectEl.appendChild(option);
    });
  }

  function validateJoinName(rawValue) {
    const trimmed = rawValue.trim();
    if (trimmed.length === 0) {
      return { valid: false, value: trimmed, message: "Enter your name." };
    }
    if (trimmed.length < 2 || trimmed.length > 60) {
      return {
        valid: false,
        value: trimmed,
        message: "Name must be between 2 and 60 characters."
      };
    }
    return { valid: true, value: trimmed, message: "" };
  }

  function setFieldError(inputEl, errorEl, message) {
    if (message) {
      inputEl.setAttribute("aria-invalid", "true");
      errorEl.textContent = message;
      errorEl.hidden = false;
    } else {
      inputEl.setAttribute("aria-invalid", "false");
      errorEl.textContent = "";
      errorEl.hidden = true;
    }
  }

  function initJoinForm() {
    const formEl = document.getElementById("join-form");
    const nameInput = document.getElementById("join-name");
    const nameError = document.getElementById("join-name-error");
    const activitySelect = document.getElementById("join-activity");
    const activityError = document.getElementById("join-activity-error");
    const storageError = document.getElementById("join-storage-error");
    const savedCard = document.getElementById("join-saved-card");
    const savedHeading = document.getElementById("join-saved-heading");
    const savedSummary = document.getElementById("join-saved-summary");

    if (
      !formEl ||
      !nameInput ||
      !nameError ||
      !activitySelect ||
      !activityError ||
      !storageError ||
      !savedCard ||
      !savedHeading ||
      !savedSummary
    ) {
      return;
    }

    populateJoinActivities(activitySelect);

    function showSavedState(activity, shouldFocusHeading) {
      savedSummary.textContent = `Photography Society \u00b7 ${activity}`;
      formEl.hidden = true;
      savedCard.hidden = false;
      if (shouldFocusHeading) {
        savedHeading.focus();
      }
    }

    const existing = getSavedJoinRequest();
    if (existing) {
      showSavedState(existing.activity.trim(), false);
      return;
    }

    formEl.hidden = false;
    savedCard.hidden = true;

    nameInput.addEventListener("input", function () {
      storageError.textContent = "";
      storageError.hidden = true;
      if (nameInput.getAttribute("aria-invalid") === "true") {
        const check = validateJoinName(nameInput.value);
        if (check.valid) {
          setFieldError(nameInput, nameError, "");
        }
      }
    });

    activitySelect.addEventListener("change", function () {
      storageError.textContent = "";
      storageError.hidden = true;
      if (activitySelect.getAttribute("aria-invalid") === "true" && activitySelect.value !== "") {
        setFieldError(activitySelect, activityError, "");
      }
    });

    formEl.addEventListener("submit", function (event) {
      event.preventDefault();

      storageError.textContent = "";
      storageError.hidden = true;

      const nameCheck = validateJoinName(nameInput.value);
      const validActivities = Array.isArray(JOIN_ACTIVITIES) ? JOIN_ACTIVITIES : [];
      const chosenActivity = activitySelect.value;
      const isActivityValid =
        typeof chosenActivity === "string" &&
        chosenActivity !== "" &&
        validActivities.indexOf(chosenActivity) !== -1;

      setFieldError(nameInput, nameError, nameCheck.valid ? "" : nameCheck.message);
      setFieldError(
        activitySelect,
        activityError,
        isActivityValid ? "" : "Choose one activity."
      );

      if (!nameCheck.valid) {
        nameInput.focus();
        return;
      }
      if (!isActivityValid) {
        activitySelect.focus();
        return;
      }

      const payload = {
        name: nameCheck.value,
        activity: chosenActivity,
        savedAt: new Date().toISOString()
      };

      const savedOk = safeSetStorage(JOIN_REQUEST_STORAGE_KEY, JSON.stringify(payload));
      if (!savedOk) {
        storageError.textContent =
          "Could not save your join request because browser storage is unavailable.";
        storageError.hidden = false;
        return;
      }

      showSavedState(payload.activity, true);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initNextMeeting();
    initJoinRequestNote();
    renderEventsList();
    initEventsJoinAction();
    initJoinForm();
  });
})();
