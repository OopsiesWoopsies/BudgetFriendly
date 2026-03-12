export const stagedTableChanges = {
  adding: new Map(),
  editing: new Map(),
  removing: new Map()
};

// Initializes listener for right-clicking
function initRightClick() {
  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    let type, id;

    // Checks for right click on significant elements
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

// Listens for commands from the IPC related to right-click options
function initRightClickCommands() {
  window.rightClick.deleteRow((_, id) => {
    stagedTableChanges.removing.set(id, '');
  });

  window.rightClick.deleteSheet((_, id) => {
    const sheet = document.querySelector(`[data-id="${id}"]`);
    window.db.deleteBudgetSheet(id);
    sheet.remove();
    
  });
}

initRightClick();
initRightClickCommands();
