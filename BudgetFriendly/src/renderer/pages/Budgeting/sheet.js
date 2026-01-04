const daysDiv = document.getElementById('days');
const calendar = document.querySelector('.calendar');
const calendarBody = document.querySelector('.calendar-body');
const calendarHeaderTitle = document.querySelector('.title');
const monthSelection = document.querySelector('.month-selection');
const daySelection = document.querySelector('.day-selection');
const cardHeader = document.querySelector('.card-header');
const budgetSheet = document.querySelector('.budget-sheet');

let date = new Date();
let year = date.getFullYear();
let month = date.getMonth();

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
}

cardHeader.addEventListener('click', (event) => {
  if (!monthSelection.classList.contains('display-none')) {
    if (event.target.id === 'left-arrow') {
      year--;
      calendarHeaderTitle.textContent = year;
    } else if (event.target.id === 'right-arrow') {
      year++;
      calendarHeaderTitle.textContent = year;
    }
  }
  if (!daySelection.classList.contains('display-none')) {
    if (event.target.id === 'left-arrow') {
      if (--month < 0) {
        month = 11;
        year--;
      }
      monthName = document.getElementById(month).textContent;
      calendarHeaderTitle.textContent = `${monthName}, ${year}`;
      date = new Date(year, month, 1);
      calendarBody.innerHTML = '';
      createCalendar();
    } else if (event.target.id === 'right-arrow') {
      if (++month > 11) {
        month = 0;
        year++;
      }
      monthName = document.getElementById(month).textContent;
      calendarHeaderTitle.textContent = `${monthName}, ${year}`;
      date = new Date(year, month, 1);
      calendarBody.innerHTML = '';
      createCalendar();
    } else if (event.target.classList.contains('title')) {
      monthSelection.classList.remove('display-none');
      daySelection.classList.add('display-none');
      calendarBody.innerHTML = '';
      calendarHeaderTitle.textContent = year;
    }
  }
});

calendar.addEventListener('click', (event) => {
  const selectedCell = event.target.closest('.month-name');
  if (!selectedCell) {
    return;
  }
  if (!monthSelection.classList.contains('display-none')) {
    month = Number(event.target.id);
    date = new Date(year, month, 1);
    createCalendar();
    monthSelection.classList.add('display-none');
    daySelection.classList.remove('display-none');
    calendarHeaderTitle.textContent = `${selectedCell.textContent}, ${year}`;
  } else if (!daySelection.classList.contains('display-none')) {
  }
});
