import {
  categoryDropdownModel,
  updateDropdownList,
  stagedChangesCleanup
} from './handleCategorySelection.js';

const table = document.querySelector('.table');
const filledTable = document.getElementById('filled-table');

const budgetSheetId = await window.data.getSheetId();

const stagedTableChanges = {
  adding: new Map(),
  editing: new Map(),
  removing: new Map()
};

// Creates new a new row and copies the cells from the new cells
function createRow(rowInfo) {
  const row = document.createElement('div');
  row.classList.add('grid', 'row');

  const nameInput = document.createElement('input');
  const categoryDropdown = document.createElement('select');
  const priceInput = document.createElement('input');
  const option = document.createElement('option');
  option.textContent = 'Select Category';
  option.value = '';

  // Copies the dropdown menu to the new one
  categoryDropdown.appendChild(option);
  for (const [key, value] of categoryDropdownModel) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = value;
    categoryDropdown.appendChild(option);
  }

  nameInput.value = rowInfo.name;
  if (rowInfo.categoryId === null) categoryDropdown.value = '';
  else categoryDropdown.value = rowInfo.categoryId;
  priceInput.value = rowInfo.price;

  nameInput.type = 'text';
  nameInput.classList.add('cell', 'name-cell', 'custom-input');
  categoryDropdown.classList.add('cell', 'category-cell');
  priceInput.type = 'number';
  priceInput.classList.add('cell', 'price-cell', 'custom-input');

  row.appendChild(nameInput);
  row.appendChild(categoryDropdown);
  row.appendChild(priceInput);

  updateDropdownList();
  return row;
}

export function initTableListener() {
  table.addEventListener('change', (event) => {
    const target = event.target;
    // Make sure the row is not created if the user clicks on the same row to update
    // another part of the row
    if (target.classList.contains('new')) {
      const id = crypto.randomUUID();
      const info = {
        rowId: id,
        name: '',
        categoryId: '',
        price: 0
      };

      if (target.classList.contains('name-cell')) {
        const name = target.value.trim();
        if (name === '') {
          target.value = '';
          return;
        }

        info.name = name;
        filledTable.appendChild(createRow(info));
        target.value = '';
      }
      if (target.classList.contains('category-cell')) {
        if (target.value == '') return;

        info.categoryId = target.value;
        filledTable.appendChild(createRow(info));
        target.value = '';
      }
      if (target.classList.contains('price-cell')) {
        const price = target.value;
        if (price === '') return;

        info.price = price;
        filledTable.appendChild(createRow(info));
        target.value = '';
      }

      let { rowId, name, categoryId, price } = info;
      if (categoryId === '') categoryId = null;
      stagedTableChanges.adding.set(rowId, {
        name: name,
        categoryId: categoryId,
        price: price
      });
    }
  });
}

// Gets all the entries for the current date and fills them in the table
export async function setAllRows(date) {
  filledTable.innerHTML = '';
  const allRows = await window.db.getEntries(date, budgetSheetId);
  if (allRows.length == 0) return;

  const tableFragment = document.createDocumentFragment();

  for (const [, info] of Object.entries(allRows)) {
    tableFragment.appendChild(createRow(info));
  }

  filledTable.appendChild(tableFragment);
}

export async function upsertRows(date) {
  stagedChangesCleanup(stagedTableChanges);

  if (
    stagedTableChanges.adding.size == 0 &&
    stagedTableChanges.editing.size == 0 &&
    stagedTableChanges.removing.size == 0
  )
    return;

  await window.db.upsertEntries(stagedTableChanges, date, budgetSheetId);
  stagedTableChanges.adding.clear();
  stagedTableChanges.editing.clear();
  stagedTableChanges.removing.clear();
}

// !TODO
// Remove row when if all cells empty (consider creating a delete button) MAKE SURE TO UPDATE THE QUERYSELECTORALL
