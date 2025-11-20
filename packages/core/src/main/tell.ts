/*
 * Copyright 2017 The Kubernetes Authors
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
 * Tell the renderer to execute a command (Electron-only, stub for Tauri builds)
 * This function is deprecated and only kept for backward compatibility with legacy Electron builds.
 * For Tauri builds, this is a no-op.
 */
const tellRendererToExecute = async (command: string, exec = 'qexec') => {
  // Stub implementation for Tauri - does nothing
  // In Tauri, commands are executed directly via Tauri's invoke API
  console.log('tellRendererToExecute is deprecated (Electron-only), command not executed:', command, exec)
}

export default tellRendererToExecute
