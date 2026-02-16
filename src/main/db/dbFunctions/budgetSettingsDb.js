import db from '../db.js';
import { ipcMain } from 'electron';
import { enqueue } from '../dbQueue.js';

// Db functions
function getCategories(budget_sheet_id) {
  return db.prepare('SELECT * FROM category WHERE budget_sheet_id = ?').all(budget_sheet_id);
}

function upsertCategories(stagedChanges, budget_sheet_id) {
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
      addStatement.run(id, value, budget_sheet_id);
    }
  });

  return transaction();
}

// Registers db functions for renderer use
export function registerBudgetSettingsIpc() {
  ipcMain.handle('categories:get', (_event, { budget_sheet_id }) => {
    return enqueue(() => getCategories(budget_sheet_id));
  });

  ipcMain.handle('categories:create', (_event, { stagedChanges, budget_sheet_id }) => {
    return enqueue(() => upsertCategories(stagedChanges, budget_sheet_id));
  });
}
