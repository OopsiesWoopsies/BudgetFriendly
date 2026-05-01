import db from '../db.js';
import { ipcMain } from 'electron';
import { enqueue } from '../dbQueue.js';

function getThemes() {
  return db
    .prepare(
      `
    SELECT 
      id,
      name,
      background_hex AS backgroundHex,
      primary_hex AS primaryHex,
      secondary_hex AS secondaryHex,
      tertiary_hex AS tertiaryHex
    FROM custom_themes
    `
    )
    .all();
}

function saveTheme(id, name, backgroundHex, primaryHex, secondaryHex, tertiaryHex) {
  return db
    .prepare(
      `
    INSERT INTO custom_themes 
    (id, name, background_hex, primary_hex, secondary_hex, tertiary_hex) 
    VALUES(?, ?, ?, ?, ?, ?)
    `
    )
    .run(id, name, backgroundHex, primaryHex, secondaryHex, tertiaryHex);
}

function deleteTheme(id) {
  return db.prepare('DELETE FROM custom_themes WHERE id = ?').run(id).changes;
}

// Registers db function for renderer use
export function registerThemeIpc() {
  ipcMain.handle('themes:get', () => {
    return enqueue(() => getThemes());
  });

  ipcMain.handle(
    'themes:create',
    (_event, { id, name, backgroundHex, primaryHex, secondaryHex, tertiaryHex }) => {
      return enqueue(() =>
        saveTheme(id, name, backgroundHex, primaryHex, secondaryHex, tertiaryHex)
      );
    }
  );

  ipcMain.handle('themes:delete', (_event, { id }) => {
    return enqueue(() => deleteTheme(id));
  });
}
