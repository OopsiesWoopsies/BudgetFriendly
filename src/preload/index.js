import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Sets up data storage functions to expose to the renderer
const dataStorageFunctions = {
  setSheetId: (sheetId) =>
    ipcRenderer.invoke('set-sheet-id', {
      id: sheetId
    }),
  getSheetId: () => ipcRenderer.invoke('get-sheet-id')
};

// Sets up db functions to expose to the renderer
const dbFunctions = {
  // Budget sheet queries
  getBudgetSheets: (id = null) =>
    ipcRenderer.invoke('budgetSheets:get', {
      id: id
    }),
  createNewBudgetSheet: (id, title, createdAt, period) =>
    ipcRenderer.invoke('budgetSheets:create', {
      id: id,
      title: title,
      createdAt: createdAt,
      period: period
    }),
  updateBudgetSheetTitle: (id, newTitle) =>
    ipcRenderer.invoke('budgetSheets:updateName', {
      id: id,
      newTitle: newTitle
    }),
  deleteBudgetSheet: (id) =>
    ipcRenderer.invoke('budgetSheets:delete', {
      id: id
    }),

  // Category queries
  getCategories: (budgetSheetId) =>
    ipcRenderer.invoke('categories:get', {
      budgetSheetId: budgetSheetId
    }),
  upsertCategories: (stagedChanges, budgetSheetId) =>
    ipcRenderer.invoke('categories:create', {
      stagedChanges: stagedChanges,
      budgetSheetId: budgetSheetId
    }),

  // Entry queries
  getEntries: (date, budgetSheetId) =>
    ipcRenderer.invoke('entries:get', {
      date: date,
      budgetSheetId: budgetSheetId
    }),
  createEntry: (id, name, categoryId, price, date, budgetSheetId) =>
    ipcRenderer.invoke('entries:create', {
      id: id,
      name: name,
      categoryId: categoryId,
      price: price,
      date: date,
      budgetSheetId: budgetSheetId
    }),
  deleteEntry: (id) =>
    ipcRenderer.invoke('entries:delete', {
      id: id
    }),

  // Budget amounts queries
  getBudgetAmount: (date, budgetSheetId) =>
    ipcRenderer.invoke('budgetAmounts:get', {
      date: date,
      budgetSheetId: budgetSheetId
    }),
  createNewBudgetAmount: (newId, amount, effectiveFrom, effectiveTo, budgetSheetId) =>
    ipcRenderer.invoke('budgetAmounts:create', {
      newId: newId,
      amount: amount,
      effectiveFrom: effectiveFrom,
      effectiveTo: effectiveTo,
      budgetSheetId: budgetSheetId
    })
};

if (process.contextIsolated) {
  // Exposes functions to renderer
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('db', dbFunctions);
    contextBridge.exposeInMainWorld('data', dataStorageFunctions);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
}
