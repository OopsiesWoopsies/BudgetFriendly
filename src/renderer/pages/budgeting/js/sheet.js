import { categoryDropdownModel, stagedChangesCleanup } from './handleCategorySelection.js';
import { stagedTableChanges } from '../../../main.js';

const table = document.querySelector('.table');
const filledTable = document.getElementById('filled-table');
const newRow = document.querySelector('.new-row');

const budgetSheetId = await window.data.getSheetId();

let rowId = crypto.randomUUID();
let newRowInfo = {
  id: rowId,
  name: '',
  categoryId: '',
  cost: ''
};

// Creates new a new row and copies the cells from the new cells
function createRow(rowInfo) {
  const row = document.createElement('div');
  row.classList.add('grid', 'row');
  row.dataset.id = rowInfo.id;

  const nameInput = document.createElement('input');
  const categoryDropdown = document.createElement('select');
  const costInput = document.createElement('input');
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
  costInput.value = rowInfo.cost;

  nameInput.type = 'text';
  nameInput.classList.add('cell', 'name-cell', 'custom-input');
  categoryDropdown.classList.add('cell', 'category-cell');
  costInput.type = 'number';
  costInput.classList.add('cell', 'cost-cell', 'custom-input');

  row.appendChild(nameInput);
  row.appendChild(categoryDropdown);
  row.appendChild(costInput);

  return row;
}

// Listens for new entry
function newRowListener(target) {
  if (target.classList.contains('new')) {
    if (target.classList.contains('name-cell')) {
      const name = target.value.trim();
      if (name === '') {
        target.value = '';
        return;
      }

      newRowInfo.name = name;
    } else if (target.classList.contains('category-cell')) {
      if (target.value == '') return;

      newRowInfo.categoryId = target.value;
    } else if (target.classList.contains('cost-cell')) {
      const cost = target.value;
      if (cost === '') return;

      newRowInfo.cost = cost;
    }

    // Ensure all information is filled before data is saved
    let { id, name, categoryId, cost } = newRowInfo;
    if (name === '' || categoryId === '' || cost === '') return;
    filledTable.appendChild(createRow(newRowInfo));

    if (categoryId === '') categoryId = null;
    stagedTableChanges.adding.set(id, {
      name: name,
      categoryId: categoryId,
      cost: cost
    });

    // Reset new row info and new row inputs
    newRow.querySelectorAll('.new').forEach((elem) => (elem.value = ''));
    rowId = crypto.randomUUID();
    newRowInfo = {
      id: rowId,
      name: '',
      categoryId: '',
      cost: ''
    };
  }
}

// Listens for row editing and removing
function updateRowListener(target) {
  if (!target.classList.contains('new')) {
    const targetRow = target.closest('.row');
    let name, categoryId, cost;

    if (target.classList.contains('name-cell')) {
      name = target.value.trim();

      categoryId = targetRow.querySelector('.category-cell').value;
      cost = targetRow.querySelector('.cost-cell').value;
    } else if (target.classList.contains('category-cell')) {
      categoryId = target.value;

      name = targetRow.querySelector('.name-cell').value;
      cost = targetRow.querySelector('.cost-cell').value;
    } else if (target.classList.contains('cost-cell')) {
      cost = target.value;

      name = targetRow.querySelector('.name-cell').value;
      categoryId = targetRow.querySelector('.category-cell').value;
    }

    const id = targetRow.dataset.id;
    if (categoryId === '') categoryId = null;
    stagedTableChanges.editing.set(id, {
      name: name,
      categoryId: categoryId,
      cost: cost
    });
  }
}

// Initialize table listeners
export function initTableListeners() {
  table.addEventListener('change', (event) => {
    const target = event.target;
    if (target.classList.contains('cost-cell')) {
      target.value = Math.round(parseFloat(target.value) * 100) / 100;
    }

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

  for (const [, rowInfo] of Object.entries(allRows)) {
    tableFragment.appendChild(createRow(rowInfo));
  }

  filledTable.appendChild(tableFragment);
}

// Inserts and updates entries to the database
export async function upsertRows(date) {
  if (
    stagedTableChanges.adding.size === 0 &&
    stagedTableChanges.editing.size === 0 &&
    stagedTableChanges.removing.size === 0
  )
    return;
  stagedChangesCleanup(stagedTableChanges);

  if (
    stagedTableChanges.adding.size === 0 &&
    stagedTableChanges.editing.size === 0 &&
    stagedTableChanges.removing.size === 0
  )
    return;

  await window.db.upsertEntries(stagedTableChanges, date, budgetSheetId);
  stagedTableChanges.adding.clear();
  stagedTableChanges.editing.clear();
  stagedTableChanges.removing.clear();
}
