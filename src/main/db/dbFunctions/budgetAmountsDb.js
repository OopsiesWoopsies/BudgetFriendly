import db from '../db.js';
import { ipcMain } from 'electron';
import { enqueue } from '../dbQueue.js';

// Db functions
function getBudgetAmount(date, budget_sheet_id) {
  return db
    .prepare(
      `
      SELECT * FROM budget_amounts 
      WHERE budget_sheet_id = ? 
      AND effective_from <= ? 
      AND (effective_to IS NULL OR effective_to >= ?)
      LIMIT 1
      `
    )
    .get(budget_sheet_id, date, date);
}

function upsertFutureBudgetAmount(newId, amount, effective_from, effective_to, budget_sheet_id) {
  // Ensures no concurrent budgeting amount "period" exists
  const transaction = db.transaction(() => {
    const currDate = new Date().toISOString().slice(0, 10);
    const current = getBudgetAmount(currDate, budget_sheet_id);
    const existingFuture = db
      .prepare(
        `
        SELECT * FROM budget_amounts 
        WHERE budget_sheet_id = ? 
        AND effective_from = ?
        `
      )
      .get(budget_sheet_id, effective_from);
    // Checks if current budget matches future budget and removes redundancy from table by continuing the current period
    if (current && existingFuture) {
      if (amount !== current.amount) {
        db.prepare('UPDATE budget_amounts SET amount = ? WHERE id = ?').run(
          amount,
          existingFuture.id
        );
      } else {
        db.prepare('DELETE FROM budget_amounts WHERE id = ?').run(existingFuture.id);
        db.prepare('UPDATE budget_amounts SET effective_to = NULL WHERE id = ?').run(current.id);
      }
      return;
    }
    // Makes new row (create new budget) and closes the old budget
    if (current) closeOldBudget(budget_sheet_id, effective_to);
    db.prepare(
      `
      INSERT INTO budget_amounts (id, amount, effective_from, effective_to, budget_sheet_id)
      VALUES (?, ?, ?, NULL, ?)
      `
    ).run(newId, amount, effective_from, budget_sheet_id);
  });

  transaction();
}

function closeOldBudget(budget_sheet_id, effective_to) {
  db.prepare(
    'UPDATE budget_amounts SET effective_to = ? WHERE budget_sheet_id = ? AND effective_to IS NULL'
  ).run(effective_to, budget_sheet_id);
}

// Registers db functions for renderer use
export function registerBudgetAmountsIpc() {
  ipcMain.handle('budgetAmounts:get', (_event, { date, budget_sheet_id }) => {
    return enqueue(() => getBudgetAmount(date, budget_sheet_id));
  });

  ipcMain.handle(
    'budgetAmounts:create',
    (_event, { newId, amount, effective_from, effective_to, budget_sheet_id }) => {
      return enqueue(() =>
        upsertFutureBudgetAmount(newId, amount, effective_from, effective_to, budget_sheet_id)
      );
    }
  );
}
