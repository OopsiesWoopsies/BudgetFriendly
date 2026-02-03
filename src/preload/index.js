import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Expose db functions to the renderer
const dbFunctions = {
  getBudgetSheets: () => ipcRenderer.invoke('budgetSheets:get'),
  createNewBudgetSheet: () => ipcRenderer.invoke('budgetSheets:create'),
  deleteBudgetSheet: () => ipcRenderer.invoke('budgetSheets:delete'),

  getCategories: () => ipcRenderer.invoke('categories:get'),
  createNewCategory: () => ipcRenderer.invoke('categories:create'),
  deleteCategory: () => ipcRenderer.invoke('categories:delete'),

  getEntries: () => ipcRenderer.invoke('entries:get'),
  createEntry: () => ipcRenderer.invoke('entries:create'),
  deleteEntry: () => ipcRenderer.invoke('entries:delete')
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('db', dbFunctions);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
}
