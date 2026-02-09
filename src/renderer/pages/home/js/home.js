import { initSettingsListeners } from '../../budgeting/js/settings.js';

const addBugetButton = document.querySelector('.add-budget-button');
const creationPopUp = document.getElementById('settings');

export function initHomeListeners() {
  addBugetButton.addEventListener('click', () => {
    creationPopUp.showModal();
  });
}

initSettingsListeners();
