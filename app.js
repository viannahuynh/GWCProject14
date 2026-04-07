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

/* Functions */

/* Display Area */
// Function to display events
function displayEvents() {
  const eventsList = document.getElementById('eventsList');
    
  if (!eventsList) return;
    
   if (events.length === 0) {
    eventsList.innerHTML = '<p class="no-events">✨ No events yet. Create one! ✨</p>';
    return;
  }
}

/* Create */
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
        form.reset();  // This clears all form fields
    });
}

if (saveEventBtn) {
  saveEventBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('eventTitle').value;
    const date = document.getElementById('eventDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const description = document.getElementById('eventDescription').value;
    
    
    document.getElementById('eventInfoText').innerHTML = `
        <strong>Event Created!</strong><br>
        Title: ${title}<br>
        Date: ${date}<br>
        Time: ${startTime} - ${endTime}<br>
        Description: ${description}
    `;
    
    document.getElementById('eventInfo').style.display = 'block';
    document.getElementById('eventForm').reset();
    createEvent.classList.remove('show');
  });
}

function initLastMinuteEventSystem() {
  let lastMinuteEvents = [];
  let editingLastMinuteEventId = null;

  function addLastMinuteEventToCalendar(eventObj) {
    const selectedDate = new Date(eventObj.date + "T00:00:00");
    const dayIndex = selectedDate.getDay();

    const targetCell = document.querySelector(
      `.day-cell[data-day-index="${dayIndex}"][data-row-index="${eventObj.rowIndex}"]`
    );

    if (!targetCell) {
      return;
    }

    targetCell.innerHTML += `
      <div class="last-minute-event" data-event-id="${eventObj.id}">
        <strong>${eventObj.title}</strong><br>
        ${eventObj.duration} min
      </div>
    `;
  }

  function renderLastMinuteEvents() {
    const allDayCells = document.querySelectorAll('.day-cell');

    allDayCells.forEach(cell => {
      cell.innerHTML = "";
      cell.removeAttribute('title');
    });

    lastMinuteEvents.forEach(eventObj => {
      addLastMinuteEventToCalendar(eventObj);
    });

    attachLastMinuteEventClickHandlers();
  }

  function attachLastMinuteEventClickHandlers() {
    const eventElements = document.querySelectorAll('.last-minute-event');

    eventElements.forEach(eventElement => {
      eventElement.addEventListener('click', () => {
        const eventId = Number(eventElement.dataset.eventId);
        const eventToEdit = lastMinuteEvents.find(event => event.id === eventId);

        if (!eventToEdit) {
          return;
        }

        document.getElementById('lastMinuteTitle').value = eventToEdit.title;
        document.getElementById('lastMinuteDate').value = eventToEdit.date;
        document.getElementById('lastMinuteDuration').value = eventToEdit.duration;
        document.getElementById('lastMinuteDescription').value = eventToEdit.description;

        editingLastMinuteEventId = eventToEdit.id;
        lastMinute.classList.add('show');
      });
    });
  }

  function saveLastMinuteEvent(title, date, duration, description) {
    if (!title || !date) {
      alert("Please enter a title and date.");
      return false;
    }

    const rowIndex = new Date().getHours();

    if (editingLastMinuteEventId !== null) {
      const eventToUpdate = lastMinuteEvents.find(event => event.id === editingLastMinuteEventId);

      if (eventToUpdate) {
        eventToUpdate.title = title;
        eventToUpdate.date = date;
        eventToUpdate.duration = duration;
        eventToUpdate.description = description;
      }

      editingLastMinuteEventId = null;
    } else {
      const newEvent = {
        id: Date.now(),
        title: title,
        date: date,
        duration: duration,
        description: description,
        rowIndex: rowIndex
      };

      lastMinuteEvents.push(newEvent);
    }

    renderLastMinuteEvents();
    return true;
  }

  function resetLastMinuteEditState() {
    editingLastMinuteEventId = null;
  }

  return {
    saveLastMinuteEvent,
    resetLastMinuteEditState
  };
}

const lastMinuteEventSystem = initLastMinuteEventSystem();

/* Last Minute */
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
        form.reset();  // This clears all form fields
        lastMinuteEventSystem.resetLastMinuteEditState();
    });
}

if(saveLastMinuteBtn){
  saveLastMinuteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('lastMinuteTitle').value;
    const date = document.getElementById('lastMinuteDate').value;
    const duration = document.getElementById('lastMinuteDuration').value;
    const description = document.getElementById('lastMinuteDescription').value;
    
    const wasSaved = lastMinuteEventSystem.saveLastMinuteEvent(title, date, duration, description);
    if (!wasSaved) {
      return;
    }

    document.getElementById('eventInfoText').innerHTML = `
      <strong>Event Created!</strong><br>
      Title: ${title}<br>
      Date: ${date}<br>
      Duration: ${duration} min<br>
      Description: ${description}
    `;
    
    document.getElementById('eventInfo').style.display = 'block';
    document.getElementById('lastMinuteForm').reset();
    lastMinute.classList.remove('show');
  });
}
/*============================================================== 
 Modal end
  ============================================================== */
  /*============================================================== 
  calendar Grid start
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
  calendar Grid end
  ============================================================== */