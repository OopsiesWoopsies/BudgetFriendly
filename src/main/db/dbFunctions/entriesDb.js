import db from '../db.js';
import { ipcMain } from 'electron';
import { enqueue } from '../dbQueue.js';

// Db functions
function getEntries(date, budgetSheetId) {
  return db
    .prepare('SELECT * FROM entries WHERE date = ? AND budget_sheet_id = ?')
    .all(date, budgetSheetId);
}

function insertNewEntry(id, name, categoryId, price, date, budgetSheetId) {
  return db
    .prepare(
      `
      INSERT INTO entries 
      (id, name, category_id, price, date, budget_sheet_id) 
      VALUES (?, ?, ?, ?, ?, ?)
      `
    )
    .run(id, name, categoryId, price, date, budgetSheetId);
}

function deleteEntry(id) {
  return db.prepare('DELETE FROM entries WHERE id = ?').run(id).changes;
}

// Registers db functions for renderer use
export function registerEntriesIpc() {
  ipcMain.handle('entries:get', (_event, { date, budgetSheetId }) => {
    return enqueue(() => getEntries(date, budgetSheetId));
  });

  ipcMain.handle(
    'entries:create',
    (_event, { id, name, categoryId, price, date, budgetSheetId }) => {
      return enqueue(() => insertNewEntry(id, name, categoryId, price, date, budgetSheetId));
    }
  );

  ipcMain.handle('entries:delete', (_event, { id }) => {
    return enqueue(() => deleteEntry(id));
  });
}
