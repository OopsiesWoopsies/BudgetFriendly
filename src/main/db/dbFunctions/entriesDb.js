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
        cost / 100.0 AS cost,
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
      'UPDATE entries SET name = ?, category_id = ?, cost = ? WHERE id = ?'
    );
    const addStatement = db.prepare(
      `INSERT INTO entries (id, name, category_id, cost, date, budget_sheet_id) 
        VALUES (?, ?, ?, ?, ?, ?)`
    );

    for (const id of stagedChanges.removing.keys()) {
      deleteStatement.run(id);
    }
    for (const [id, info] of stagedChanges.editing) {
      updateStatement.run(info.name, info.categoryId, info.cost, id);
    }
    for (const [id, info] of stagedChanges.adding) {
      addStatement.run(id, info.name, info.categoryId, info.price, date, budgetSheetId);
    }
  });

  return transaction();
}

function sumEntries(startDate, endDate, budgetSheetId) {
  const row = db
    .prepare(
      `
    SELECT SUM(cost) AS grandTotal 
    FROM entries 
    WHERE budget_sheet_id = ? AND date >= ? AND date <= ?`
    )
    .get(budgetSheetId, startDate, endDate);

  if (row.grandTotal === null) return 0;

  return row.grandTotal / 100;
}

// Registers db functions for renderer use
export function registerEntriesIpc() {
  ipcMain.handle('entries:get', (_event, { date, budgetSheetId }) => {
    return enqueue(() => getEntries(date, budgetSheetId));
  });

  ipcMain.handle('entries:upsert', (_event, { stagedChanges, date, budgetSheetId }) => {
    return enqueue(() => upsertEntries(stagedChanges, date, budgetSheetId));
  });

  ipcMain.handle('entries:sum', (_event, { startDate, endDate, budgetSheetId }) => {
    return enqueue(() => sumEntries(startDate, endDate, budgetSheetId));
  });
}
