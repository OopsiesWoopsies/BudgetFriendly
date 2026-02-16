const budgetList = document.querySelector('.budgets-list');

export async function setupSheets() {
  const allSheets = await window.db.getBudgetSheets();
  const fragment = document.createDocumentFragment();

  for (const sheet of allSheets) {
    const anchor = document.createElement('a');
    anchor.classList.add('sheet', 'custom-button');
    anchor.dataset.id = sheet.id;

    const sheetTitle = document.createElement('h3');
    sheetTitle.classList.add('sheet-title');
    sheetTitle.textContent = sheet.title;
    anchor.appendChild(sheetTitle);

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    const budgetAmount = await window.db.getBudgetAmount(today, sheet.id);
    const budgetPeriod = document.createElement('p');
    budgetPeriod.classList.add('budget-period');
    budgetPeriod.textContent = `$${budgetAmount.amount / 100} ${sheet.period}`;
    anchor.appendChild(budgetPeriod);

    const dateCreation = document.createElement('p');
    dateCreation.classList.add('date-created');
    dateCreation.textContent = `Date Created: ${sheet.created_at}`;
    anchor.appendChild(dateCreation);

    fragment.appendChild(anchor);
  }

  budgetList.appendChild(fragment);
}

export function initHomeListeners() {
  budgetList.addEventListener('click', (event) => {
    if (event.target.classList.contains('sheet')) {
      console.log(event.target);
    }
  });
}
