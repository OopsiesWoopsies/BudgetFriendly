const expendituresHeader = document.querySelector('.expenditures-header');
const summation = document.querySelector('.summation');
const totalBudget = document.querySelector('.total-budget');
const pie = document.querySelector('.pie-chart');
const legend = document.querySelector('.legend');

const budgetSheetId = await window.data.getSheetId();

export async function makePieChartAndLegend(startDate, endDate) {
  legend.innerHTML = '';

  pie.style.background = 'black';
  const categoriesSum = await window.db.getCategoriesSum(startDate, endDate, budgetSheetId);
  if (categoriesSum[0].grandTotal === 0) return;

  const colours = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'purple',
    'cyan',
    'lavender',
    'violet',
    'lime'
  ];
  // Creates pie chart of top 10 most expensive categories
  const numOfCategories = categoriesSum.length;
  const relativePercentages = [];
  const pieElems = [];
  let startPercentage = 0,
    totalPercentage = 0;

  for (let i = 0; i < 10 && i < numOfCategories; i++) {
    let relativePercentage = Math.round(
      (categoriesSum[i].totalCategoryCost / categoriesSum[i].grandTotal) * 100000
    );
    relativePercentages.push(relativePercentage);
    totalPercentage = startPercentage + relativePercentage;
    pieElems.push(`${colours[i]} ${startPercentage / 1000}% ${totalPercentage / 1000}%`);
    startPercentage = totalPercentage;
  }

  // Creates legend for said pie chart
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < 10 && i < numOfCategories; i++) {
    if (relativePercentages[i] === 0) continue;
    const label = document.createElement('div');
    const colourCode = document.createElement('div');
    const name = document.createElement('p');
    const percent = document.createElement('p');

    label.classList.add('grid', 'align-items-center', 'legend-label');
    colourCode.classList.add('colour-code');
    name.textContent = categoriesSum[i].name;
    percent.textContent = `${relativePercentages[i] / 1000}%`;
    colourCode.style.background = colours[i];

    label.appendChild(colourCode);
    label.appendChild(name);
    label.appendChild(percent);

    fragment.appendChild(label);
  }

  // Creates 'others' category if needed
  if (numOfCategories > 10) {
    pieElems.push(`gray ${totalPercentage / 1000}% 100%`);

    const label = document.createElement('div');
    const colourCode = document.createElement('div');
    const name = document.createElement('p');
    const percent = document.createElement('p');

    label.classList.add('grid', 'align-items-center', 'legend-label');
    colourCode.classList.add('colour-code');
    name.textContent = 'Others';
    percent.textContent = `${(100000 - totalPercentage) / 1000}%`;
    colourCode.style.background = 'gray';

    label.appendChild(colourCode);
    label.appendChild(name);
    label.appendChild(percent);

    fragment.appendChild(label);
  }

  const gradient = pieElems.join(',');
  pie.style.background = `conic-gradient(${gradient})`;

  legend.appendChild(fragment);
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

  makePieChartAndLegend(startDate, endDate);
}
