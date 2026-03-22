import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  saveFile: (filename, content) => ipcRenderer.invoke('file:save', filename, content),
  loadFile: (filename) => ipcRenderer.invoke('file:load', filename),
})
