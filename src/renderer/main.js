export const stagedTableChanges = {
  adding: new Map(),
  editing: new Map(),
  removing: new Map()
};

function initRightClick() {
  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    let type, id;

    const row = event.target.closest('.row');
    const sheet = event.target.closest('.sheet');
    if (row) {
      type = 'entry';
      id = row.dataset.id;
    }
    if (sheet) {
      type = 'sheet';
      id = sheet.dataset.id;
    }
    window.rightClick.sendContextMenu(type, id);
  });
}

function initRightClickCommands() {
  window.rightClick.deleteRow((_, id) => {
    stagedTableChanges.removing.set(id, '');
  });

  window.rightClick.deleteSheet((_, id) => {
    // Remove from home html
    window.db.deleteBudgetSheet(id);
  });
}

initRightClick();
initRightClickCommands();
