import db from '../db.js';
import { ipcMain } from 'electron';
import { enqueue } from '../dbQueue.js';

// Db functions
function getBudgetSheets() {
  return db.prepare('SELECT * FROM budget_sheets').all();
}

function insertNewBudgetSheet(id, title, created_at, period, budget) {
  return db
    .prepare(
      `
      INSERT INTO budget_sheets (id, title, created_at, period, budget) 
      VALUES (?, ?, ?, ?, ?)
      `
    )
    .run(id, title, created_at, period, budget);
}

function deleteBudgetSheet(id) {
  return db.prepare('DELETE FROM budget_sheets WHERE id = ?').run(id).changes;
}

// Registers db functions for renderer use
export function registerSheetIpc() {
  ipcMain.handle('budgetSheets:get', () => {
    return enqueue(() => getBudgetSheets());
  });

  ipcMain.handle('budgetSheets:create', (_event, { id, title, created_at, period, budget }) => {
    return enqueue(() => insertNewBudgetSheet(id, title, created_at, period, budget));
  });

  ipcMain.handle('budgetSheets:delete', (_event, { id }) => {
    return enqueue(() => deleteBudgetSheet(id));
  });
}
