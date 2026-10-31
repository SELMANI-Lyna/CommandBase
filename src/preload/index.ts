import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  // Categories
  getCategories: () => ipcRenderer.invoke('get-categories'),
  addCategory: (name: string, icon: string) => ipcRenderer.invoke('add-category', name, icon),
  updateCategory: (id: number, name: string) => ipcRenderer.invoke('update-category', id, name),
  deleteCategory: (id: number) => ipcRenderer.invoke('delete-category', id),

  // Tools
  getTools: () => ipcRenderer.invoke('get-tools'),
  addTool: (tool: any) => ipcRenderer.invoke('add-tool', tool),
  updateTool: (id: number, tool: any) => ipcRenderer.invoke('update-tool', id, tool),
  deleteTool: (id: number) => ipcRenderer.invoke('delete-tool', id),

  // Commands
  getCommands: () => ipcRenderer.invoke('get-commands'),
  addCommand: (command: any) => ipcRenderer.invoke('add-command', command),
  updateCommand: (id: number, command: any) => ipcRenderer.invoke('update-command', id, command),
  deleteCommand: (id: number) => ipcRenderer.invoke('delete-command', id),
  duplicateCommand: (id: number) => ipcRenderer.invoke('duplicate-command', id),
  incrementCommandUse: (id: number) => ipcRenderer.invoke('increment-command-use', id),
  toggleCommandFavorite: (id: number) => ipcRenderer.invoke('toggle-command-favorite', id),

  // Programs (Workflows)
  getPrograms: () => ipcRenderer.invoke('get-programs'),
  getProgramSteps: (programId: number) => ipcRenderer.invoke('get-program-steps', programId),
  addProgram: (name: string, description: string, category_id?: number) =>
    ipcRenderer.invoke('add-program', name, description, category_id),
  updateProgram: (id: number, name: string, description: string, category_id?: number) =>
    ipcRenderer.invoke('update-program', id, name, description, category_id),
  deleteProgram: (id: number) => ipcRenderer.invoke('delete-program', id),
  updateProgramSteps: (programId: number, steps: any[]) =>
    ipcRenderer.invoke('update-program-steps', programId, steps),
  toggleProgramFavorite: (id: number) => ipcRenderer.invoke('toggle-program-favorite', id),

  // Blog Posts
  getBlogPosts: () => ipcRenderer.invoke('get-blog-posts'),
  addBlogPost: (post: any) => ipcRenderer.invoke('add-blog-post', post),
  updateBlogPost: (id: number, post: any) => ipcRenderer.invoke('update-blog-post', id, post),
  deleteBlogPost: (id: number) => ipcRenderer.invoke('delete-blog-post', id),

  // Resources
  getResources: () => ipcRenderer.invoke('get-resources'),
  addResource: (resource: any) => ipcRenderer.invoke('add-resource', resource),
  updateResource: (id: number, resource: any) =>
    ipcRenderer.invoke('update-resource', id, resource),
  deleteResource: (id: number) => ipcRenderer.invoke('delete-resource', id),

  // Search
  globalSearch: (query: string) => ipcRenderer.invoke('global-search', query),

  // Export / Import / Backup
  exportData: () => ipcRenderer.invoke('export-data'),
  importData: () => ipcRenderer.invoke('import-data'),
  backupDb: () => ipcRenderer.invoke('backup-db')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
