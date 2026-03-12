import { getSheetTitle, updateSheetTitle } from '../main.js';

const newTitleInput = document.querySelector('.new-title');
const title = document.querySelector('.header-title');

const sheetId = await window.data.getSheetId();
let budgetSheetTitle = await getSheetTitle(sheetId);

// Set header title to match with budget sheet title
title.textContent = budgetSheetTitle;

export function initInitialVals() {
  newTitleInput.placeholder = budgetSheetTitle;
}

// Budget Sheet Title listeners
export function initTitleInputListeners() {
  newTitleInput.addEventListener('change', () => {
    newTitleInput.value = newTitleInput.value.trim();
    if (newTitleInput.value === '') return;
    budgetSheetTitle = newTitleInput.value;
    title.textContent = budgetSheetTitle;
    updateSheetTitle(sheetId, budgetSheetTitle);
  });

  newTitleInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      newTitleInput.blur();
    }
  });
}
