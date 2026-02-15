import { initSettingsListeners } from '../../budgeting/js/settings.js';

const submitButton = document.querySelector('.submit-button');
const periodDropdown = document.querySelector('.period-dropdown');
const budgetAmount = document.getElementById('budget-amount');

export function initHomeListeners() {
  // Check for budget sheet creation
  submitButton.addEventListener('click', () => {
    if (periodDropdown.value === '' || budgetAmount.value === '') {
      // Inform user these bad boys can't be empty
      periodDropdown.classList.add('invalid');
      budgetAmount.classList.add('invalid');
      budgetAmount.placeholder = 'CANNOT BE EMPTY';
      return;
    }
    periodDropdown.value = '';
    budgetAmount.value = '';
    budgetAmount.placeholder = 1234.56;
    periodDropdown.classList.remove('invalid');
    budgetAmount.classList.remove('invalid');

    // Move to next page and make new budget sheet
  });
}

initSettingsListeners();

// TODO list
// Create budget sheet listing
