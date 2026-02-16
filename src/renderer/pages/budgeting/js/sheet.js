import { categoryDropdownModel, updateDropdownList } from './handleCategorySelection.js';

// Table vars
const table = document.querySelector('.table');
const filledTable = document.querySelector('.filled-table');

// Creates new a new row and copies the cells from the new cells
function createRow(rowInfo) {
  const fragment = document.createDocumentFragment();

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

  nameInput.value = rowInfo[0];
  categoryDropdown.value = rowInfo[1];
  priceInput.value = rowInfo[2];

  nameInput.type = 'text';
  nameInput.classList.add('cell', 'name-cell', 'custom-input');
  categoryDropdown.classList.add('cell', 'category-cell');
  priceInput.type = 'number';
  priceInput.classList.add('cell', 'price-cell', 'custom-input');

  fragment.appendChild(nameInput);
  fragment.appendChild(categoryDropdown);
  fragment.appendChild(priceInput);

  filledTable.appendChild(fragment);
  updateDropdownList();
}

export function initTableListener() {
  table.addEventListener('change', (event) => {
    if (event.target.classList.contains('new')) {
      if (event.target.classList.contains('name-cell')) {
        const name = event.target.value.trim();
        if (name === '') {
          event.target.value = '';
          return;
        }

        createRow([name, '', '']);
        event.target.value = '';
      }
      if (event.target.classList.contains('category-cell')) {
        if (event.target.value == '') return;

        createRow(['', event.target.value, '']);
        event.target.value = '';
      }
      if (event.target.classList.contains('price-cell')) {
        const price = event.target.value;

        if (price === '') return;

        createRow(['', '', price]);
        event.target.value = '';
      }
    }
  });
}

// !TODO
// Remove row when if all cells empty (consider creating a delete button) MAKE SURE TO UPDATE THE QUERYSELECTORALL

// Create a function for GET req for:
//  all the categories and create all the buttons in the settings and in the category drop down
//  all the names, categories, and prices to fill the table
//  the title of the budget sheet

// Create POST reqs, consider doing it all upon closing page or having a submit button (POST if crash as well)
