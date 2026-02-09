// Header vars
const title = document.querySelector('.header-title');
let budgetSheetTitle = '';

// Modal (settings) DOM vars
const settingsButton = document.querySelector('.open-settings-button');
const settingsModal = document.getElementById('settings');
const settingsBackButton = document.querySelector('.modal-back-button');
const newTitleInput = document.querySelector('.new-title');
const editCategoryHeader = document.querySelector('.description.header');
const categoriesTitle = document.getElementById('categories-header');
const categoryToolButtons = document.querySelector('.edit-tools');
const categoryList = document.querySelector('.categories');
const newCategoryInput = document.getElementById('category-input');

// Modal (settings) value vars
let isAddingCategory = true;
let isEditingCategory = false;
let isRemovingCategory = false;

// Table vars
let categoryDropdownList = document.querySelectorAll('.category-cell');
export const categoryDropdownModel = new Map([]);
// !GET req for list of categories
const stagedChanges = {
  adding: new Map(),
  removing: new Map(),
  editing: new Map()
};

// !GET req for budget sheet title

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
function stagedChangesCleanup() {
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

// Settings Modal listeners
export function initSettingsListeners() {
  // Function Vars
  let button = null;

  // Settings Header listeners
  settingsButton.addEventListener('click', () => {
    settingsModal.showModal();
  });

  settingsBackButton.addEventListener('click', () => {
    settingsModal.close();
    saveCategoryChanges();
  });

  // Budget Sheet Title listeners
  newTitleInput.addEventListener('change', () => {
    budgetSheetTitle = newTitleInput.value;
    title.textContent = budgetSheetTitle;
  });

  newTitleInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      newTitleInput.blur();
    }
  });

  // Category Tools listeners
  function addCategoryButton() {
    newCategoryInput.blur();
    newCategoryInput.value = newCategoryInput.value.trim();

    if (newCategoryInput.value === '') return;
    // Creates editor div and its relevant children and moves input element to the back
    const div = document.createElement('div');
    const button = document.createElement('button');
    const input = document.createElement('input');
    div.classList.add('category-editor');
    button.classList.add('category', 'custom-button', 'label');
    button.dataset.id = crypto.randomUUID();
    button.textContent = newCategoryInput.value;
    stagedChanges.adding.set(button.dataset.id, button.textContent);
    input.classList.add('new-category', 'custom-input', 'editor', 'display-none');
    input.maxLength = '15';
    input.placeholder = '___________';
    newCategoryInput.value = '';

    const newInput = categoryList.removeChild(newCategoryInput);
    div.appendChild(button);
    div.appendChild(input);
    categoryList.appendChild(div);
    categoryList.appendChild(newInput);

    // !POST req to db for new category
  }

  // Adds a new category
  function addCategory() {
    newCategoryInput.addEventListener('keydown', (event) => {
      if (!isAddingCategory) return;
      if (event.key === 'Enter') addCategoryButton();
    });

    newCategoryInput.addEventListener('change', () => {
      if (!isAddingCategory) return;
      addCategoryButton();
    });
  }

  // Edits a category name when clicked
  function editCategory() {
    // Applies changes made to categories
    function applyChanges(target) {
      const input = target;
      const button = target.closest('.category-editor').querySelector('.label');
      const originalText = button.textContent;
      input.blur();
      input.value = input.value.trim();

      if (input.value !== originalText) {
        if (input.value === '') input.value = originalText;
        button.textContent = input.value;
        stagedChanges.editing.set(button.dataset.id, button.textContent);
      }
      input.classList.add('display-none');
      button.classList.remove('display-none');

      // !POST req to change category name
    }

    // Avoids duplicating listeners
    const handleBlur = (event) => {
      if (!isEditingCategory) return;
      applyChanges(event.target);
      event.target.removeEventListener('blur', handleBlur);
    };

    categoryList.addEventListener('click', (event) => {
      if (!isEditingCategory) return;
      if (event.target.classList.contains('label')) {
        const button = event.target;
        const input = event.target.closest('.category-editor').querySelector('.editor');

        input.value = button.textContent;
        button.classList.add('display-none');
        input.classList.remove('display-none');
        input.focus();

        input.addEventListener('blur', handleBlur);
      }
    });

    categoryList.addEventListener('keydown', (event) => {
      if (!isEditingCategory) return;
      if (event.key === 'Enter') {
        event.target.removeEventListener('blur', handleBlur);
        applyChanges(event.target);
      }
    });
  }

  // Removes a category
  function removeCategory() {
    let isConfirming = false;

    categoryList.addEventListener('click', (event) => {
      if (!isRemovingCategory) return;

      if (event.target.classList.contains('remove-confirm')) {
        stagedChanges.removing.set(button.dataset.id, button.textContent);
        isConfirming = false;
        button = null;
        const element = event.target.closest('.category-editor');
        categoryList.removeChild(element);

        // !POST req to remove category
      } else if (event.target.classList.contains('label')) {
        if (!isConfirming) {
          button = event.target;
          button.classList.add('remove-confirm');
          isConfirming = true;
        } else if (button !== null) {
          button.classList.remove('remove-confirm');
          button = event.target;
          button.classList.add('remove-confirm');
        }
      }
    });
  }

  categoryToolButtons.addEventListener('click', (event) => {
    // Removes confirmation for removal
    if (button !== null) button.classList.remove('remove-confirm');

    const id = event.target.id;

    // Checks category to update header accordingly
    switch (id) {
      case 'add-category':
        editCategoryHeader.classList.remove('edit-category-name-mode', 'remove-category-mode');
        editCategoryHeader.classList.add('add-category-mode');
        categoriesTitle.textContent = 'Add a Category';
        newCategoryInput.classList.remove('display-none');
        isAddingCategory = true;
        isEditingCategory = false;
        isRemovingCategory = false;
        break;

      case 'edit-category-name':
        editCategoryHeader.classList.remove('add-category-mode', 'remove-category-mode');
        editCategoryHeader.classList.add('edit-category-name-mode');
        categoriesTitle.textContent = 'Edit a Category Name';
        newCategoryInput.classList.add('display-none');
        isAddingCategory = false;
        isEditingCategory = true;
        isRemovingCategory = false;
        break;

      case 'remove-category':
        editCategoryHeader.classList.remove('edit-category-name-mode', 'add-category-mode');
        editCategoryHeader.classList.add('remove-category-mode');
        categoriesTitle.textContent = 'Remove a Category';
        newCategoryInput.classList.add('display-none');
        isAddingCategory = false;
        isEditingCategory = false;
        isRemovingCategory = true;
        break;
    }
  });

  addCategory();
  editCategory();
  removeCategory();
}

export function initInitialVals() {
  newTitleInput.value = budgetSheetTitle;
}
