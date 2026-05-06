import {
  determineBackgroundTextColour,
  determinePrimTextColour,
  determineSecTextColour,
  determineTerTextColour,
  determineTextColour
} from '../../../main.js';

const openConfig = document.getElementById('configButton');
const config = document.getElementById('config');
const closeConfig = document.getElementById('closeConfig');

const userThemes = document.getElementById('userThemes');
const themeNameInput = document.getElementById('themeNameInput');
const saveThemeBut = document.getElementById('saveThemeButton');

const colourPickerBackground = document.getElementById('colourPickerBackground');
const colourPickerPrimary = document.getElementById('colourPickerPrimary');
const colourPickerSecondary = document.getElementById('colourPickerSecondary');
const colourPickerTertiary = document.getElementById('colourPickerTertiary');

export function initConfigListeners() {
  openConfig.addEventListener('click', () => {
    displayThemes();

    config.showModal();
  });

  closeConfig.addEventListener('click', () => {
    // set to current theme (consider importing that function from main)

    themeNameInput.placeholder = 'name';
    config.close();
  });

  themeConfigListeners();
}

async function displayThemes() {
  const fragment = document.createDocumentFragment();
  const allThemes = await window.db.getThemes();
  console.log(allThemes);

  for (const theme of allThemes) {
    const result = generateButton(theme);

    fragment.appendChild(result);
  }

  userThemes.appendChild(fragment);
}

function generateButton(theme) {
  const flexbox = document.createElement('button');
  const label = document.createElement('label');
  const grid = document.createElement('div');
  const primBg = document.createElement('div');
  const secBg = document.createElement('div');
  const terBg = document.createElement('div');

  primBg.style.backgroundColor = theme.primaryHex;
  secBg.style.backgroundColor = theme.secondaryHex;
  terBg.style.backgroundColor = theme.tertiaryHex;
  primBg.dataset.hex = theme.primaryHex;
  secBg.dataset.hex = theme.secondaryHex;
  terBg.dataset.hex = theme.tertiaryHex;
  label.textContent = theme.name;
  label.style.color = determineTextColour(hexToHSL(theme.backgroundHex).l);
  grid.classList.add('display-colours', 'grid');
  grid.appendChild(primBg);
  grid.appendChild(secBg);
  grid.appendChild(terBg);

  flexbox.classList.add('flex', 'custom-button', 'theme');
  flexbox.style.backgroundColor = theme.backgroundHex;
  flexbox.appendChild(label);
  flexbox.appendChild(grid);

  return flexbox;
}

function themeConfigListeners() {
  let backgroundColour = colourPickerBackground.value,
    primaryColour = colourPickerPrimary.value,
    secondaryColour = colourPickerSecondary.value,
    tertiaryColour = colourPickerTertiary.value;

  colourPickerBackground.addEventListener('input', ({ target }) => {
    document.documentElement.style.setProperty('--background-colour', target.value);
    const hsl = hexToHSL(target.value);
    determineBackgroundTextColour(hsl.l);
  });

  colourPickerBackground.addEventListener('change', ({ target }) => {
    backgroundColour = target.value;
  });

  colourPickerPrimary.addEventListener('input', ({ target }) => {
    const hsl = hexToHSL(target.value);
    document.documentElement.style.setProperty(
      '--primary-colour',
      `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
    );

    let max = 3;

    for (let i = 1; i <= max; i++) {
      document.documentElement.style.setProperty(
        `--primary-colour-light${i}`,
        `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l + 10 * (max - i + 1)}%)`
      );
    }

    determinePrimTextColour(hsl.l);
  });
  colourPickerPrimary.addEventListener('change', ({ target }) => {
    primaryColour = target.value;
  });

  colourPickerSecondary.addEventListener('input', ({ target }) => {
    const hsl = hexToHSL(target.value);
    document.documentElement.style.setProperty(
      '--secondary-colour',
      `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
    );

    for (let i = 1; i <= 3; i++) {
      document.documentElement.style.setProperty(
        `--secondary-colour-dark${i}`,
        `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l + 10 * i}%)`
      );
    }

    determineSecTextColour(hsl.l);
  });
  colourPickerSecondary.addEventListener('change', ({ target }) => {
    secondaryColour = target.value;
  });

  colourPickerTertiary.addEventListener('input', ({ target }) => {
    const hsl = hexToHSL(target.value);
    document.documentElement.style.setProperty(
      '--tertiary-colour',
      `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
    );
    for (let i = 1; i <= 3; i++) {
      document.documentElement.style.setProperty(
        `--tertiary-colour-dark${i}`,
        `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l + 10 * i}%)`
      );
    }

    determineTerTextColour(hsl.l);
  });
  colourPickerTertiary.addEventListener('change', ({ target }) => {
    tertiaryColour = target.value;
  });

  saveThemeBut.addEventListener('click', () => {
    if (themeNameInput.value === '') {
      themeNameInput.placeholder = 'CANNOT BE EMPTY';
      return;
    }
    const name = themeNameInput.value;

    window.db.createTheme(
      crypto.randomUUID(),
      name,
      backgroundColour,
      primaryColour,
      secondaryColour,
      tertiaryColour
    );
    themeNameInput.value = '';

    // Add to theme display
    const theme = {
      name: name,
      backgroundHex: backgroundColour,
      primaryHex: primaryColour,
      secondaryHex: secondaryColour,
      tertiaryHex: tertiaryColour
    };
    const result = generateButton(theme);
    userThemes.appendChild(result);
    // set active theme to saved theme
  });
}

function hexToHSL(hex) {
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
