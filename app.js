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


/* Last Minute */
if (openLastMinuteEvent && lastMinute) {
  openLastMinuteEvent.addEventListener('click', () => {
    lastMinute.classList.add('show');
  });
}

if (closeLastMinuteEvent && lastMinute) {
  closeLastMinuteEvent.addEventListener('click', () => {
    lastMinute.classList.remove('show');
  });
}

if (cancelLastMinuteBtn) {
    cancelLastMinuteBtn.addEventListener('click', () => {
        const form = document.getElementById('lastMinuteForm');
        form.reset();  // This clears all form fields
    });
}

if(saveLastMinuteBtn){
  saveLastMinuteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('lastMinuteTitle').value;
    const date = document.getElementById('lastMinuteDate').value;
    const description = document.getElementById('lastMinuteDescription').value;
    
    document.getElementById('eventInfoText').innerHTML = `
      <strong>Event Created!</strong><br>
      Title: ${title}<br>
      Date: ${date}<br>
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
