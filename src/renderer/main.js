async function loadSheets() {
  const sheets = await window.db.getBudgetSheets();
  console.log(sheets);
}

loadSheets();
