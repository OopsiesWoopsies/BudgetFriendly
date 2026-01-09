const daysDiv = document.getElementById('days');
const calendar = document.querySelector('.calendar');
const calendarBody = document.querySelector('.calendar-body');
const calendarHeaderTitle = document.querySelector('.title');
const monthSelection = document.querySelector('.month-selection');
const daySelection = document.querySelector('.day-selection');
const cardHeader = document.querySelector('.card-header');
const budgetSheet = document.querySelector('.budget-sheet');

const settingsButton = document.querySelector('.header-title');
const settingsModal = document.getElementById('settings');
const settingsBackButton = document.querySelector('.modal-back-button');

let date = new Date();
let year = date.getFullYear();
let month = date.getMonth();
let monthName = '';
let day = 0;
let daysInMonth = new Date(year, month + 1, 0).getDate();

calendarHeaderTitle.textContent = year;

function createCalendar() {
  let calendarArr = Array.from({ length: 5 }, () => Array(7).fill(null));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  let day = 1;
  let week = 0;

  function createDiv(container, content) {
    const div = document.createElement('div');
    div.textContent = content;
    div.classList.add('day-number', 'no-select');
    container.appendChild(div);
  }

  for (let i = 0; i < firstDay; i++) {
    createDiv(daysDiv, '');
  }

  for (let i = 0; day <= daysInMonth; i++, day++) {
    if (i == 7) {
      week++;
      i = 0;
    }
    calendarArr[week][i] = day;
    createDiv(daysDiv, day);
  }

  let customDay = new Date(year, month, day).getDay();
  if (customDay !== 0) {
    for (; customDay !== 7; customDay++) {
      createDiv(daysDiv, '');
    }
  }
  return daysInMonth;
}

function initCardListeners() {
  cardHeader.addEventListener('click', (event) => {
    const id = event.target.id;
    if (!monthSelection.classList.contains('display-none')) {
      if (id === 'left-arrow') {
        year--;
        calendarHeaderTitle.textContent = year;
      } else if (id === 'right-arrow') {
        year++;
        calendarHeaderTitle.textContent = year;
      }
    } else if (!daySelection.classList.contains('display-none')) {
      if (id === 'left-arrow') {
        if (--month < 0) {
          month = 11;
          year--;
        }
        monthName = document.getElementById(month).textContent;
        calendarHeaderTitle.textContent = `${monthName}, ${year}`;
        calendarBody.innerHTML = '';
        daysInMonth = createCalendar();
      } else if (id === 'right-arrow') {
        if (++month > 11) {
          month = 0;
          year++;
        }
        monthName = document.getElementById(month).textContent;
        calendarHeaderTitle.textContent = `${monthName}, ${year}`;
        calendarBody.innerHTML = '';
        daysInMonth = createCalendar();
      } else if (event.target.classList.contains('title')) {
        monthSelection.classList.remove('display-none');
        daySelection.classList.add('display-none');
        calendarBody.innerHTML = '';
        calendarHeaderTitle.textContent = year;
        console.log('consider this done too');
      }
    } else if (!budgetSheet.classList.contains('display-none')) {
      if (id === 'left-arrow') {
        if (--day < 1) {
          if (--month < 0) {
            year--;
            month = 11;
          }
          monthName = document.getElementById(month).textContent;
          daysInMonth = new Date(year, month + 1, 0).getDate();
          day = daysInMonth;
        }
        calendarHeaderTitle.textContent = `${monthName} ${day}, ${year}`;
      } else if (id === 'right-arrow') {
        if (++day > daysInMonth) {
          if (++month > 11) {
            year++;
            month = 0;
          }
          monthName = document.getElementById(month).textContent;
          daysInMonth = new Date(year, month + 1, 0).getDate();
          day = 1;
        }
        calendarHeaderTitle.textContent = `${monthName} ${day}, ${year}`;
      } else if (event.target.classList.contains('title')) {
        budgetSheet.classList.add('display-none');
        daySelection.classList.remove('display-none');
        calendarHeaderTitle.textContent = `${monthName}, ${year}`;
        calendarBody.innerHTML = '';
        createCalendar();
      }
    }
  });

  calendar.addEventListener('click', (event) => {
    if (!monthSelection.classList.contains('display-none')) {
      const selectedCell = event.target.closest('.month-name');
      if (!selectedCell) return;

      month = Number(selectedCell.id);
      date = new Date(year, month, 1);
      createCalendar();
      monthSelection.classList.add('display-none');
      daySelection.classList.remove('display-none');
      monthName = selectedCell.textContent;
      calendarHeaderTitle.textContent = `${monthName}, ${year}`;
    } else if (!daySelection.classList.contains('display-none')) {
      const selectedCell = event.target.closest('.day-number');
      if (!selectedCell || selectedCell.textContent === '') return;

      daySelection.classList.add('display-none');
      budgetSheet.classList.remove('display-none');
      day = Number(selectedCell.textContent);
      calendarHeaderTitle.textContent = `${monthName} ${day}, ${year}`;
    }
  });
}

function initSettingsListeners() {
  settingsButton.addEventListener('click', () => {
    settingsModal.showModal();
  });

  settingsBackButton.addEventListener('click', () => {
    settingsModal.close();
  });
}

initCardListeners();
initSettingsListeners();
