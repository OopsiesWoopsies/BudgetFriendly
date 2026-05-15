const budgetSheetId = await window.data.getSheetId();
const periodDisplay = document.getElementById('budgetPeriod');
const changeBudget = document.getElementById('budget');
const today = new Date().toISOString().slice(0, 10);

export async function initBudgetInfo() {
  const period = (await window.db.getBudgetSheets(budgetSheetId)).period;
  const budget = (await window.db.getBudgetAmount(today, budgetSheetId)).amount;

  periodDisplay.textContent = period;
  changeBudget.textContent = budget;
}
