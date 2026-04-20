const expendituresHeader = document.querySelector('.expenditures-header');
const summation = document.querySelector('.summation');
const totalBudget = document.querySelector('.total-budget');
const pie = document.querySelector('.pie-chart');
const legend = document.querySelector('.pie-chart');

export function initPieChart() {
  const data = [10, 20, 70];
  let start = 0;

  const colors = ['red', 'blue', 'green']; // Add a list of categories

  let gradient = data
    .map((val, i) => {
      let end = start + val;
      let g = `${colors[i]} ${start}% ${end}%`;
      start = end;
      return g;
    })
    .join(',');

  pie.style.background = `conic-gradient(${gradient})`;
}

export async function getSummation(lastKnownDate, startDate, endDate, budgetSheetId) {
  const grandTotal = await window.db.sumEntries(startDate, endDate, budgetSheetId);
  const budgetingPeriod = (await window.db.getBudgetSheets(budgetSheetId)).period;
  const budgetAmount = await window.db.getBudgetAmount(startDate, budgetSheetId);

  expendituresHeader.textContent = `Expenditures This ${lastKnownDate}`;
  summation.textContent = `$${grandTotal}`;
  const totalBudgetText = budgetAmount === undefined ? '' : ` / ${budgetAmount.amount}`;
  totalBudget.textContent = totalBudgetText;

  // Displays the correct text and reveals max budget if the correct calendar is shown
  totalBudget.classList.add('display-none');
  switch (lastKnownDate) {
    case 'Year':
      totalBudget.classList.remove('display-none');
      break;

    case 'Month':
      switch (budgetingPeriod) {
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
      totalBudget.classList.remove('display-none');
  }

  // Make legend and pie chart work
}
