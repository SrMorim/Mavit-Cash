import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppName: () => ipcRenderer.invoke('get-app-name'),
  
  // Menu event listeners
  onMenuNewExpense: (callback: () => void) => {
    ipcRenderer.on('menu-new-expense', callback)
  },
  
  onMenuExportData: (callback: () => void) => {
    ipcRenderer.on('menu-export-data', callback)
  },
  
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  }
})

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>
      getAppName: () => Promise<string>
      onMenuNewExpense: (callback: () => void) => void
      onMenuExportData: (callback: () => void) => void
      removeAllListeners: (channel: string) => void
    }
  }
}