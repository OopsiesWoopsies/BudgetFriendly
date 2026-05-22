export const stagedTableChanges = {
  adding: new Map(),
  editing: new Map(),
  removing: new Map()
};

let expCategoriesSum = [];

export function getCategoriesSum() {
  return expCategoriesSum;
}
export function setCategoriesSum(categoriesSum) {
  expCategoriesSum = categoriesSum;
}

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
  },
  '003': {
    primaryHex: '#2a0f3e',
    secondaryHex: '#6600cc',
    tertiaryHex: '#d69afe',
    backgroundHex: '#0f0019'
  },
  '004': {
    primaryHex: '#0062ff',
    secondaryHex: '#4dc3ff',
    tertiaryHex: '#ccd2ff',
    backgroundHex: '#b3e4ff'
  }
};

export function makePieChartAndLegend(categoriesSum) {
  const legend = document.querySelector('.legend');
  const pie = document.querySelector('.pie-chart');
  legend.innerHTML = '';

  if (categoriesSum.length === 0) {
    pie.style.background = 'black';
    return;
  }

  const colours = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'purple',
    'cyan',
    'lavender',
    'violet',
    'lime'
  ];
  // Creates pie chart of top 10 most expensive categories
  const numOfCategories = categoriesSum.length;
  const grandTotal = expCategoriesSum.length === 0 ? 0 : expCategoriesSum[0].grandTotal;
  const relativePercentages = [];
  const pieElems = [];
  let startPercentage = 0,
    totalPercentage = 0;

  for (let i = 0; i < 10 && i < numOfCategories; i++) {
    let relativePercentage = Math.round((categoriesSum[i].totalCategoryCost / grandTotal) * 100000);
    relativePercentages.push(relativePercentage);
    totalPercentage = startPercentage + relativePercentage;
    pieElems.push(`${colours[i]} ${startPercentage / 1000}% ${totalPercentage / 1000}%`);
    startPercentage = totalPercentage;
  }

  // Creates legend for said pie chart
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < 10 && i < numOfCategories; i++) {
    if (relativePercentages[i] === 0) continue;
    const label = document.createElement('div');
    const colourCode = document.createElement('div');
    const name = document.createElement('p');
    const percent = document.createElement('p');

    label.classList.add('grid', 'align-items-center', 'legend-label');
    colourCode.classList.add('colour-code');
    name.textContent = categoriesSum[i].name;
    percent.textContent = `${relativePercentages[i] / 1000}%`;
    colourCode.style.background = colours[i];

    label.appendChild(colourCode);
    label.appendChild(name);
    label.appendChild(percent);

    fragment.appendChild(label);
  }

  // Creates 'others' category if needed
  if (numOfCategories > 10) {
    pieElems.push(`gray ${totalPercentage / 1000}% 100%`);

    const label = document.createElement('div');
    const colourCode = document.createElement('div');
    const name = document.createElement('p');
    const percent = document.createElement('p');

    label.classList.add('grid', 'align-items-center', 'legend-label');
    colourCode.classList.add('colour-code');
    name.textContent = 'Others';
    percent.textContent = `${(100000 - totalPercentage) / 1000}%`;
    colourCode.style.background = 'gray';

    label.appendChild(colourCode);
    label.appendChild(name);
    label.appendChild(percent);

    fragment.appendChild(label);
  }

  const gradient = pieElems.join(',');
  pie.style.background = `conic-gradient(${gradient})`;

  legend.appendChild(fragment);
}

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
      id = theme.dataset.id;
      if (id != null) type = 'theme';
    }
    window.rightClick.sendContextMenu(type, id);
  });
}

// Listens for commands from the IPC related to right-click options
function initRightClickCommands() {
  window.rightClick.deleteRow((_, id) => {
    const row = document.querySelector(`[data-id="${id}"]`);
    stagedTableChanges.removing.set(id, '');

    const summation = document.querySelector('.summation');
    const categoryId = row.querySelector('.category-cell').value;
    const cost = row.querySelector('.cost-cell').value;
    let newGrandTotal = expCategoriesSum.length === 0 ? 0 : expCategoriesSum[0].grandTotal;

    for (const category of expCategoriesSum) {
      if (category.categoryId === categoryId) {
        const newCategoryCost = Math.round(category.totalCategoryCost * 100 - cost * 100) / 100;
        newGrandTotal = Math.round(category.grandTotal * 100 - cost * 100) / 100;
        category.totalCategoryCost = newCategoryCost;
        expCategoriesSum[0].grandTotal = newGrandTotal;
        break;
      }
    }
    expCategoriesSum.sort((a, b) => b.totalCategoryCost - a.totalCategoryCost);
    expCategoriesSum[0].grandTotal = newGrandTotal;

    makePieChartAndLegend(expCategoriesSum);
    summation.textContent = `$${Number(newGrandTotal).toFixed(2)}`;

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
  if (theme == null) {
    theme = ogThemes['000'];
    localStorage.setItem('activeThemeId', '000');
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
  const colour = determineColour(lightness);
  document.documentElement.style.setProperty('--background-text', colour);
  document.documentElement.style.setProperty('--background-border', colour);
  document.documentElement.style.setProperty(
    '--background-box-shadow-light',
    colour === '#FFFFFF' ? '100%' : '0%'
  );
}

export function determinePrimTextColour(lightness) {
  const colour = determineColour(lightness);
  document.documentElement.style.setProperty('--primary-text', colour);
  document.documentElement.style.setProperty('--primary-border', colour);
  document.documentElement.style.setProperty(
    '--primary-box-shadow-light',
    colour === '#FFFFFF' ? '100%' : '0%'
  );

  let max = 3;

  for (let i = 1; i <= 3; i++) {
    const colour = determineColour(lightness, 10 * (i - max + 1));
    document.documentElement.style.setProperty(`--primary-text-light${i}`, colour);
    document.documentElement.style.setProperty(`--primary-border-light${i}`, colour);
    document.documentElement.style.setProperty(
      `--primary-box-shadow-light-light${i}`,
      colour === '#FFFFFF' ? '100%' : '0%'
    );
  }
}

export function determineSecTextColour(lightness) {
  const colour = determineColour(lightness);
  document.documentElement.style.setProperty('--secondary-text', determineColour(lightness));
  document.documentElement.style.setProperty(`--secondary-border`, colour);
  document.documentElement.style.setProperty(
    `--secondary-box-shadow-light`,
    colour === '#FFFFFF' ? '100%' : '0%'
  );

  for (let i = 1; i <= 3; i++) {
    const colour = determineColour(lightness, 10 * i);
    document.documentElement.style.setProperty(`--secondary-text-dark${i}`, colour);
    document.documentElement.style.setProperty(`--secondary-border-dark${i}`, colour);
    document.documentElement.style.setProperty(
      `--secondary-box-shadow-light-dark${i}`,
      colour === '#FFFFFF' ? '100%' : '0%'
    );
  }
}

export function determineTerTextColour(lightness) {
  const colour = determineColour(lightness);
  document.documentElement.style.setProperty('--tertiary-text', colour);
  document.documentElement.style.setProperty(`--tertiary-border`, colour);
  document.documentElement.style.setProperty(
    `--tertiary-box-shadow-light`,
    colour === '#FFFFFF' ? '100%' : '0%'
  );

  for (let i = 1; i <= 3; i++) {
    const colour = determineColour(lightness, 10 * i);
    document.documentElement.style.setProperty(`--tertiary-text-dark${i}`, colour);
    document.documentElement.style.setProperty(`--tertiary-border-dark${i}`, colour);
    document.documentElement.style.setProperty(
      `--tertiary-box-shadow-light-dark${i}`,
      colour === '#FFFFFF' ? '100%' : '0%'
    );
  }
}

export function determineColour(lightness, offset = 0) {
  return lightness >= 30 + offset ? '#000000' : '#FFFFFF';
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
// Remove colour transition to first cleanly apply theme
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.documentElement.classList.remove('no-transition');
  });
});
