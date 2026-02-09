import '../../main.js';
import { initTableListener } from './js/sheet.js';
import { initCardListeners } from './js/calendar.js';
import { initSettingsListeners, initInitialVals } from './js/settings.js';

initCardListeners();
initTableListener();
initInitialVals();
initSettingsListeners();
