import { ipcMain } from 'electron';

let sheetId = null;

export function registerDataStorageIpc() {
  ipcMain.handle('set-sheet-id', (event, { id }) => {
    sheetId = id;
  });

  ipcMain.handle('get-sheet-id', () => sheetId);
}
