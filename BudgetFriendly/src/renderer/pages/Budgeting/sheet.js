const daysDiv = document.getElementById('days');

const currDate = new Date();
const calendar = Array.from({ length: 5 }, () => Array(7).fill(null));

const year = currDate.getFullYear();
const month = currDate.getMonth();

const daysInMonth = new Date(year, month + 1, 0).getDate();
const firstDay = new Date(year, month, 1).getDay();

function createCalendar() {
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
    calendar[week][i] = day;
    createDiv(daysDiv, day);
  }

  let customDay = new Date(year, month, day).getDay();
  if (customDay !== 0) {
    for (; customDay !== 7; customDay++) {
      createDiv(daysDiv, '');
    }
  }
}

createCalendar();
