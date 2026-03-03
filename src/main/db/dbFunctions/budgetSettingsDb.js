import db from '../db.js';
import { ipcMain } from 'electron';
import { enqueue } from '../dbQueue.js';

// Db functions
function getCategories(budgetSheetId) {
  return db.prepare('SELECT * FROM category WHERE budget_sheet_id = ?').all(budgetSheetId);
}

function upsertCategories(stagedChanges, budgetSheetId) {
  const transaction = db.transaction(() => {
    const deleteStatement = db.prepare('DELETE FROM category WHERE id = ?');
    const updateStatement = db.prepare('UPDATE category SET name = ? WHERE id = ?');
    const addStatement = db.prepare(
      'INSERT INTO category (id, name, budget_sheet_id) VALUES (?, ?, ?)'
    );

    for (const id of stagedChanges.removing.keys()) {
      deleteStatement.run(id);
    }
    for (const [id, value] of stagedChanges.editing) {
      updateStatement.run(value, id);
    }
    for (const [id, value] of stagedChanges.adding) {
      addStatement.run(id, value, budgetSheetId);
    }
  });

  return transaction();
}

// Registers db functions for renderer use
export function registerBudgetSettingsIpc() {
  ipcMain.handle('categories:get', (_event, { budgetSheetId }) => {
    return enqueue(() => getCategories(budgetSheetId));
  });

  ipcMain.handle('categories:create', (_event, { stagedChanges, budgetSheetId }) => {
    return enqueue(() => upsertCategories(stagedChanges, budgetSheetId));
  });
}
