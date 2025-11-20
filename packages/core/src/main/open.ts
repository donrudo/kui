/*
 * Copyright 2020 The Kubernetes Authors
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

export const filters = [{ name: 'Kui snapshot', extensions: ['md'] }]

/**
 * Open a file and replay its session (Electron-only, stub for Tauri builds)
 * For Tauri, use Tauri's file dialog API instead.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function open(_createWindow: (executeThisArgvPlease?: string[]) => void) {
  console.log('open() is deprecated (Electron-only). For Tauri, use Tauri file dialog APIs.')
}
