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
    const row = document.querySelector(`[data-id="${id}"]`);
    stagedTableChanges.removing.set(id, '');
    row.remove();
  });

  window.rightClick.deleteSheet((_, id) => {
    const sheet = document.querySelector(`[data-id="${id}"]`);
    window.db.deleteBudgetSheet(id);
    sheet.remove();
  });
}

initRightClick();
initRightClickCommands();

// Theme config

// Get active theme > determine text colours

export function determineBackgroundTextColour(lightness) {
  document.documentElement.style.setProperty('--background-text', determineTextColour(lightness));
}

export function determinePrimTextColour(lightness) {
  document.documentElement.style.setProperty('--primary-text', determineTextColour(lightness));

  let max = 3;

  for (let i = 1; i <= 3; i++) {
    document.documentElement.style.setProperty(
      `--primary-text-light${i}`,
      determineTextColour(lightness, 10 * (i - max + 1))
    );
  }
}

export function determineSecTextColour(lightness) {
  document.documentElement.style.setProperty('--secondary-text', determineTextColour(lightness));

  for (let i = 1; i <= 3; i++) {
    document.documentElement.style.setProperty(
      `--secondary-text-dark${i}`,
      determineTextColour(lightness, 10 * i)
    );
  }
}

export function determineTerTextColour(lightness) {
  document.documentElement.style.setProperty('--tertiary-text', determineTextColour(lightness));

  for (let i = 1; i <= 3; i++) {
    document.documentElement.style.setProperty(
      `--tertiary-text-dark${i}`,
      determineTextColour(lightness, 10 * i)
    );
  }
}

export function determineTextColour(lightness, offset = 0) {
  return lightness >= 25 + offset ? '#000000' : '#FFFFFF';
}
