/*
 * Copyright 2025 The Kubernetes Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Tauri Bridge
 *
 * This module provides a compatibility layer between Electron and Tauri,
 * allowing Kui to work with either runtime with minimal code changes.
 */

import Debug from 'debug'
const debug = Debug('main/tauri-bridge')

// Check if we're running in Tauri or Electron
const isTauri = typeof window !== 'undefined' && (window as any).__TAURI__ !== undefined
const isElectron = typeof window !== 'undefined' && (window as any).electron !== undefined

debug('Runtime detection:', { isTauri, isElectron })

/**
 * Tauri invoke function (available in Tauri apps)
 */
declare global {
  interface Window {
    __TAURI__?: {
      core: {
        invoke: (cmd: string, args?: Record<string, any>) => Promise<any>
      }
    }
  }
}

/**
 * IPC Renderer interface
 * Provides a unified API for both Electron and Tauri
 */
export interface IpcRenderer {
  send(channel: string, ...args: any[]): void
  invoke(channel: string, ...args: any[]): Promise<any>
  on(channel: string, listener: (event: any, ...args: any[]) => void): void
  once(channel: string, listener: (event: any, ...args: any[]) => void): void
  removeListener(channel: string, listener: (...args: any[]) => void): void
}

/**
 * Tauri IPC Renderer implementation
 */
class TauriIpcRenderer implements IpcRenderer {
  private listeners: Map<string, Set<Function>> = new Map()

  async send(channel: string, ...args: any[]): Promise<void> {
    debug('Tauri send:', channel, args)
    const message = args[0]

    try {
      const result = await window.__TAURI__!.core.invoke('synchronous_message', {
        message: typeof message === 'string' ? message : JSON.stringify(message)
      })
      debug('Tauri send result:', result)
    } catch (error) {
      console.error('Tauri send error:', error)
    }
  }

  async invoke(channel: string, ...args: any[]): Promise<any> {
    debug('Tauri invoke:', channel, args)

    // Map Electron IPC channels to Tauri commands
    switch (channel) {
      case '/exec/invoke':
        return window.__TAURI__!.core.invoke('exec_invoke', {
          message: args[0]
        })

      case 'synchronous-message':
        return window.__TAURI__!.core.invoke('synchronous_message', {
          message: args[0]
        })

      case 'capture-page-to-clipboard':
        const [contentsId, rect] = args
        return window.__TAURI__!.core.invoke('capture_to_clipboard', {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        })

      default:
        console.warn('Unhandled Tauri invoke channel:', channel)
        return null
    }
  }

  on(channel: string, listener: (event: any, ...args: any[]) => void): void {
    debug('Tauri on:', channel)
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set())
    }
    this.listeners.get(channel)!.add(listener)
  }

  once(channel: string, listener: (event: any, ...args: any[]) => void): void {
    debug('Tauri once:', channel)
    const wrappedListener = (event: any, ...args: any[]) => {
      listener(event, ...args)
      this.removeListener(channel, wrappedListener)
    }
    this.on(channel, wrappedListener)
  }

  removeListener(channel: string, listener: (...args: any[]) => void): void {
    debug('Tauri removeListener:', channel)
    const channelListeners = this.listeners.get(channel)
    if (channelListeners) {
      channelListeners.delete(listener)
    }
  }

  // Helper method to emit events (for internal use)
  emit(channel: string, ...args: any[]): void {
    const channelListeners = this.listeners.get(channel)
    if (channelListeners) {
      channelListeners.forEach(listener => {
        try {
          listener({}, ...args)
        } catch (error) {
          console.error('Error in listener:', error)
        }
      })
    }
  }
}

/**
 * Get the appropriate IPC renderer based on the runtime
 */
export function getIpcRenderer(): IpcRenderer {
  if (isTauri) {
    debug('Using Tauri IPC renderer')
    return new TauriIpcRenderer()
  } else if (isElectron) {
    debug('Using Electron IPC renderer')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ipcRenderer } = require('electron')
    return ipcRenderer
  } else {
    debug('No IPC renderer available')
    throw new Error('Neither Tauri nor Electron runtime detected')
  }
}

/**
 * Check if running in Tauri
 */
export function isTauriRuntime(): boolean {
  return isTauri
}

/**
 * Check if running in Electron
 */
export function isElectronRuntime(): boolean {
  return isElectron
}

/**
 * Get runtime name
 */
export function getRuntimeName(): string {
  if (isTauri) return 'Tauri'
  if (isElectron) return 'Electron'
  return 'Unknown'
}
