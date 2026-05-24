import { setAllRows, upsertRows } from './sheet.js';
import { getSummation } from './summary.js';
import { moveToPage } from '../../../main.js';

const budgetSheetId = await window.data.getSheetId();

// Card vars
const daysDiv = document.getElementById('days');
const calendar = document.querySelector('.calendar');
const calendarBody = document.querySelector('.calendar-body');
const calendarHeaderTitle = document.querySelector('.title');
const monthSelection = document.querySelector('.month-selection');
const daySelection = document.querySelector('.day-selection');
const cardHeader = document.querySelector('.card-header');
const budgetSheet = document.querySelector('.budget-sheet');
const exitButton = document.getElementById('exit');

// Calendar vars
const today = new Date();
let date = new Date();
let year = date.getFullYear();
let month = date.getMonth();
let monthName = '';
let day = 0;
let daysInMonth = new Date(year, month + 1, 0).getDate();

calendarHeaderTitle.textContent = year;

const currMonth = document.getElementById(today.getMonth());
const monthCells = document.querySelectorAll('.month-cell');
currMonth.classList.add('today');

// Budget sheet vars
const newName = document.querySelector('.new-row > .name-cell');
const newCategory = document.querySelector('.new-row > .category-cell');
const newCost = document.querySelector('.new-row > .cost-cell');

// Sets up the summation for the day, month, and year
function getDaySummation(year, month, day) {
  const monthStr = String(month + 1).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  getSummation(
    'Day',
    `${year}-${monthStr}-${dayStr}`,
    `${year}-${monthStr}-${dayStr}`,
    budgetSheetId
  );
}

function getMonthSummation(year, month) {
  const monthStr = String(month + 1).padStart(2, '0');
  const lastDay = new Date(year, month + 1, 0).getDate();
  getSummation('Month', `${year}-${monthStr}-01`, `${year}-${monthStr}-${lastDay}`, budgetSheetId);
}

export function getYearSummation(year) {
  getSummation('Year', `${year}-01-01`, `${year}-12-31`, budgetSheetId);
}

// Creates calendar and creates an array containing relevant information
async function createCalendar() {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const firstDate = new Date(year, month, 1).toISOString().slice(0, 10);
  const lastDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);
  const sumDayCalendar = await window.db.sumDayCalendar(firstDate, lastDate, budgetSheetId);

  let day = 1;

  function createDiv() {
    const div = document.createElement('div');
    div.classList.add('day-cell', 'no-select');
    return div;
  }

  // Sets up calendar and array
  for (let i = 0; i < firstDay; i++) {
    const dayCell = createDiv();
    daysDiv.appendChild(dayCell);
  }

  let dayIndex = 0;
  for (let i = 0; day <= daysInMonth; i = (i + 1) % 7, day++) {
    const dayCell = createDiv();
    const dayNumber = document.createElement('div');
    const dayBody = document.createElement('div');
    if (day == today.getDate() && month == today.getMonth() && year == today.getFullYear())
      dayCell.classList.add('today');

    dayCell.classList.add('flex', 'flex-down');
    dayNumber.classList.add('day-number');
    dayNumber.textContent = day;

    if (
      dayIndex < sumDayCalendar.length &&
      Number(sumDayCalendar[dayIndex].date.slice(8, 10)) === day
    ) {
      dayBody.textContent = `Exp: $${(Number(sumDayCalendar[dayIndex].total) / 100).toFixed(2)}`;
      dayIndex++;
    }

    dayCell.appendChild(dayNumber);
    dayCell.appendChild(dayBody);
    daysDiv.appendChild(dayCell);
  }

  let customDay = new Date(year, month, day).getDay();
  if (customDay !== 0) {
    for (; customDay !== 7; customDay++) {
      const dayCell = createDiv();
      daysDiv.appendChild(dayCell);
    }
  }

  return daysInMonth;
}

// Sums each month's expenses of the displayed year
async function sumMonthCalendar(startDate, endDate) {
  const sumMonthCalendar = await window.db.sumMonthCalendar(startDate, endDate, budgetSheetId);
  let monthIndex = 0;
  for (const monthCell of monthCells) {
    const month = Number(monthCell.id);
    const expense = monthCell.querySelector('.month-expense');
    if (
      monthIndex < sumMonthCalendar.length &&
      Number(sumMonthCalendar[monthIndex].month.slice(5, 7)) === month + 1
    ) {
      expense.textContent = `Exp: $${(sumMonthCalendar[monthIndex].total / 100).toFixed(2)}`;
      monthIndex++;
    } else {
      expense.textContent = 'Exp: ---';
    }
  }
}

// Initialize event listeners for the calendar
export function initCardListeners() {
  cardHeader.addEventListener('click', (event) => {
    const id = event.target.id;

    // Change years
    if (!monthSelection.classList.contains('display-none')) {
      if (id === 'left-arrow') {
        year--;
        calendarHeaderTitle.textContent = year;
        getYearSummation(year);
        sumMonthCalendar(`${year}-01-01`, `${year}-12-31`);
      } else if (id === 'right-arrow') {
        year++;
        calendarHeaderTitle.textContent = year;
        getYearSummation(year);
        sumMonthCalendar(`${year}-01-01`, `${year}-12-31`);
      }
    }
    // Change months and creates day calendar
    else if (!daySelection.classList.contains('display-none')) {
      if (id === 'left-arrow') {
        if (--month < 0) {
          month = 11;
          year--;
        }
        monthName = document.getElementById(month).querySelector('.month-name').textContent;
        calendarHeaderTitle.textContent = `${monthName}, ${year}`;
        calendarBody.innerHTML = '';
        daysInMonth = createCalendar();
        getMonthSummation(year, month);
      } else if (id === 'right-arrow') {
        if (++month > 11) {
          month = 0;
          year++;
        }
        monthName = document.getElementById(month).querySelector('.month-name').textContent;
        calendarHeaderTitle.textContent = `${monthName}, ${year}`;
        calendarBody.innerHTML = '';
        daysInMonth = createCalendar();
        getMonthSummation(year, month);
      }
      // Returns to month selection for the current year
      else if (event.target.classList.contains('title')) {
        monthSelection.classList.remove('display-none');
        daySelection.classList.add('display-none');
        calendarBody.innerHTML = '';
        calendarHeaderTitle.textContent = year;
        getYearSummation(year);
        sumMonthCalendar(`${year}-01-01`, `${year}-12-31`);
      }
    }
    // Changes budget sheet and shows budget data for that day
    else if (!budgetSheet.classList.contains('display-none')) {
      if (id === 'left-arrow') {
        upsertRows(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
        newName.value = '';
        newCategory.value = '';
        newCost.value = '';
        if (--day < 1) {
          if (--month < 0) {
            year--;
            month = 11;
          }
          monthName = document.getElementById(month).querySelector('.month-name').textContent;
          daysInMonth = new Date(year, month + 1, 0).getDate();
          day = daysInMonth;
        }
        setAllRows(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
        calendarHeaderTitle.textContent = `${monthName} ${day}, ${year}`;
        getDaySummation(year, month, day);
      } else if (id === 'right-arrow') {
        upsertRows(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
        newName.value = '';
        newCategory.value = '';
        newCost.value = '';
        if (++day > daysInMonth) {
          if (++month > 11) {
            year++;
            month = 0;
          }
          monthName = document.getElementById(month).querySelector('.month-name').textContent;
          daysInMonth = new Date(year, month + 1, 0).getDate();
          day = 1;
        }

        setAllRows(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
        calendarHeaderTitle.textContent = `${monthName} ${day}, ${year}`;
        getDaySummation(year, month, day);
      }
      // Returns to day selection for the current month and year
      else if (event.target.classList.contains('title')) {
        upsertRows(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
        newName.value = '';
        newCategory.value = '';
        newCost.value = '';
        budgetSheet.classList.add('display-none');
        daySelection.classList.remove('display-none');
        calendarHeaderTitle.textContent = `${monthName}, ${year}`;
        calendarBody.innerHTML = '';
        createCalendar();
        getMonthSummation(year, month);
      }
    }
  });

  // Creates a calendar based on the month clicked and opens budget sheet if a day is selected
  calendar.addEventListener('click', (event) => {
    // Month selected
    if (!monthSelection.classList.contains('display-none')) {
      const selectedCell = event.target.closest('.month-cell');
      if (!selectedCell) return;

      month = Number(selectedCell.id);
      date = new Date(year, month, 1);
      createCalendar();
      getMonthSummation(year, month);
      monthSelection.classList.add('display-none');
      daySelection.classList.remove('display-none');
      monthName = selectedCell.querySelector('.month-name').textContent;
      calendarHeaderTitle.textContent = `${monthName}, ${year}`;
    }
    // Day selected
    else if (!daySelection.classList.contains('display-none')) {
      const dayCell = event.target.closest('.day-cell');
      const dayNumber = dayCell.querySelector('.day-number');

      if (!dayCell || dayNumber.textContent === '') return;

      day = dayNumber.textContent;
      setAllRows(`${year}-${String(month + 1).padStart(2, '0')}-${day.padStart(2, '0')}`);
      getDaySummation(year, month, day);

      day = Number(day);
      daySelection.classList.add('display-none');
      budgetSheet.classList.remove('display-none');
      calendarHeaderTitle.textContent = `${monthName} ${day}, ${year}`;
    }
  });
}

export function initExitListener() {
  exitButton.addEventListener('click', () => {
    upsertRows(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    moveToPage('../home/home.html');
  });
}

window.urgentSave.manualExit(async () => {
  if (!budgetSheet.classList.contains('display-none')) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    await upsertRows(date);
  }

  await window.urgentSave.notifyReadyToQuit();
});

const startDate = `${year}-01-01`;
const endDate = `${year}-12-31`;
sumMonthCalendar(startDate, endDate);
