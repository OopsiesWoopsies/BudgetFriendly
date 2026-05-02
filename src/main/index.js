import { app, shell, BrowserWindow, ipcMain, Menu } from 'electron';
import { join } from 'path';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import { registerSheetIpc } from './db/dbFunctions/sheetDb';
import { registerBudgetSettingsIpc } from './db/dbFunctions/budgetSettingsDb';
import { registerEntriesIpc } from './db/dbFunctions/entriesDb';
import { registerBudgetAmountsIpc } from './db/dbFunctions/budgetAmountsDb';
import { registerThemeIpc } from './db/dbFunctions/themeDb';
import { registerDataStorageIpc } from './data/data';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  // Full screen
  mainWindow.maximize();

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Welcome page of BudgetFriendly
  mainWindow.loadFile(join(__dirname, '../../src/renderer/pages/welcome/welcome.html'));

  // Right click menu
  ipcMain.on('context-menu', (event, type, id) => {
    const template = [
      { role: 'copy' },
      { role: 'paste' },
      { type: 'separator' },
      { role: 'undo' },
      { role: 'redo' }
    ];

    // Reveal new options specific to significant elements
    if (type === 'entry') {
      template.push({ type: 'separator' });
      template.push({
        label: 'delete row',
        click: (_, browserWindow) => {
          browserWindow.webContents.send('delete-row', id);
        }
      });
    }

    if (type === 'sheet') {
      template.push({ type: 'separator' });
      template.push({
        label: 'delete budget sheet',
        click: (_, browserWindow) => {
          browserWindow.webContents.send('delete-sheet', id);
        }
      });
    }

    const menu = Menu.buildFromTemplate(template);

    menu.popup({
      window: BrowserWindow.fromWebContents(event.sender)
    });
  });
}

// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on('ping', () => console.log('pong'));

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Db functions
registerSheetIpc();
registerBudgetSettingsIpc();
registerEntriesIpc();
registerBudgetAmountsIpc();
registerDataStorageIpc();
registerThemeIpc();
