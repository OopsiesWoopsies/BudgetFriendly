const budgetList = document.querySelector('.budgets-list');

// Sets up the budget sheets from the db and put it on the home page
export async function setupSheets() {
  const allSheets = await window.db.getBudgetSheets();
  const fragment = document.createDocumentFragment();

  // Create sheet button
  for (const sheet of allSheets) {
    const anchor = document.createElement('a');
    anchor.classList.add('sheet', 'custom-button');
    anchor.dataset.id = sheet.id;

    // Create sheet title
    const sheetTitle = document.createElement('h3');
    sheetTitle.classList.add('sheet-title');
    sheetTitle.textContent = sheet.title;
    anchor.appendChild(sheetTitle);

    // GET and create sheet data on budget period and amount
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

    // Create date creation
    const dateCreation = document.createElement('p');
    dateCreation.classList.add('date-created');
    dateCreation.textContent = `Date Created: ${sheet.created_at}`;
    anchor.appendChild(dateCreation);

    fragment.appendChild(anchor);
  }

  budgetList.appendChild(fragment);
}

// Initialize event listeners in the home page
export function initHomeListeners() {
  // Budget sheet click listener
  budgetList.addEventListener('click', async (event) => {
    const target = event.target.closest('a');
    if (!target || !target.classList.contains('sheet')) return;
    // Setup sheet id to retrieve upon page traversal
    await window.data.setSheetId(target.dataset.id);

    window.location.href = '../budgeting/sheet.html';
  });
}
