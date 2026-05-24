import { makePieChartAndLegend, setCategoriesSum } from '../../../main.js';

const expendituresHeader = document.querySelector('.expenditures-header');
const summation = document.querySelector('.summation');
const totalBudget = document.querySelector('.total-budget');
const pie = document.querySelector('.pie-chart');

const budgetSheetId = await window.data.getSheetId();

async function getSumMakeVisuals(startDate, endDate) {
  pie.style.background = 'black';
  const categoriesSum = await window.db.getCategoriesSum(startDate, endDate, budgetSheetId);
  setCategoriesSum(categoriesSum);
  makePieChartAndLegend(categoriesSum);
}

export async function getSummation(lastKnownDate, startDate, endDate, budgetSheetId) {
  const grandTotal = await window.db.sumEntries(startDate, endDate, budgetSheetId);
  const budgetSheet = await window.db.getBudgetSheets(budgetSheetId);
  const budgetAmount = await window.db.getBudgetAmount(startDate, budgetSheetId);

  expendituresHeader.textContent = `Expenditures This ${lastKnownDate}`;
  summation.textContent = `$${Number(grandTotal).toFixed(2)}`;
  const totalBudgetText =
    budgetAmount === undefined
      ? ` / ${Number((await window.db.getBudgetAmount(budgetSheet.createdAt, budgetSheetId)).amount).toFixed(2)}`
      : ` / ${Number(budgetAmount.amount).toFixed(2)}`;
  totalBudget.textContent = totalBudgetText;

  // Displays the correct text and reveals max budget if the correct calendar is shown
  totalBudget.classList.add('display-none');
  switch (lastKnownDate) {
    case 'Year':
      if (budgetSheet.period === 'yearly') totalBudget.classList.remove('display-none');
      break;

    case 'Month':
      switch (budgetSheet.period) {
        case 'biweekly':
          expendituresHeader.textContent = `Expenditures Past 2 Weeks`;
          break;

        case 'weekly':
          expendituresHeader.textContent = `Expenditures This Week`;
          break;

        case 'monthly':
          totalBudget.classList.remove('display-none');
      }
      break;

    case 'Day':
      if (budgetSheet.period === 'daily') totalBudget.classList.remove('display-none');
  }

  getSumMakeVisuals(startDate, endDate);
}
