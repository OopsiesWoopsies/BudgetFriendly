import {
  determineBackgroundTextColour,
  determinePrimTextColour,
  determineSecTextColour,
  determineTerTextColour
} from '../../../main.js';

const openConfig = document.getElementById('configButton');
const config = document.getElementById('config');
const closeConfig = document.getElementById('closeConfig');

const colourPickerBackground = document.getElementById('colourPickerBackground');
const colourPickerPrimary = document.getElementById('colourPickerPrimary');
const colourPickerSecondary = document.getElementById('colourPickerSecondary');
const colourPickerTertiary = document.getElementById('colourPickerTertiary');

export function initConfigListeners() {
  openConfig.addEventListener('click', () => {
    config.showModal();
  });

  closeConfig.addEventListener('click', () => {
    // set to current theme (consider importing that function from main)

    config.close();
  });

  themeConfigListeners();
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

  // save button
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
