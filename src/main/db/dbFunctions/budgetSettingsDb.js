import db from '../db.js';
import { ipcMain } from 'electron';
import { enqueue } from '../dbQueue.js';

// Db functions
function getCategories(budgetSheetId) {
  return db
    .prepare(
      `
      SELECT
        id,
        name,
        budget_sheet_id AS budgetSheetId
      FROM category WHERE budget_sheet_id = ?`
    )
    .all(budgetSheetId);
}

function getCategoriesSum(startDate, endDate, budgetSheetId) {
  return db
    .prepare(
      `
    SELECT
      c.id AS categoryId,
      c.name,
      COALESCE(SUM(e.cost) / 100.0, 0) AS totalCategoryCost,
      COALESCE(SUM(SUM(e.cost)) OVER() / 100.0, 0) AS grandTotal,
      c.budget_sheet_id AS budgetSheetId
    FROM category AS c 
    LEFT JOIN entries AS e ON c.id = e.category_id AND e.date >= ? AND e.date <= ?
    WHERE c.budget_sheet_id = ?
    GROUP BY c.id, c.name, c.budget_sheet_id
    ORDER BY totalCategoryCost DESC
    `
    )
    .all(startDate, endDate, budgetSheetId);
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

  ipcMain.handle('categories:sum', (_event, { startDate, endDate, budgetSheetId }) => {
    return enqueue(() => getCategoriesSum(startDate, endDate, budgetSheetId));
  });

  ipcMain.handle('categories:create', (_event, { stagedChanges, budgetSheetId }) => {
    return enqueue(() => upsertCategories(stagedChanges, budgetSheetId));
  });
}
