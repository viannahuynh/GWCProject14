function buildTimeSlots() {
    const slots = [];

    for (let hour = 0; hour < 24; hour++) {
        const suffix = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;

        slots.push({
            label: `${displayHour} ${suffix}`,
            value: `${String(hour).padStart(2, "0")}:00`
        });
    }

    return slots;
}

function renderCalendarGrid(container, weekdayLabels, timeSlots) {
    container.innerHTML = "";

    const headerRow = createHeaderRow(weekdayLabels);
    container.appendChild(headerRow);

    timeSlots.forEach((timeSlot, rowIndex) => {
        const timeRow = createTimeRow(timeSlot, weekdayLabels.length, rowIndex);
        container.appendChild(timeRow);
    });
}

function createHeaderRow(weekdayLabels) {
    const row = document.createElement("div");
    row.className = "calendar-row calendar-header";

    const gmtCell = createCell("calendar-cell time-header", "GMT");
    row.appendChild(gmtCell);

    const weekStart = getWeekStart();

    weekdayLabels.forEach((day, dayIndex) => {
        const colDate = new Date(weekStart);
        colDate.setDate(weekStart.getDate() + dayIndex);

        const dateLabel = colDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        });

        const dayCell = createCell("calendar-cell day-header", `${day}\n${dateLabel}`);
        dayCell.style.whiteSpace = "pre-line";
        dayCell.dataset.dayIndex = dayIndex;
        dayCell.dataset.date = formatDate(colDate);

        row.appendChild(dayCell);
    });

    return row;
}

function createTimeRow(timeSlot, totalDays, rowIndex) {
    const row = document.createElement("div");
    row.className = "calendar-row";
    row.dataset.rowIndex = rowIndex;
    row.dataset.timeValue = timeSlot.value;

    const timeLabel = createCell("calendar-cell time-label", timeSlot.label);
    timeLabel.dataset.rowIndex = rowIndex;
    timeLabel.dataset.timeValue = timeSlot.value;
    row.appendChild(timeLabel);

    for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
        const dayCell = createCell("calendar-cell day-cell", "");
        dayCell.dataset.dayIndex = dayIndex;
        dayCell.dataset.rowIndex = rowIndex;
        dayCell.dataset.timeValue = timeSlot.value;
        row.appendChild(dayCell);
    }

    return row;
}

function createCell(className, text = "") {
    const cell = document.createElement("div");
    cell.className = className;
    cell.textContent = text;
    return cell;
}
/*============================================================== 
 Modal start
  ============================================================== */

const openCreateEvent = document.getElementById('openCreateEvent');
const openLastMinuteEvent = document.getElementById('openLastMinuteEvent');

/* Create event */
const createEvent = document.getElementById('createEvent');
const closeCreateEvent = document.getElementById('closeCreateEvent');
const cancelEventBtn = document.getElementById('cancelEventBtn');
const saveEventBtn = document.getElementById('saveEventBtn');

/* Last Minute event */
const lastMinute = document.getElementById('lastMinute');
const closeLastMinuteEvent = document.getElementById('closeLastMinuteEvent');
const cancelLastMinuteBtn = document.getElementById('cancelLastMinuteBtn');
const saveLastMinuteBtn = document.getElementById('saveLastMinuteBtn');

/* Switching Weeks*/
const prevWeekBtn = document.getElementById("prevWeek");
const nextWeekBtn = document.getElementById("nextWeek");

/*==============================================================
  Events Array
  ============================================================== */
let events = [];

/*==============================================================
  Last Minute Event Array
  ============================================================== */
let lastMinuteEvents = [];

let editingEventId = null;
let editingLastMinuteEventId = null;

let weekOffset = 0;

/*==============================================================
  Helper: get day-of-week index (0=Sun…6=Sat) from a date string "YYYY-MM-DD"
  ============================================================== */
function getDayIndex(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const weekStart = getWeekStart();
  for (let i = 0; i < 7; i++) {
    const col = new Date(weekStart);
    col.setDate(weekStart.getDate() + i);
    if (col.toDateString() === d.toDateString()) return i;
  }
  return null;
}

function getWeekStart() {
  const today = new Date();
  const day = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - day + (weekOffset * 7));
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/*==============================================================
  Helper: get time period slots "morning/afternoon/evening"
  ============================================================== */
function getTimeRangeFromPeriod(period) {
  if (period === "morning") {
    return { startHour: 6, endHour: 12, label: "Morning" };
  }

  if (period === "afternoon") {
    return { startHour: 12, endHour: 18, label: "Afternoon" };
  }

  if (period === "evening") {
    return { startHour: 18, endHour: 24, label: "Evening" };
  }

  return { startHour: 6, endHour: 12, label: "Morning" };
}

function formatPeriodLabel(period) {
  if (period === "morning") return "Morning (6 AM - 12 PM)";
  if (period === "afternoon") return "Afternoon (12 PM - 6 PM)";
  if (period === "evening") return "Evening (6 PM - 12 AM)";
  return "Time not set";
}

/*==============================================================
  Helper: formatting for correct time display
  ============================================================== */
function formatHourLabel(hour) {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${suffix}`;
}

function formatEventTime(timeStr) {
  if (!timeStr) return "";

  const [hourStr, minuteStr] = timeStr.split(":");
  const hour = parseInt(hourStr, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minuteStr} ${suffix}`;
}

function getLastMinuteDisplayTime(evt) {
  return `${formatHourLabel(evt.startHour)} - ${formatHourLabel(evt.startHour + 1)}`;
}

function parseHour(timeStr) {
  if (!timeStr) return null;
  return parseInt(timeStr.split(":")[0], 10);
}

function isSameWeek(dateStr) {
  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const d = new Date(`${dateStr}T00:00:00`);
  d.setHours(0, 0, 0, 0);

  return d >= weekStart && d <= weekEnd;
}

function getNextDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + 1);
  return formatDate(d);
}

function getRegularEventSegments(evt) {
  const segments = [];
  if (!evt.date || !evt.startTime || !evt.endTime) return segments;

  const startHour = parseHour(evt.startTime);
  const endHour = parseHour(evt.endTime);

  if (startHour === null || endHour === null) return segments;

  if (endHour > startHour) {
    segments.push({
      date: evt.date,
      startHour,
      endHour
    });
  } else {
    segments.push({
      date: evt.date,
      startHour,
      endHour: 24
    });

    segments.push({
      date: getNextDate(evt.date),
      startHour: 0,
      endHour
    });
  }

  return segments;
}

function regularEventsConflict(date, startTime, endTime, excludeId = null) {
  const newStart = parseHour(startTime);
  const newEndRaw = parseHour(endTime);

  return events.some(evt => {
    if (excludeId && evt.id === excludeId) return false;
    if (evt.date !== date) return false;

    const evtStart = parseHour(evt.startTime);
    const evtEndRaw = parseHour(evt.endTime);

    const evtEnd = evtEndRaw <= evtStart ? 24 : evtEndRaw;
    const proposedEnd = newEndRaw <= newStart ? 24 : newEndRaw;

    return newStart < evtEnd && proposedEnd > evtStart;
  });
}

function regularEventOccupiesHour(date, hour, excludeId = null) {
  return events.some(evt => {
    if (excludeId && evt.id === excludeId) return false;

    const segments = getRegularEventSegments(evt);
    return segments.some(segment =>
      segment.date === date &&
      hour >= segment.startHour &&
      hour < segment.endHour
    );
  });
}

function lastMinuteEventOccupiesHour(date, hour, excludeId = null) {
  return lastMinuteEvents.some(evt => {
    if (excludeId && evt.id === excludeId) return false;
    return evt.date === date && evt.startHour === hour;
  });
}

function slotHasAnyConflict(date, hour, excludeRegularId = null, excludeLastMinuteId = null) {
  return (
    regularEventOccupiesHour(date, hour, excludeRegularId) ||
    lastMinuteEventOccupiesHour(date, hour, excludeLastMinuteId)
  );
}

function getAvailableSlotHoursForPeriod(date, period, excludeLastMinuteId = null) {
  const range = getTimeRangeFromPeriod(period);
  const available = [];

  for (let hour = range.startHour; hour < range.endHour; hour++) {
    if (!slotHasAnyConflict(date, hour, null, excludeLastMinuteId)) {
      available.push(hour);
    }
  }

  return available;
}

function populateLastMinuteSlotOptions(selectedHour = "") {
  const date = document.getElementById("lastMinuteDate").value;
  const period = document.getElementById("lastMinuteTimeOfDay").value;
  const slotSelect = document.getElementById("lastMinuteSlotHour");

  if (!slotSelect) return;

  slotSelect.innerHTML = `<option value="">Select an available slot</option>`;

  if (!date || !period) return;

  const availableHours = getAvailableSlotHoursForPeriod(
    date,
    period,
    editingLastMinuteEventId
  );

  availableHours.forEach(hour => {
    const option = document.createElement("option");
    option.value = String(hour);
    option.textContent = `${formatHourLabel(hour)} - ${formatHourLabel(hour + 1)}`;
    if (String(hour) === String(selectedHour)) {
      option.selected = true;
    }
    slotSelect.appendChild(option);
  });
}

function resetCreateEventForm() {
  const form = document.getElementById("eventForm");
  if (form) form.reset();
  editingEventId = null;
  document.getElementById("saveEventBtn").textContent = "Create Event";
}

function resetLastMinuteForm() {
  const form = document.getElementById("lastMinuteForm");
  if (form) form.reset();
  editingLastMinuteEventId = null;
  document.getElementById("saveLastMinuteBtn").textContent = "Create Event";
  populateLastMinuteSlotOptions();
}

/*==============================================================
  Helper: Rerender calendar when switching weeks
  ============================================================== */
function rerenderCalendar() {
  const calendarGrid = document.getElementById("calendar-grid");
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timeSlots = buildTimeSlots();

  renderCalendarGrid(calendarGrid, weekdayLabels, timeSlots);
  renderEventsOnGrid();
  renderLastMinuteEvents();
}

/*==============================================================
  Render regular events onto the calendar grid
  ============================================================== */
function renderEventsOnGrid() {

  document.querySelectorAll('.event-block').forEach(el => el.remove());

  const cellHeight = 60;

  events.forEach(evt => {

    const segments = getRegularEventSegments(evt);

    segments.forEach(segment => {

      const dayIndex = getDayIndex(segment.date);
      if (dayIndex === null) return;

      const startTimeValue =
        `${String(segment.startHour).padStart(2,"0")}:00`;

      const startCell = document.querySelector(
        `.day-cell[data-day-index="${dayIndex}"][data-time-value="${startTimeValue}"]`
      );

      if (!startCell) return;

      const duration = segment.endHour - segment.startHour;

      const block = document.createElement("div");
      block.className = "event-block";

      block.style.height = `${duration * cellHeight - 4}px`;

      block.innerHTML = `
        <span class="event-block-title">${escapeHtml(evt.title)}</span>
        <span class="event-block-time">
        ${formatEventTime(evt.startTime)} – ${formatEventTime(evt.endTime)}
        </span>
      `;

      block.addEventListener("click",(e)=>{
        e.stopPropagation();
        showEventPopup(evt,block);
      });

      startCell.appendChild(block);

    });

  });

}

/*==============================================================
  Render last minute events onto the calendar grid
  ============================================================== */
  function renderLastMinuteEvents() {
  document.querySelectorAll('.last-minute-event').forEach(el => el.remove());

  lastMinuteEvents.forEach(evt => {
    if (!evt.date || evt.startHour === undefined) return;

    const dayIndex = getDayIndex(evt.date);
    if (dayIndex === null) return;

    const cell = document.querySelector(
      `.day-cell[data-day-index="${dayIndex}"][data-row-index="${evt.startHour}"]`
    );

    if (!cell) return;

    const block = document.createElement("div");
    block.className = "last-minute-event";
    block.dataset.eventId = evt.id;
    block.innerHTML = `
      <strong>${escapeHtml(evt.title)}</strong><br>
      ${getLastMinuteDisplayTime(evt)}
    `;

    block.addEventListener('click', (e) => {
      e.stopPropagation();
      showLastMinutePopup(evt, block);
    });

    cell.appendChild(block);
  });
}

/*==============================================================
  Show popup with event details + delete button + edit button
  ============================================================== */
function showEventPopup(evt, anchorEl) {
  document.querySelectorAll('.event-popup').forEach(p => p.remove());

  if (getComputedStyle(anchorEl).position === 'static') {
    anchorEl.style.position = 'relative';
  }

  // Save original fixed height once
  if (!anchorEl.dataset.originalHeight) {
    anchorEl.dataset.originalHeight = anchorEl.style.height;
  }

  // Let the block grow while popup is open
  anchorEl.style.height = 'auto';
  anchorEl.style.minHeight = anchorEl.dataset.originalHeight;

  const popup = document.createElement('div');
  popup.className = 'event-popup';
  popup.innerHTML = `
    <p class="event-popup-title"><strong>${escapeHtml(evt.title)}</strong></p>
    <p class="event-popup-detail">${evt.date}</p>
    <p class="event-popup-detail">${formatEventTime(evt.startTime)} - ${formatEventTime(evt.endTime)}</p>
    ${evt.description ? `<p class="event-popup-detail">${escapeHtml(evt.description)}</p>` : ''}
    <div class="event-popup-actions">
      <button class="event-popup-edit">Edit</button>
      <button class="event-popup-delete" data-event-id="${evt.id}">Delete</button>
      <button class="event-popup-close">X</button>
    </div>
  `;

  anchorEl.appendChild(popup);

  popup.querySelector('.event-popup-close').addEventListener('click', (e) => {
    e.stopPropagation();
    anchorEl.style.height = anchorEl.dataset.originalHeight;
    anchorEl.style.minHeight = '';
    popup.remove();
  });

  popup.querySelector('.event-popup-delete').addEventListener('click', (e) => {
    e.stopPropagation();
    deleteEvent(evt.id);
    popup.remove();
  });

  popup.querySelector('.event-popup-edit').addEventListener('click', (e) => {
    e.stopPropagation();

    document.getElementById('eventTitle').value = evt.title;
    document.getElementById('eventDate').value = evt.date;
    document.getElementById('startTime').value = evt.startTime;
    document.getElementById('endTime').value = evt.endTime;
    document.getElementById('eventDescription').value = evt.description || '';

    editingEventId = evt.id;
    document.getElementById('saveEventBtn').textContent = 'Update Event';
    createEvent.classList.add('show');
    popup.remove();
  });
}

/*=======================================================================
  Show popup with last minute event details + delete button + edit button
  ======================================================================= */
function showLastMinutePopup(evt, anchorEl) {
  document.querySelectorAll('.event-popup').forEach(p => p.remove());

  if (getComputedStyle(anchorEl).position === 'static') {
    anchorEl.style.position = 'relative';
  }

  const popup = document.createElement('div');
  popup.className = 'event-popup';
  popup.innerHTML = `
    <p class="event-popup-title"><strong>${escapeHtml(evt.title)}</strong></p>
    <p class="event-popup-detail">${evt.date}</p>
    <p class="event-popup-detail">${formatPeriodLabel(evt.period)}</p>
    <p class="event-popup-detail">Duration: ${evt.duration} min</p>
    ${evt.description ? `<p class="event-popup-detail">${escapeHtml(evt.description)}</p>` : ''}
    <div class="event-popup-actions">
      <button class="event-popup-edit">Edit</button>
      <button class="event-popup-delete">Delete</button>
      <button class="event-popup-close">X</button>
    </div>
  `;

  anchorEl.appendChild(popup);

  // Edit button
  popup.querySelector('.event-popup-edit').addEventListener('click', (e) => {
    e.stopPropagation();

    document.getElementById('lastMinuteTitle').value = evt.title;
    document.getElementById('lastMinuteDate').value = evt.date;
    document.getElementById('lastMinuteDuration').value = evt.duration;
    document.getElementById('lastMinuteTimeOfDay').value = evt.period;
    document.getElementById('lastMinuteDescription').value = evt.description || '';

    editingLastMinuteEventId = evt.id;
    document.getElementById('saveLastMinuteBtn').textContent = 'Update Event';

    populateLastMinuteSlotOptions(evt.startHour);

    lastMinute.classList.add('show');
    popup.remove();
  });

  // Close button
  popup.querySelector('.event-popup-close').addEventListener('click', (e) => {
    e.stopPropagation();
    popup.remove();
  });

  // Delete button
  popup.querySelector('.event-popup-delete').addEventListener('click', (e) => {
    e.stopPropagation();
    deleteLastMinuteEvent(evt.id);
    popup.remove();
  });
}

/*==============================================================
  Delete a regular event by id
  ============================================================== */
function deleteEvent(id) {
  events = events.filter(evt => evt.id !== id);
  rerenderCalendar();
  updateEventInfoText();
}

/*==============================================================
  Delete a last minute event by id
  ============================================================== */
function deleteLastMinuteEvent(id) {
  lastMinuteEvents = lastMinuteEvents.filter(evt => evt.id !== id);
  rerenderCalendar();
  updateEventInfoText();
}

// Close popups when clicking elsewhere
document.addEventListener('click', (e) => {
  // Don't close if clicking inside a popup or on an event block
  if (
    e.target.closest('.event-popup') ||
    e.target.closest('.event-block') ||
    e.target.closest('.last-minute-event')
  ) {
    return;
  }

  document.querySelectorAll('.event-popup').forEach(p => p.remove());
});

/*==============================================================
  Update the display area text
  ============================================================== */
function updateEventInfoText() {
  const infoText = document.getElementById('eventInfoText');
  if (!infoText) return;

  const visibleRegular = events.filter(evt => {
    const segments = getRegularEventSegments(evt);
    return segments.some(segment => isSameWeek(segment.date));
  }).length;

  const visibleLastMinute = lastMinuteEvents.filter(evt => isSameWeek(evt.date)).length;

  const visibleTotal = visibleRegular + visibleLastMinute;
  const totalStored = events.length + lastMinuteEvents.length;

  if (visibleTotal === 0 && totalStored === 0) {
    infoText.innerHTML = 'No events yet. Create one!';
  } else if (visibleTotal === 0) {
    infoText.innerHTML = `You have ${totalStored} total event(s), but none are on this week’s calendar.`;
  } else {
    infoText.innerHTML = `${visibleTotal} event(s) this current week. ${totalStored} total event(s) on calendar.`;
  }
}

/*==============================================================
  Create Event — modal open/close
  ============================================================== */
if (openCreateEvent && createEvent) {
  openCreateEvent.addEventListener('click', () => {
    resetCreateEventForm();
    createEvent.classList.add('show');
  });
}

if (closeCreateEvent && createEvent) {
  closeCreateEvent.addEventListener('click', () => {
    resetCreateEventForm();
    createEvent.classList.remove('show');
  });
}

if (cancelEventBtn) {
  cancelEventBtn.addEventListener('click', () => {
    resetCreateEventForm();
  });
}

if (saveEventBtn) {
  saveEventBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const title = document.getElementById('eventTitle').value.trim();
    const date = document.getElementById('eventDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const description = document.getElementById('eventDescription').value.trim();

    if (!title) {
      alert('Please enter an event title.');
      return;
    }

    if (!date) {
      alert('Please select a date.');
      return;
    }

    if (!startTime || !endTime) {
      alert('Please select start and end times.');
      return;
    }

    if (regularEventsConflict(date, startTime, endTime, editingEventId)) {
      alert('A regular event already exists during that time.');
      return;
    }

    if (editingEventId) {
      const eventToUpdate = events.find(evt => evt.id === editingEventId);

      if (eventToUpdate) {
        eventToUpdate.title = title;
        eventToUpdate.date = date;
        eventToUpdate.startTime = startTime;
        eventToUpdate.endTime = endTime;
        eventToUpdate.description = description;
      }
    } else {
      const newEvent = {
        id: Date.now().toString(),
        title,
        date,
        startTime,
        endTime,
        description
      };

      events.push(newEvent);
    }

    resetCreateEventForm();
    createEvent.classList.remove('show');
    rerenderCalendar();
    updateEventInfoText();
  });
}

/*==============================================================
  Last Minute Event
  ============================================================== */
if (openLastMinuteEvent && lastMinute) {
  openLastMinuteEvent.addEventListener('click', () => {
    resetLastMinuteForm();
    lastMinute.classList.add('show');
    populateLastMinuteSlotOptions();
  });
}

if (closeLastMinuteEvent && lastMinute) {
  closeLastMinuteEvent.addEventListener('click', () => {
    resetLastMinuteForm();
    lastMinute.classList.remove('show');
  });
}

if (cancelLastMinuteBtn) {
  cancelLastMinuteBtn.addEventListener('click', () => {
    resetLastMinuteForm();
  });
}

const lastMinuteDateInput = document.getElementById('lastMinuteDate');
const lastMinutePeriodSelect = document.getElementById('lastMinuteTimeOfDay');

if (lastMinuteDateInput) {
  lastMinuteDateInput.addEventListener('change', () => {
    populateLastMinuteSlotOptions();
  });
}

if (lastMinutePeriodSelect) {
  lastMinutePeriodSelect.addEventListener('change', () => {
    populateLastMinuteSlotOptions();
  });
}

if (saveLastMinuteBtn) {
  saveLastMinuteBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const title = document.getElementById('lastMinuteTitle').value.trim();
    const rawDate = document.getElementById('lastMinuteDate').value;
    const duration = parseInt(document.getElementById('lastMinuteDuration').value, 10);
    const period = document.getElementById("lastMinuteTimeOfDay").value;
    const description = document.getElementById('lastMinuteDescription').value.trim();
    const selectedSlotHour = document.getElementById('lastMinuteSlotHour').value;

    if (!title) {
      alert('Please enter an event title.');
      return;
    }

    if (!rawDate) {
      alert('Please select a date.');
      return;
    }

    if (!period) {
      alert('Please select a time period.');
      return;
    }

    if (selectedSlotHour === "") {
      alert('Please select an available slot.');
      return;
    }

    const startHour = parseInt(selectedSlotHour, 10);

    if (slotHasAnyConflict(rawDate, startHour, null, editingLastMinuteEventId)) {
      alert('That slot is already taken by a regular or last-minute event.');
      return;
    }

    if (editingLastMinuteEventId) {
      const eventToUpdate = lastMinuteEvents.find(evt => evt.id === editingLastMinuteEventId);

      if (eventToUpdate) {
        eventToUpdate.title = title;
        eventToUpdate.date = rawDate;
        eventToUpdate.duration = duration;
        eventToUpdate.description = description;
        eventToUpdate.period = period;
        eventToUpdate.startHour = startHour;
        eventToUpdate.endHour = startHour + 1;
      }
    } else {
      const newLastMinuteEvent = {
        id: Date.now().toString(),
        title,
        date: rawDate,
        duration,
        description,
        period,
        startHour,
        endHour: startHour + 1
      };

      lastMinuteEvents.push(newLastMinuteEvent);
    }

    resetLastMinuteForm();
    lastMinute.classList.remove('show');
    rerenderCalendar();
    updateEventInfoText();
  });
}

/*==============================================================
  Switching Weeks
  ============================================================== */
if (prevWeekBtn) {
  prevWeekBtn.addEventListener("click", () => {
    weekOffset--;
    rerenderCalendar();
  });
}

if (nextWeekBtn) {
  nextWeekBtn.addEventListener("click", () => {
    weekOffset++;
    rerenderCalendar();
  });
}

/*============================================================== 
  Calendar Grid
  ============================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const calendarGrid = document.getElementById("calendar-grid");

  if (!calendarGrid) {
    console.error('Missing #calendar-grid in HTML.');
    return;
  }

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timeSlots = buildTimeSlots();

  renderCalendarGrid(calendarGrid, weekdayLabels, timeSlots); 
  
  // Demo event for testing - REMOVE THIS LATER
  // This creates a test event for today at the current hour
  const today = new Date();
  const todayStr = formatDate(today);
  const currentHour = String(today.getHours()).padStart(2, '0');
  const testEvent = {
    id: 'test123',
    title: 'TEST EVENT - Click me!',
    date: todayStr,
    startTime: `${currentHour}:00`,
    endTime: `${currentHour}:30`,
    description: 'This is a test event to verify popup works'
  };
  
  // Uncomment the line below to add a test event
  // events.push(testEvent);
  // renderEventsOnGrid();
  // renderLastMinuteEvents();
  // updateEventInfoText();
});
