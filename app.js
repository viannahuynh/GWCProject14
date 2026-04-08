document.addEventListener("DOMContentLoaded", () => {
    const calendarGrid = document.getElementById("calendar-grid");

    if (!calendarGrid) {
        console.error('Missing #calendar-grid in HTML.');
        return;
    }

    const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const timeSlots = buildTimeSlots();

    renderCalendarGrid(calendarGrid, weekdayLabels, timeSlots);
});

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

    weekdayLabels.forEach((day, dayIndex) => {
        const dayCell = createCell("calendar-cell day-header", day);
        dayCell.dataset.dayIndex = dayIndex;
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

/*==============================================================
  Events Array
  ============================================================== */
let events = [];

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
  sunday.setDate(today.getDate() - day);
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
  Render all events onto the calendar grid
  ============================================================== */
function renderEventsOnGrid() {
  document.querySelectorAll('.event-block').forEach(el => el.remove());

  events.forEach(evt => {
    if (!evt.date || !evt.startTime) return;

    const dayIndex = getDayIndex(evt.date);
    if (dayIndex === null) return;

    const hour = evt.startTime.split(':')[0];
    const timeValue = `${hour}:00`;

    const cell = document.querySelector(
      `.day-cell[data-day-index="${dayIndex}"][data-time-value="${timeValue}"]`
    );

    if (!cell) return;

    const block = document.createElement('div');
    block.className = 'event-block';
    block.dataset.eventId = evt.id;
    block.innerHTML = `
      <span class="event-block-title">${escapeHtml(evt.title)}</span>
      <span class="event-block-time">${evt.startTime} – ${evt.endTime}</span>
    `;

    // IMPORTANT: Store event data directly on the block element
    block._eventData = evt;

    block.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('Event block clicked:', evt.title); // Debug log
      showEventPopup(block._eventData, block);
    });

    cell.appendChild(block);
  });
}

/*==============================================================
  Show popup with event details + delete button - FIXED VERSION
  ============================================================== */
function showEventPopup(evt, anchorEl) {
  console.log('showEventPopup called for:', evt.title); // Debug log
  
  // Remove any existing popup
  document.querySelectorAll('.event-popup').forEach(p => p.remove());

  // Make sure anchorEl has position relative
  if (getComputedStyle(anchorEl).position === 'static') {
    anchorEl.style.position = 'relative';
  }

  const popup = document.createElement('div');
  popup.className = 'event-popup';
  popup.innerHTML = `
    <p class="event-popup-title"><strong>${escapeHtml(evt.title)}</strong></p>
    <p class="event-popup-detail">${evt.date}</p>
    <p class="event-popup-detail">${evt.startTime} - ${evt.endTime}</p>
    ${evt.description ? `<p class="event-popup-detail">${escapeHtml(evt.description)}</p>` : ''}
    <div style="display: flex; justify-content: space-between;">
    <button class="event-popup-delete" data-event-id="${evt.id}">Delete</button>
    <button class="event-popup-close">X</button>
    </div>
  `;

  anchorEl.appendChild(popup);

  // Close button
  popup.querySelector('.event-popup-close').addEventListener('click', (e) => {
    e.stopPropagation();
    popup.remove();
  });

  // Delete button
  popup.querySelector('.event-popup-delete').addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('Delete clicked for event:', evt.id);
    deleteEvent(evt.id);
    popup.remove();
  });
}

/*==============================================================
  Delete an event by id
  ============================================================== */
function deleteEvent(id) {
  console.log('Deleting event:', id);
  events = events.filter(evt => evt.id !== id);
  renderEventsOnGrid();
  updateEventInfoText();
}

/*==============================================================
  Update the display area text
  ============================================================== */
function updateEventInfoText() {
  const infoText = document.getElementById('eventInfoText');
  if (!infoText) return;

  if (events.length === 0) {
    infoText.innerHTML = 'No events yet. Create one!';
  } else {
    infoText.innerHTML = `${events.length} event(s) on the calendar. Click on an event to view or delete it.`;
  }
}

// Close popups when clicking elsewhere
document.addEventListener('click', (e) => {
  // Don't close if clicking inside a popup or on an event block
  if (e.target.closest('.event-popup') || e.target.closest('.event-block')) {
    return;
  }
  document.querySelectorAll('.event-popup').forEach(p => p.remove());
});

/*==============================================================
  Create Event — modal open/close
  ============================================================== */
if (openCreateEvent && createEvent) {
  openCreateEvent.addEventListener('click', () => {
    createEvent.classList.add('show');
  });
}

if (closeCreateEvent && createEvent) {
  closeCreateEvent.addEventListener('click', () => {
    createEvent.classList.remove('show');
  });
}

if (cancelEventBtn) {
  cancelEventBtn.addEventListener('click', () => {
    const form = document.getElementById('eventForm');
    if (form) form.reset();
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

    const newEvent = {
      id: Date.now().toString(),
      title,
      date,
      startTime,
      endTime,
      description
    };

    events.push(newEvent);
    renderEventsOnGrid();
    updateEventInfoText();

    document.getElementById('eventForm').reset();
    createEvent.classList.remove('show');
    
    console.log('Event created:', newEvent);
  });
}

/*==============================================================
  Last Minute Event
  ============================================================== */
if (openLastMinuteEvent && lastMinute) {
  openLastMinuteEvent.addEventListener('click', () => {
    lastMinute.classList.add('show');
  });
}

if (closeLastMinuteEvent && lastMinute) {
  closeLastMinuteEvent.addEventListener('click', () => {
    lastMinuteEventSystem.resetLastMinuteEditState();
    lastMinute.classList.remove('show');
  });
}

if (cancelLastMinuteBtn) {
  cancelLastMinuteBtn.addEventListener('click', () => {
    const form = document.getElementById('lastMinuteForm');
    if (form) form.reset();
  });
}

if (saveLastMinuteBtn) {
  saveLastMinuteBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const title = document.getElementById('lastMinuteTitle').value.trim();
    const rawDate = document.getElementById('lastMinuteDate').value;
    const duration = parseInt(document.getElementById('lastMinuteDuration').value, 10);
    const description = document.getElementById('lastMinuteDescription').value.trim();

    if (!title) {
      alert('Please enter an event title.');
      return;
    }

    const now = new Date();
    const date = rawDate || formatDate(now);
    const startHour = String(now.getHours()).padStart(2, '0');
    const startMin = String(now.getMinutes()).padStart(2, '0');
    const startTime = `${startHour}:${startMin}`;

    const endDate = new Date(now.getTime() + duration * 60000);
    const endHour = String(endDate.getHours()).padStart(2, '0');
    const endMin = String(endDate.getMinutes()).padStart(2, '0');
    const endTime = `${endHour}:${endMin}`;

    const newEvent = {
      id: Date.now().toString(),
      title,
      date,
      startTime,
      endTime,
      description
    };

    events.push(newEvent);
    renderEventsOnGrid();
    updateEventInfoText();

    document.getElementById('lastMinuteForm').reset();
    lastMinute.classList.remove('show');
    
    console.log('Last minute event created:', newEvent);
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
  // updateEventInfoText();
});

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
    const dateLabel = colDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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