import db from '../db.js';
import { ipcMain } from 'electron';
import { enqueue } from '../dbQueue.js';

// Db functions
function getBudgetAmount(date, budgetSheetId) {
  return db
    .prepare(
      `
      SELECT
        id,
        amount / 100.0 AS amount,
        effective_from AS effectiveFrom,
        effective_to AS effectiveTo,
        budget_sheet_id AS budgetSheetId
      FROM budget_amounts 
      WHERE budget_sheet_id = ? 
      AND effective_from <= ? 
      AND (effective_to IS NULL OR effective_to >= ?)
      LIMIT 1
      `
    )
    .get(budgetSheetId, date, date);
}

function upsertFutureBudgetAmount(newId, amount, effectiveFrom, effectiveTo, budgetSheetId) {
  amount *= 100;
  // Ensures no concurrent budgeting amount "period" exists
  const transaction = db.transaction(() => {
    const currDate = new Date().toISOString().slice(0, 10);
    const current = getBudgetAmount(currDate, budgetSheetId);
    const existingBudgetSheet = db
      .prepare(
        `
        SELECT * FROM budget_amounts 
        WHERE budget_sheet_id = ? 
        AND effective_from = ?
        `
      )
      .get(budgetSheetId, effectiveFrom);
    // Checks if current budget matches future budget and removes redundancy from table by continuing the current period
    if (current && existingBudgetSheet) {
      if (amount !== current.amount) {
        db.prepare('UPDATE budget_amounts SET amount = ? WHERE id = ?').run(
          amount,
          existingBudgetSheet.id
        );
      } else {
        db.prepare('DELETE FROM budget_amounts WHERE id = ?').run(existingBudgetSheet.id);
        db.prepare('UPDATE budget_amounts SET effective_to = NULL WHERE id = ?').run(current.id);
      }
      return;
    }
    // Makes new row (create new budget) and closes the old budget
    if (current) closeOldBudget(budgetSheetId, effectiveTo);
    db.prepare(
      `
      INSERT INTO budget_amounts (id, amount, effective_from, effective_to, budget_sheet_id)
      VALUES (?, ?, ?, NULL, ?)
      `
    ).run(newId, amount, effectiveFrom, budgetSheetId);
  });

  return transaction();
}

function closeOldBudget(budgetSheetId, effectiveTo) {
  db.prepare(
    'UPDATE budget_amounts SET effective_to = ? WHERE budget_sheet_id = ? AND effective_to IS NULL'
  ).run(effectiveTo, budgetSheetId);
}

// Registers db functions for renderer use
export function registerBudgetAmountsIpc() {
  ipcMain.handle('budgetAmounts:get', (_event, { date, budgetSheetId }) => {
    return enqueue(() => getBudgetAmount(date, budgetSheetId));
  });

  ipcMain.handle(
    'budgetAmounts:create',
    (_event, { newId, amount, effectiveFrom, effectiveTo, budgetSheetId }) => {
      return enqueue(() =>
        upsertFutureBudgetAmount(newId, amount, effectiveFrom, effectiveTo, budgetSheetId)
      );
    }
  );
}
