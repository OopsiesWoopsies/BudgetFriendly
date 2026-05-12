import { initConfigListeners } from './js/config.js';
import { initBudgetSheetCreationListeners } from './js/budgetSheetCreation.js';
import { setupSheets, initHomeListeners } from './js/home.js';

setupSheets();
initHomeListeners();
initBudgetSheetCreationListeners();
initConfigListeners();
