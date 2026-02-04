import db from '../db.js';
import { ipcMain } from 'electron';
import { enqueue } from '../dbQueue.js';

// Db functions
function getEntries(date, budget_sheet_id) {
  return db
    .prepare('SELECT * FROM entries WHERE date = ? AND budget_sheet_id = ?')
    .all(date, budget_sheet_id);
}

function insertNewEntry(id, name, category_id, price, date, budget_sheet_id) {
  return db
    .prepare(
      `
      INSERT INTO entries 
      (id, name, category_id, price, date, budget_sheet_id) 
      VALUES (?, ?, ?, ?, ?, ?)
      `
    )
    .run(id, name, category_id, price, date, budget_sheet_id);
}

function deleteEntry(id) {
  return db.prepare('DELETE FROM entries WHERE id = ?').run(id).changes;
}

// Registers db functions for renderer use
export function registerEntriesIpc() {
  ipcMain.handle('entries:get', (_event, { date, budget_sheet_id }) => {
    return enqueue(() => getEntries(date, budget_sheet_id));
  });

  ipcMain.handle(
    'entries:create',
    (_event, { id, name, category_id, price, date, budget_sheet_id }) => {
      return enqueue(() => insertNewEntry(id, name, category_id, price, date, budget_sheet_id));
    }
  );

  ipcMain.handle('entries:delete', (_event, { id }) => {
    return enqueue(() => deleteEntry(id));
  });
}
