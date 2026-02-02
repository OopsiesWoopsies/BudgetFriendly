import db from '../db.js';
import { ipcMain } from 'electron';
import { enqueue } from '../dbQueue.js';

export function registerSheetIpc() {
  ipcMain.handle('budgetSheets:get', () => {
    return enqueue(() => {
      db.prepare('SELECT * FROM budget_sheets').all();
    });
  });
  // Insert into table (new sheet)
  // Delete table
}
