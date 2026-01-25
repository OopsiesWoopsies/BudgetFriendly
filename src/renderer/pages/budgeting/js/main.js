import '../../../main.js';
import { initTableListener } from './sheet.js';
import { initCardListeners } from './calendar.js';
import { initSettingsListeners, initInitialVals } from './settings.js';

initCardListeners();
initTableListener();
initInitialVals();
initSettingsListeners();
