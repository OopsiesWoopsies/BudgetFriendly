export const stagedTableChanges = {
  adding: new Map(),
  editing: new Map(),
  removing: new Map()
};

// Original Themes
const ogThemes = {
  '000': {
    primaryHex: '#ffd900',
    secondaryHex: '#cceeff',
    tertiaryHex: '#ffffff',
    backgroundHex: '#e5f6ff'
  },
  '001': {
    primaryHex: '#808080',
    secondaryHex: '#e6e6e6',
    tertiaryHex: '#ffffff',
    backgroundHex: '#bfbfbf'
  },
  '002': {
    primaryHex: '#ff337a',
    secondaryHex: '#ffcce7',
    tertiaryHex: '#ffffff',
    backgroundHex: '#fee7f5'
  }
};

// Initializes listener for right-clicking
function initRightClick() {
  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    let type, id;

    // Checks for right click on significant elements
    const row = event.target.closest('.row');
    const sheet = event.target.closest('.sheet');
    const theme = event.target.closest('.theme');
    if (row) {
      type = 'entry';
      id = row.dataset.id;
    }
    if (sheet) {
      type = 'sheet';
      id = sheet.dataset.id;
    }
    if (theme) {
      type = 'theme';
      id = theme.dataset.id;
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

  window.rightClick.deleteTheme((_, id) => {
    const theme = document.querySelector(`[data-id="${id}"]`);
    window.db.deleteTheme(id);
    theme.remove();
  });
}

initRightClick();
initRightClickCommands();

// Theme config
const bgPick = document.getElementById('colourPickerBackground');
const primPick = document.getElementById('colourPickerPrimary');
const secPick = document.getElementById('colourPickerSecondary');
const terPick = document.getElementById('colourPickerTertiary');

export async function setupTheme() {
  const activeThemeId = localStorage.getItem('activeThemeId');
  let theme;
  if (activeThemeId == null) return;
  if (activeThemeId.length === 3) {
    theme = ogThemes[activeThemeId];
  } else {
    theme = await window.db.getThemes(activeThemeId);
  }
  const primHsl = hexToHSL(theme.primaryHex);
  const secHsl = hexToHSL(theme.secondaryHex);
  const terHsl = hexToHSL(theme.tertiaryHex);
  const bgHsl = hexToHSL(theme.backgroundHex);

  if (bgPick && primPick && secPick && terPick) {
    bgPick.value = theme.backgroundHex;
    primPick.value = theme.primaryHex;
    secPick.value = theme.secondaryHex;
    terPick.value = theme.tertiaryHex;
  }

  document.documentElement.style.setProperty(
    '--background-colour',
    `hsl(${bgHsl.h}, ${bgHsl.s}%, ${bgHsl.l}%)`
  );

  document.documentElement.style.setProperty(
    '--primary-colour',
    `hsl(${primHsl.h}, ${primHsl.s}%, ${primHsl.l}%)`
  );
  document.documentElement.style.setProperty(
    '--secondary-colour',
    `hsl(${secHsl.h}, ${secHsl.s}%, ${secHsl.l}%)`
  );
  document.documentElement.style.setProperty(
    '--tertiary-colour',
    `hsl(${terHsl.h}, ${terHsl.s}%, ${terHsl.l}%)`
  );
  const max = 3;

  for (let i = 1; i <= 3; i++) {
    document.documentElement.style.setProperty(
      `--primary-colour-light${i}`,
      `hsl(${primHsl.h}, ${primHsl.s}%, ${primHsl.l + 10 * (max - i + 1)}%)`
    );
    document.documentElement.style.setProperty(
      `--secondary-colour-dark${i}`,
      `hsl(${secHsl.h}, ${secHsl.s}%, ${secHsl.l - 10 * i}%)`
    );
    document.documentElement.style.setProperty(
      `--tertiary-colour-dark${i}`,
      `hsl(${terHsl.h}, ${terHsl.s}%, ${terHsl.l - 10 * i}%)`
    );
  }

  determineBackgroundTextColour(bgHsl.l);
  determinePrimTextColour(primHsl.l);
  determineSecTextColour(secHsl.l);
  determineTerTextColour(terHsl.l);
}

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

export function hexToHSL(hex) {
  let r = 0,
    g = 0,
    b = 0;
  hex = hex.slice(1);

  r = parseInt(hex.substring(0, 2), 16) / 255;
  g = parseInt(hex.substring(2, 4), 16) / 255;
  b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

document.documentElement.classList.add('no-transition');
setupTheme();
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.documentElement.classList.remove('no-transition');
  });
});
