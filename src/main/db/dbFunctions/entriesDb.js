import db from '../db.js';
import { ipcMain } from 'electron';
import { enqueue } from '../dbQueue.js';

// Db functions
function getEntries(date, budgetSheetId) {
  return db
    .prepare(
      `
      SELECT 
        id,
        name,
        category_id AS categoryId,
        price,
        date,
        budget_sheet_id AS budgetSheetId
      FROM entries WHERE date = ? AND budget_sheet_id = ?`
    )
    .all(date, budgetSheetId);
}

function upsertEntries(stagedChanges, date, budgetSheetId) {
  const transaction = db.transaction(() => {
    const deleteStatement = db.prepare('DELETE FROM entries WHERE id = ?');
    const updateStatement = db.prepare(
      'UPDATE entries SET name = ?, category_id = ?, price = ? WHERE id = ?'
    );
    const addStatement = db.prepare(
      `INSERT INTO entries (id, name, category_id, price, date, budget_sheet_id) 
        VALUES (?, ?, ?, ?, ?, ?)`
    );

    for (const id of stagedChanges.removing.keys()) {
      deleteStatement.run(id);
    }
    for (const [id, info] of stagedChanges.editing) {
      updateStatement.run(info.name, info.categoryId, info.price, id);
    }
    for (const [id, info] of stagedChanges.adding) {
      addStatement.run(id, info.name, info.categoryId, info.price, date, budgetSheetId);
    }
  });

  return transaction();
}

// Registers db functions for renderer use
export function registerEntriesIpc() {
  ipcMain.handle('entries:get', (_event, { date, budgetSheetId }) => {
    return enqueue(() => getEntries(date, budgetSheetId));
  });

  ipcMain.handle('entries:upsert', (_event, { stagedChanges, date, budgetSheetId }) => {
    return enqueue(() => upsertEntries(stagedChanges, date, budgetSheetId));
  });
}
