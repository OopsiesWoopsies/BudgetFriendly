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
  row.dataset.id = rowInfo.id;

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

// Listens for new entry
function newRowListener(target) {
  if (target.classList.contains('new')) {
    const rowId = crypto.randomUUID();
    const info = {
      id: rowId,
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
    } else if (target.classList.contains('category-cell')) {
      if (target.value == '') return;

      info.categoryId = target.value;
      filledTable.appendChild(createRow(info));
      target.value = '';
    } else if (target.classList.contains('price-cell')) {
      const price = target.value;
      if (price === '') return;

      info.price = price;
      filledTable.appendChild(createRow(info));
      target.value = '';
    }

    let { id, name, categoryId, price } = info;
    if (categoryId === '') categoryId = null;
    stagedTableChanges.adding.set(id, {
      name: name,
      categoryId: categoryId,
      price: price
    });
  }
}

// Listens for row editing and removing
function updateRowListener(target) {
  if (!target.classList.contains('new')) {
    const targetRow = target.closest('.row');
    let name, categoryId, price;

    if (target.classList.contains('name-cell')) {
      name = target.value.trim();

      categoryId = targetRow.querySelector('.category-cell').value;
      price = targetRow.querySelector('.price-cell').value;
    } else if (target.classList.contains('category-cell')) {
      categoryId = target.value;

      name = targetRow.querySelector('.name-cell').value;
      price = targetRow.querySelector('.price-cell').value;
    } else if (target.classList.contains('price-cell')) {
      price = target.value;

      name = targetRow.querySelector('.name-cell').value;
      categoryId = targetRow.querySelector('.category-cell').value;
    }

    const id = targetRow.dataset.id;
    if (categoryId === '') categoryId = null;
    stagedTableChanges.editing.set(id, {
      name: name,
      categoryId: categoryId,
      price: price
    });
  }
}

export function initTableListener() {
  table.addEventListener('change', (event) => {
    const target = event.target;

    newRowListener(target);
    updateRowListener(target);
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

// Inserts and updates entries to the database
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
