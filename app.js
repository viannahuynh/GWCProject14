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