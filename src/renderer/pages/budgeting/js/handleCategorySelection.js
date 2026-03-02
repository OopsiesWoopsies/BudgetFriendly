import { stagedChanges } from './settings.js';

const settingsBackButton = document.querySelector('.modal-back-button');
const settingsModal = document.getElementById('settings');
const categoryList = document.querySelector('.categories');
let newCategoryInput = document.getElementById('category-input');

// Table vars
let categoryDropdownList = document.querySelectorAll('.category-cell');
export const categoryDropdownModel = new Map([]);
// !GET req for list of categories

// Updates the category dropdown list
export function updateDropdownList() {
  categoryDropdownList = document.querySelectorAll('.category-cell');
}

// Update category map and save changes to db
function saveCategoryChanges() {
  stagedChangesCleanup();
  applyChangesToDropdowns();

  // !POST request to db using stagedChanges
  stagedChanges.adding.clear();
  stagedChanges.editing.clear();
  stagedChanges.removing.clear();
}

function applyChangesToDropdowns() {
  const fragment = document.createDocumentFragment();
  // eslint-disable-next-line
  for (const [id, value] of stagedChanges.removing) {
    categoryDropdownList.forEach((categoryDropdown) => {
      categoryDropdown.querySelector(`option[value="${id}"]`).remove();
    });
    categoryDropdownModel.delete(id);
  }

  for (const [id, value] of stagedChanges.editing) {
    categoryDropdownList.forEach((categoryDropdown) => {
      categoryDropdown.querySelector(`option[value="${id}"]`).textContent = value;
    });
    categoryDropdownModel.set(id, value);
  }

  for (const [id, value] of stagedChanges.adding) {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = value;
    fragment.appendChild(option);
    categoryDropdownModel.set(id, value);
  }

  categoryDropdownList.forEach((categoryDropdown) => {
    categoryDropdown.appendChild(fragment.cloneNode(true));
  });
}

// Removes any categories added in the editing session that wanted to be removed and edits the remainder to reduce DOM manipulation
export function stagedChangesCleanup() {
  // eslint-disable-next-line
  for (const [id, value] of stagedChanges.removing) {
    if (stagedChanges.adding.get(id) === undefined) continue;

    stagedChanges.adding.delete(id);
    stagedChanges.removing.delete(id);
    stagedChanges.editing.delete(id);
  }

  for (const [id, value] of stagedChanges.editing) {
    if (stagedChanges.adding.get(id) === undefined) continue;

    stagedChanges.adding.set(id, value);
    stagedChanges.editing.delete(id);
  }
}

export function initCategorySelectionListeners() {
  settingsBackButton.addEventListener('click', () => {
    settingsModal.close();
    saveCategoryChanges();
  });
}

export async function getCategories(budgetSheedId) {
  const categories = await window.db.getCategories(budgetSheedId);
  const fragment = document.createDocumentFragment();

  for (const [, category] of Object.entries(categories)) {
    const id = category.id;
    const name = category.name;
    const div = document.createElement('div');
    const button = document.createElement('button');
    const input = document.createElement('input');
    div.classList.add('category-editor');
    button.classList.add('category', 'custom-button', 'label');
    button.dataset.id = id;
    button.textContent = name;
    stagedChanges.adding.set(id, name);
    input.classList.add('new-category', 'custom-input', 'editor', 'display-none');
    input.maxLength = '15';
    input.placeholder = '___________';

    div.appendChild(button);
    div.appendChild(input);
    fragment.appendChild(div);
  }
  saveCategoryChanges();

  const newInput = categoryList.removeChild(newCategoryInput);
  categoryList.appendChild(fragment);
  categoryList.appendChild(newInput);
}
