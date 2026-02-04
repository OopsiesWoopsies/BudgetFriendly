import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Expose db functions to the renderer
const dbFunctions = {
  // Budget sheet queries
  getBudgetSheets: () => ipcRenderer.invoke('budgetSheets:get'),
  createNewBudgetSheet: (id, title, created_at, period, budget) =>
    ipcRenderer.invoke('budgetSheets:create', {
      id: id,
      title: title,
      created_at: created_at,
      period: period,
      budget: budget
    }),
  deleteBudgetSheet: (id) =>
    ipcRenderer.invoke('budgetSheets:delete', {
      id: id
    }),

  // Category queries
  getCategories: (budget_sheet_id) =>
    ipcRenderer.invoke('categories:get', {
      budget_sheet_id: budget_sheet_id
    }),
  createNewCategory: (id, name, budget_sheet_id) =>
    ipcRenderer.invoke('categories:create', {
      id: id,
      name: name,
      budget_sheet_id: budget_sheet_id
    }),
  deleteCategory: (id) =>
    ipcRenderer.invoke('categories:delete', {
      id: id
    }),

  // Entry queries
  getEntries: (date, budget_sheet_id) =>
    ipcRenderer.invoke('entries:get', {
      date: date,
      budget_sheet_id: budget_sheet_id
    }),
  createEntry: (id, name, category_id, price, date, budget_sheet_id) =>
    ipcRenderer.invoke('entries:create', {
      id: id,
      name: name,
      category_id: category_id,
      price: price,
      date: date,
      budget_sheet_id: budget_sheet_id
    }),
  deleteEntry: (id) =>
    ipcRenderer.invoke('entries:delete', {
      id: id
    })
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
