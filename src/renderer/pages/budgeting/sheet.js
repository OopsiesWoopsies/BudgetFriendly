const title = document.querySelector('.header-title');

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
const newTitleInput = document.querySelector('.new-title');
const editCategoryHeader = document.querySelector('.description.header');
const categoriesTitle = document.getElementById('categories-header');
const categoryToolButtons = document.querySelector('.edit-tools');
const categoryList = document.querySelector('.categories');
const newCategoryInput = document.getElementById('category-input');

let budgetSheetTitle = '';
// !GET req for budget sheet title

// Calendar vars
let date = new Date();
let year = date.getFullYear();
let month = date.getMonth();
let monthName = '';
let day = 0;
let daysInMonth = new Date(year, month + 1, 0).getDate();

calendarHeaderTitle.textContent = year;

// Calendar settings vars
let isAddingCategory = true;
let isEditingCategory = false;
let isRemovingCategory = false;

// Creates calendar and creates an array containing relevant information
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

  // Sets up calendar and array
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

  // !Need to return array
  return daysInMonth;
}

// Initialize event listeners for the calendar
function initCardListeners() {
  cardHeader.addEventListener('click', (event) => {
    const id = event.target.id;

    // Change years
    if (!monthSelection.classList.contains('display-none')) {
      if (id === 'left-arrow') {
        year--;
        calendarHeaderTitle.textContent = year;
      } else if (id === 'right-arrow') {
        year++;
        calendarHeaderTitle.textContent = year;
      }
    }
    // Change months and creates day calendar
    else if (!daySelection.classList.contains('display-none')) {
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
      }
      // Returns to month selection for the current year
      else if (event.target.classList.contains('title')) {
        monthSelection.classList.remove('display-none');
        daySelection.classList.add('display-none');
        calendarBody.innerHTML = '';
        calendarHeaderTitle.textContent = year;
        console.log('consider this done too');
      }
    }
    // Changes budget sheet and shows budget data for that day
    else if (!budgetSheet.classList.contains('display-none')) {
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
      }
      // Returns to day selection for the current month and year
      else if (event.target.classList.contains('title')) {
        budgetSheet.classList.add('display-none');
        daySelection.classList.remove('display-none');
        calendarHeaderTitle.textContent = `${monthName}, ${year}`;
        calendarBody.innerHTML = '';
        createCalendar();
      }
    }
  });

  // Creates a calendar based on the month clicked and opens budget sheet if a day is selected
  calendar.addEventListener('click', (event) => {
    // Month selected
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
    }
    // Day selected
    else if (!daySelection.classList.contains('display-none')) {
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
  // Function Vars
  let button = null;

  // Settings Header listeners
  settingsButton.addEventListener('click', () => {
    settingsModal.showModal();
  });

  settingsBackButton.addEventListener('click', () => {
    settingsModal.close();
  });

  // Budget Sheet Title listeners
  newTitleInput.addEventListener('change', () => {
    budgetSheetTitle = newTitleInput.value;
    title.textContent = budgetSheetTitle;
  });

  newTitleInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      newTitleInput.blur();
    }
  });

  // Category Tools listeners
  function addCategoryButton() {
    newCategoryInput.blur();
    newCategoryInput.value = newCategoryInput.value.trim();

    if (newCategoryInput.value === '') return;
    // Creates editor div and its relevant children and moves input element to the back
    const div = document.createElement('div');
    const button = document.createElement('button');
    const input = document.createElement('input');
    div.classList.add('category-editor');
    button.classList.add('category', 'custom-button', 'label');
    button.textContent = newCategoryInput.value;
    input.classList.add('new-category', 'custom-input', 'editor', 'display-none');
    input.maxLength = '15';
    input.placeholder = '___________';
    newCategoryInput.value = '';

    const newInput = categoryList.removeChild(newCategoryInput);
    div.appendChild(button);
    div.appendChild(input);
    categoryList.appendChild(div);
    categoryList.appendChild(newInput);

    // !POST req to db for new category
  }

  // Adds a new category
  function addCategory() {
    newCategoryInput.addEventListener('keydown', (event) => {
      if (!isAddingCategory) return;
      if (event.key === 'Enter') addCategoryButton();
    });

    newCategoryInput.addEventListener('change', () => {
      if (!isAddingCategory) return;
      addCategoryButton();
    });
  }

  // Edits a category name when clicked
  function editCategory() {
    // Applies changes made to categories
    function applyChanges(target) {
      const input = target;
      const button = target.closest('.category-editor').querySelector('.label');
      const originalText = button.textContent;
      input.blur();
      input.value = input.value.trim();

      if (input.value === '') input.value = originalText;
      button.textContent = input.value;
      input.classList.add('display-none');
      button.classList.remove('display-none');

      // !POST req to change category name
    }

    categoryList.addEventListener('click', (event) => {
      if (!isEditingCategory) return;
      if (event.target.classList.contains('label')) {
        const button = event.target;
        const input = event.target.closest('.category-editor').querySelector('.editor');

        input.value = button.textContent;
        button.classList.add('display-none');
        input.classList.remove('display-none');
        input.focus();

        // Avoids duplicate listeners
        const handleBlur = (event) => {
          if (!isEditingCategory) return;
          applyChanges(event.target);
          event.target.removeEventListener('blur', handleBlur);
        };

        input.addEventListener('blur', handleBlur);
      }
    });

    categoryList.addEventListener('keydown', (event) => {
      if (!isEditingCategory) return;
      if (event.key === 'Enter') {
        applyChanges(event.target);
      }
    });
  }

  // Removes a category
  function removeCategory() {
    let isConfirming = false;

    categoryList.addEventListener('click', (event) => {
      if (!isRemovingCategory) return;

      if (event.target.classList.contains('remove-confirm')) {
        isConfirming = false;
        button = null;
        const element = event.target.closest('.category-editor');
        categoryList.removeChild(element);

        // !POST req to remove category
      } else if (event.target.classList.contains('label')) {
        if (!isConfirming) {
          button = event.target;
          button.classList.add('remove-confirm');
          isConfirming = true;
        } else if (button !== null) {
          button.classList.remove('remove-confirm');
          button = event.target;
          button.classList.add('remove-confirm');
        }
      }
    });
  }

  categoryToolButtons.addEventListener('click', (event) => {
    // Removes confirmation for removal
    if (button !== null) button.classList.remove('remove-confirm');

    const id = event.target.id;

    // Checks category to update header accordingly
    switch (id) {
      case 'add-category':
        editCategoryHeader.classList.remove('edit-category-name-mode', 'remove-category-mode');
        editCategoryHeader.classList.add('add-category-mode');
        categoriesTitle.textContent = 'Add a Category';
        newCategoryInput.classList.remove('display-none');
        isAddingCategory = true;
        isEditingCategory = false;
        isRemovingCategory = false;
        break;

      case 'edit-category-name':
        editCategoryHeader.classList.remove('add-category-mode', 'remove-category-mode');
        editCategoryHeader.classList.add('edit-category-name-mode');
        categoriesTitle.textContent = 'Edit a Category Name';
        newCategoryInput.classList.add('display-none');
        isAddingCategory = false;
        isEditingCategory = true;
        isRemovingCategory = false;
        break;

      case 'remove-category':
        editCategoryHeader.classList.remove('edit-category-name-mode', 'add-category-mode');
        editCategoryHeader.classList.add('remove-category-mode');
        categoriesTitle.textContent = 'Remove a Category';
        newCategoryInput.classList.add('display-none');
        isAddingCategory = false;
        isEditingCategory = false;
        isRemovingCategory = true;
        break;
    }
  });

  addCategory();
  editCategory();
  removeCategory();
}

function initInitialVals() {
  newTitleInput.value = budgetSheetTitle;
}

// !TODO
// Create a dropdown menu when selecting category in the table
// Add new row to the table when and if any of the cells are filled with anything other than whitespace
// Remove row when if all cells empty (consider creating a delete button)

// Create backend

// Create a function for GET req for:
//  all the categories and create all the buttons in the settings and in the category drop down
//  all the names, categories, and prices to fill the table
//  the title of the budget sheet

// Create POST reqs, consider doing it all upon closing page or having a submit button (POST if crash as well)

initCardListeners();
initSettingsListeners();
initInitialVals();
