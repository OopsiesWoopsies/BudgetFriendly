import { initCategoryToolsListeners, stagedChanges } from '../../budgeting/js/settings.js';
import { stagedChangesCleanup } from '../../budgeting/js/handleCategorySelection.js';

const openModalButton = document.querySelector('.open-settings-button');
const modal = document.getElementById('settings');
const modalBackButton = document.querySelector('.back-button');
const submitButton = document.querySelector('.submit-button');
const titleInput = document.querySelector('.new-title');
const periodDropdown = document.querySelector('.period-dropdown');
const budgetAmount = document.querySelector('.budget-amount');

export function initBudgetSheetCreationListeners() {
  openModalButton.addEventListener('click', () => {
    modal.showModal();
  });

  titleInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      titleInput.blur();
    }
  });

  // Check for budget sheet creation
  submitButton.addEventListener('click', async () => {
    if (budgetAmount.value === '') {
      budgetAmount.classList.add('invalid');
      budgetAmount.placeholder = 'CANNOT BE EMPTY';
    } else {
      budgetAmount.classList.remove('invalid');
      budgetAmount.placeholder = '1234.56';
    }
    if (periodDropdown.value === '') {
      periodDropdown.classList.add('invalid');
    } else {
      periodDropdown.classList.remove('invalid');
    }
    if (budgetAmount.value === '' || periodDropdown === '') {
      return;
    }
    // Post to db
    const sheetId = crypto.randomUUID();
    const today = new Date();
    const year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, '0');
    let day = String(today.getDate()).padStart(2, '0');
    const todayISO = `${year}-${month}-${day}`;

    const period = periodDropdown.value;
    let title = titleInput.value.trim();
    if (title === '') title = titleInput.placeholder;
    await window.db.createNewBudgetSheet(sheetId, title, todayISO, period);

    const budgetId = crypto.randomUUID();
    const budget = parseInt(budgetAmount.value * 100);
    let effectiveFrom;
    switch (periodDropdown.value) {
      case 'daily':
        break;
      case 'weekly':
      case 'biweekly':
        if (today.getDay() !== 0) {
          day = today.getDate() - today.getDay();
          // !check if it goes behind a month or year
          break;
        }
        break;
      case 'monthly':
        day = '01';
        break;
      case 'yearly':
        day = '01';
        month = '01';
        break;
    }
    effectiveFrom = `${year}-${month}-${day}`;
    await window.db.createNewBudgetAmount(budgetId, budget, effectiveFrom, null, sheetId);

    stagedChangesCleanup();
    await window.db.upsertCategories(stagedChanges, sheetId);

    window.location.href = '../budgeting/sheet.html';
  });

  modalBackButton.addEventListener('click', () => {
    modal.close();
    periodDropdown.classList.remove('invalid');
    budgetAmount.classList.remove('invalid');
    periodDropdown.value = '';
    budgetAmount.value = '';
    budgetAmount.placeholder = '1234.56';
    titleInput.value = '';

    // !delete html
  });
}

initCategoryToolsListeners();