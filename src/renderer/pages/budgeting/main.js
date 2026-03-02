import '../../main.js';
import { initTableListener } from './js/sheet.js';
import { initCardListeners } from './js/calendar.js';
import { initSettingsListeners, initCategoryToolsListeners } from './js/settings.js';
import { initCategorySelectionListeners, getCategories } from './js/handleCategorySelection.js';
import { initInitialVals, initTitleInputListeners } from './js/header.js';

export async function getSheetId() {
  return await window.data.getSheetId();
}

export async function getSheetTitle(id) {
  return (await window.db.getBudgetSheets(id)).title;
}

export async function updateSheetTitle(id, newTitle) {
  await window.db.updateBudgetSheetTitle(id, newTitle);
}

// Initialize listeners and initial vars
initCardListeners();
initTableListener();
initTitleInputListeners();
initInitialVals();
initSettingsListeners();
initCategoryToolsListeners();
initCategorySelectionListeners();
getCategories(await getSheetId());
