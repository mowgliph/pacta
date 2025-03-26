import { ipcRenderer } from 'electron'
import type { CacheAPI } from '../../shared/types'

export const cacheAPI: CacheAPI = {
  async get<T>(key: string): Promise<T | null> {
    return await ipcRenderer.invoke('cache:get', key)
  },

  async set<T>(key: string, value: T): Promise<void> {
    await ipcRenderer.invoke('cache:set', { key, value })
  },

  async remove(key: string): Promise<void> {
    await ipcRenderer.invoke('cache:remove', key)
  },

  async clear(): Promise<void> {
    await ipcRenderer.invoke('cache:clear')
  }
}