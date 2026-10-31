import { ElectronAPI } from '@electron-toolkit/preload'

interface CommandBaseAPI {
  // Categories
  getCategories: () => Promise<any[]>
  addCategory: (name: string, icon: string) => Promise<number>
  updateCategory: (id: number, name: string) => Promise<boolean>
  deleteCategory: (id: number) => Promise<boolean>
  // Tools
  getTools: () => Promise<any[]>
  addTool: (tool: any) => Promise<number>
  updateTool: (id: number, tool: any) => Promise<boolean>
  deleteTool: (id: number) => Promise<boolean>
  // Commands
  getCommands: () => Promise<any[]>
  addCommand: (command: any) => Promise<number>
  updateCommand: (id: number, command: any) => Promise<boolean>
  deleteCommand: (id: number) => Promise<boolean>
  duplicateCommand: (id: number) => Promise<number | null>
  incrementCommandUse: (id: number) => Promise<boolean>
  toggleCommandFavorite: (id: number) => Promise<boolean>
  // Programs (Workflows)
  getPrograms: () => Promise<any[]>
  getProgramSteps: (programId: number) => Promise<any[]>
  addProgram: (name: string, description: string, category_id?: number) => Promise<number>
  updateProgram: (
    id: number,
    name: string,
    description: string,
    category_id?: number
  ) => Promise<boolean>
  deleteProgram: (id: number) => Promise<boolean>
  updateProgramSteps: (programId: number, steps: any[]) => Promise<boolean>
  toggleProgramFavorite: (id: number) => Promise<boolean>
  // Blog Posts
  getBlogPosts: () => Promise<any[]>
  addBlogPost: (post: any) => Promise<number>
  updateBlogPost: (id: number, post: any) => Promise<boolean>
  deleteBlogPost: (id: number) => Promise<boolean>
  // Resources
  getResources: () => Promise<any[]>
  addResource: (resource: any) => Promise<number>
  updateResource: (id: number, resource: any) => Promise<boolean>
  deleteResource: (id: number) => Promise<boolean>
  // Search
  globalSearch: (query: string) => Promise<any[]>
  // Export / Import / Backup (Step 6)
  exportData: () => Promise<{ success: boolean; filePath?: string }>
  importData: () => Promise<{ success: boolean; error?: string }>
  backupDb: () => Promise<{ success: boolean; filePath?: string }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CommandBaseAPI
  }
}
