import '../../main.js';
import { initTableListener } from './js/sheet.js';
import { initCardListeners, initExitListener, getYearSummation } from './js/calendar.js';
import { initSettingsListeners, initCategoryToolsListeners } from './js/settings.js';
import { initCategorySelectionListeners, getCategories } from './js/handleCategorySelection.js';
import { initInitialVals, initTitleInputListeners } from './js/header.js';
import { initPieChart } from './js/summary.js';

export async function getSheetTitle(id) {
  return (await window.db.getBudgetSheets(id)).title;
}

export async function updateSheetTitle(id, newTitle) {
  await window.db.updateBudgetSheetTitle(id, newTitle);
}

// Initialize listeners and initial vars
initCardListeners();
initExitListener();
initTableListener();
initTitleInputListeners();
initInitialVals();
initSettingsListeners();
initCategoryToolsListeners();
initCategorySelectionListeners();
getCategories();
initPieChart();

const year = new Date().getFullYear();
getYearSummation(year);
