import '../../main.js';
import { initTableListener } from './js/sheet.js';
import { initCardListeners } from './js/calendar.js';
import { initSettingsListeners, initInitialVals } from './js/settings.js';
import { initCategorySelectionListeners } from './js/handleCategorySelection.js';

initCardListeners();
initTableListener();
initInitialVals();
initSettingsListeners();
initCategorySelectionListeners();
