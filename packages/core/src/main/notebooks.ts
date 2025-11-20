/*
 * Copyright 2021 The Kubernetes Authors
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

import { NotebooksMenu, isMenu, isLeaf } from './load'

// Stub type for compatibility
interface MenuItemConstructorOptions {
  label?: string
  submenu?: MenuItemConstructorOptions[]
  [key: string]: unknown
}

interface OpenNotebookItem {
  label: string
  click: () => void
}

/**
 * Open a new window or tab and replay the contents of the given `filepath`
 * Stub for Tauri builds - creates new window
 */
export async function replay(filepath: string, createWindow: (executeThisArgvPlease?: string[]) => void) {
  // For Tauri, just create a new window with the replay command
  console.log('replay() stub called for Tauri, creating new window for:', filepath)
  createWindow(['replay', filepath])
}

/** @return a menu item that opens the given notebook */
export function openNotebook(
  createWindow: (executeThisArgvPlease?: string[]) => void,
  label: string,
  filepath: string
): OpenNotebookItem {
  return {
    label,
    click: () => replay(filepath, createWindow)
  }
}

/** We only need to replace the NotebookDefinitionMenuItem with calls to our `notebook` helper */
export function clientNotebooksDefinitionToElectron(
  defn: NotebooksMenu,
  notebook: (label: string, filepath: string) => OpenNotebookItem
): MenuItemConstructorOptions | undefined {
  if (defn) {
    return {
      label: defn.label,
      submenu: defn.submenu.map(item => {
        if (isMenu(item)) {
          return clientNotebooksDefinitionToElectron(item, notebook)
        } else if (isLeaf(item)) {
          // this is the only mogrifier
          return notebook(item.notebook, item.filepath)
        } else {
          // separator, no change
          return item
        }
      })
    }
  }
  return undefined
}
