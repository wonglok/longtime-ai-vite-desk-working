import { contextBridge, ipcMain, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
// In the preload script:
// import { ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  askAI: (data, stream: (v: any) => {}) => {
    return new Promise((resolve) => {
      const randID = `_${Math.random().toString(36).slice(2, 9)}`

      const handler = (_event, value: any) => {
        if (stream) {
          stream(value)
        }
      }
      ipcRenderer.on('askAI-stream' + randID, handler)

      ipcRenderer.once('askAI-reply' + randID, (_event, arg) => {
        resolve(arg)
        ipcRenderer.off('askAI-stream' + randID, handler)
      })
      ipcRenderer.send('askAI-message', data, randID)
    })
  }
}

//

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', {
      // Expose a function to register a callback for the 'data-update' channel
      handleDataUpdate: (callback: any) => {
        const fnc = (_: any, ...args: any): any => callback(...args)
        ipcRenderer.on('data-update', fnc)
        return () => {
          ipcRenderer.off('data-update', fnc)
        }
      },
      toAI: (event) => {
        ipcMain.emit(event.action, event.data)
      }
    })

    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
