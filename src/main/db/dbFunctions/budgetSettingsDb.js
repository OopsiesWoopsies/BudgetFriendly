import db from '../db.js';
import { ipcMain } from 'electron';
import { enqueue } from '../dbQueue.js';

// Db functions
function getCategories(budget_sheet_id) {
  return db.prepare('SELECT * FROM category WHERE budget_sheet_id = ?').all(budget_sheet_id);
}

function insertNewCategory(id, name, budget_sheet_id) {
  return db
    .prepare('INSERT INTO category (id, name, budget_sheet_id) VALUES (?, ?, ?)')
    .run(id, name, budget_sheet_id);
}

function deleteCategory(id) {
  return db.prepare('DELETE FROM category WHERE id = ?').run(id).changes;
}

// Registers db functions for renderer use
export function registerBudgetSettingsIpc() {
  ipcMain.handle('categories:get', (_event, { budget_sheet_id }) => {
    return enqueue(() => getCategories(budget_sheet_id));
  });

  ipcMain.handle('categories:create', (_event, { id, name, budget_sheet_id }) => {
    return enqueue(() => insertNewCategory(id, name, budget_sheet_id));
  });

  ipcMain.handle('categories:delete', (_event, { id }) => {
    return enqueue(() => deleteCategory(id));
  });
}
