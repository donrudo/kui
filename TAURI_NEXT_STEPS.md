# Tauri Migration: Next Steps to Remove Electron

This document outlines the remaining work needed to complete the Tauri migration, verify all dependencies are at latest stable versions, perform thorough testing, and eventually remove Electron completely.

## Current Status

### ✅ Completed
- [x] Rust backend implementation in `src-tauri/`
- [x] Basic window management in Tauri
- [x] IPC command handlers
- [x] TypeScript bridge for Electron/Tauri compatibility
- [x] Build scripts in package.json
- [x] Initial documentation (TAURI_MIGRATION.md, CLAUDE.md)
- [x] Git commit and push to feature branch

### 🚧 In Progress
- [ ] Dependency version verification
- [ ] Testing infrastructure setup
- [ ] Electron feature parity
- [ ] Platform-specific testing

### ⏳ Not Started
- [ ] Complete menu system migration
- [ ] Full test suite execution
- [ ] Electron removal
- [ ] Production deployment

## Step 1: Verify and Update Tauri Dependencies

### 1.1 Check Current Rust Dependencies

Run this to check for outdated Rust crates:

```bash
cd src-tauri
cargo update --dry-run
```

### 1.2 Update Cargo.toml to Latest Stable Versions

**Current versions:**
```toml
[build-dependencies]
tauri-build = { version = "2.0", features = [] }

[dependencies]
tauri = { version = "2.0", features = ["macos-private-api", "protocol-asset"] }
tauri-plugin-shell = "2.0"
tauri-plugin-clipboard-manager = "2.0"
tauri-plugin-dialog = "2.0"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["full"] }
log = "0.4"
env_logger = "0.11"
urlencoding = "2.1"
```

**Action items:**
- [ ] Check Tauri v2 latest stable: https://github.com/tauri-apps/tauri/releases
- [ ] Update to specific patch versions (e.g., `2.0.6` → `2.9.3`)
- [ ] Verify all plugins are compatible with latest Tauri version
- [ ] Update serde to latest (currently at 1.0.228+)
- [ ] Update tokio if needed (currently at 1.48.0+)

**Recommended update:**
```toml
[build-dependencies]
tauri-build = { version = "2.9", features = [] }

[dependencies]
tauri = { version = "2.9", features = ["macos-private-api", "protocol-asset"] }
tauri-plugin-shell = "2.3"
tauri-plugin-clipboard-manager = "2.3"
tauri-plugin-dialog = "2.4"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.48", features = ["full"] }
log = "0.4"
env_logger = "0.11"
urlencoding = "2.1"
```

### 1.3 Update NPM Dependencies

Check `package.json` for Tauri CLI version:

```bash
npm outdated @tauri-apps/cli
```

**Current:**
```json
"@tauri-apps/cli": "^2.0.0"
```

**Update to:**
```json
"@tauri-apps/cli": "^2.9.0"
```

### 1.4 Verify Rust Toolchain

```bash
# Check current Rust version
rustc --version

# Update Rust if needed
rustup update stable

# Verify Cargo version
cargo --version
```

**Minimum requirements:**
- Rust: 1.70.0+ (latest stable recommended)
- Cargo: 1.70.0+

### 1.5 Install Tauri CLI

```bash
# Global installation (optional but helpful)
cargo install tauri-cli --version "^2.9"

# Or use via npm (already in package.json)
npm install
```

## Step 2: Install System Dependencies

### 2.1 Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install -y \
    libgtk-3-dev \
    libwebkit2gtk-4.0-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    patchelf \
    libssl-dev \
    pkg-config \
    build-essential \
    curl \
    wget \
    file \
    libwayland-dev \
    libxkbcommon-dev \
    wayland-protocols

# For hybrid Wayland/X11 support (XWayland)
sudo apt install -y xwayland

# Verify installations
pkg-config --modversion gtk+-3.0
pkg-config --modversion webkit2gtk-4.0
pkg-config --modversion wayland-client
```

### 2.2 macOS

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Verify installation
xcode-select -p

# Install Homebrew if not present
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# No additional packages needed on macOS (uses system frameworks)
```

### 2.3 Windows

**Manual installations required:**

1. **Visual Studio Build Tools**
   - Download: https://visualstudio.microsoft.com/downloads/
   - Install "Desktop development with C++"

2. **WebView2 Runtime**
   - Usually pre-installed on Windows 10/11
   - Download: https://developer.microsoft.com/microsoft-edge/webview2/

3. **Verify installations:**
   ```powershell
   # Check Visual Studio
   where cl.exe

   # Check WebView2
   reg query "HKLM\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"
   ```

## Step 3: Build and Test Tauri Application

### 3.1 Initial Build

```bash
# Clean previous builds
cd src-tauri
cargo clean

# Check for compilation errors (without building)
cargo check

# Build debug version
cargo build

# Build release version
cargo build --release

# Run the application
cargo tauri dev
```

**Expected output location:**
- Debug: `src-tauri/target/debug/`
- Release: `src-tauri/target/release/bundle/`

### 3.2 Fix Common Build Issues

**Issue: GTK libraries not found (Linux)**
```bash
sudo apt install libgtk-3-dev libwayland-dev
export PKG_CONFIG_PATH=/usr/lib/x86_64-linux-gnu/pkgconfig
```

**Issue: WebKit2GTK not found (Linux)**
```bash
sudo apt install libwebkit2gtk-4.0-dev
```

**Issue: Wayland libraries not found (Linux)**
```bash
sudo apt install libwayland-dev libxkbcommon-dev wayland-protocols
```

**Issue: Missing system libraries**
```bash
# Check what's missing
cargo build 2>&1 | grep "could not find"

# Install missing packages via apt/brew/choco
```

**Issue: Tauri config errors**
```bash
# Validate tauri.conf.json
cd src-tauri
cargo tauri info
```

### 3.3 Test Window Creation

Create a test script: `test-window.sh`

```bash
#!/bin/bash
echo "Testing Tauri window creation..."

# Start Tauri dev server
npm run compile &
COMPILE_PID=$!

# Wait for compilation
sleep 5

# Start Tauri
timeout 30 npm run open:tauri &
TAURI_PID=$!

# Wait for window to open
sleep 10

# Check if process is running
if ps -p $TAURI_PID > /dev/null; then
    echo "✅ Tauri window opened successfully"
    kill $TAURI_PID
else
    echo "❌ Tauri window failed to open"
fi

kill $COMPILE_PID 2>/dev/null
```

### 3.4 Test IPC Communication

Create test file: `packages/core/tests/tauri-ipc.test.ts`

```typescript
import { getIpcRenderer, isTauriRuntime } from '../src/main/tauri-bridge'

describe('Tauri IPC Bridge', () => {
  it('should detect Tauri runtime', () => {
    const isTauri = isTauriRuntime()
    console.log('Is Tauri runtime:', isTauri)
  })

  it('should get IPC renderer', () => {
    try {
      const ipc = getIpcRenderer()
      expect(ipc).toBeDefined()
      expect(ipc.send).toBeDefined()
      expect(ipc.invoke).toBeDefined()
    } catch (error) {
      // May fail in Node environment, expected
      console.log('IPC test skipped (browser environment required)')
    }
  })
})
```

Run tests:
```bash
npm test -- tauri-ipc.test.ts
```

## Step 4: Feature Parity Testing

### 4.1 Core Features Checklist

Test each feature in both Electron and Tauri:

**Window Management:**
- [ ] Create new window
- [ ] Close window
- [ ] Minimize/maximize window
- [ ] Resize window
- [ ] Move window position
- [ ] Multiple windows
- [ ] Window focus/blur events

**IPC Communication:**
- [ ] Send messages from renderer to main
- [ ] Invoke commands and receive responses
- [ ] Handle errors in IPC calls
- [ ] Event listeners and emitters
- [ ] Async command execution

**Menu System:**
- [ ] Application menu bar
- [ ] Context menus
- [ ] Menu item actions
- [ ] Keyboard shortcuts
- [ ] Platform-specific menus

**Native Features:**
- [ ] Clipboard operations
- [ ] File dialogs (open/save)
- [ ] Screenshots
- [ ] System tray icon
- [ ] Notifications

**Kui-Specific Features:**
- [ ] Command palette
- [ ] REPL execution
- [ ] Table rendering
- [ ] Terminal output
- [ ] Plugin loading
- [ ] Theme switching
- [ ] Context widgets

### 4.2 Create Feature Parity Test Suite

Create: `tests/tauri-feature-parity.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Tauri Feature Parity', () => {
  test.beforeEach(async ({ page }) => {
    // Launch Tauri app
    await page.goto('tauri://localhost')
  })

  test('should create main window', async ({ page }) => {
    expect(await page.title()).toContain('Kui')
  })

  test('should execute kubectl command', async ({ page }) => {
    await page.fill('input[type="text"]', 'kubectl get pods')
    await page.press('input[type="text"]', 'Enter')

    // Wait for response
    await page.waitForSelector('.repl-result')

    const result = await page.textContent('.repl-result')
    expect(result).toBeTruthy()
  })

  test('should open new window', async ({ context }) => {
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      // Trigger new window creation
      context.pages()[0].evaluate(() => {
        window.__TAURI__.core.invoke('create_new_window', {
          argv: ['shell']
        })
      })
    ])

    expect(newPage).toBeTruthy()
  })

  test('should handle IPC communication', async ({ page }) => {
    const result = await page.evaluate(async () => {
      return await window.__TAURI__.core.invoke('synchronous_message', {
        message: JSON.stringify({ operation: 'ping' })
      })
    })

    expect(result).toBeDefined()
  })
})
```

### 4.3 Performance Benchmarks

Create: `tests/performance-comparison.ts`

```typescript
import { performance } from 'perf_hooks'

interface BenchmarkResult {
  startup: number
  memoryUsage: number
  bundleSize: number
}

async function benchmarkTauri(): Promise<BenchmarkResult> {
  const start = performance.now()

  // Launch Tauri app
  // Measure startup time

  const startup = performance.now() - start

  // Get memory usage
  const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024

  // Get bundle size
  const fs = require('fs')
  const path = require('path')
  const bundlePath = path.join(__dirname, '../src-tauri/target/release/bundle')
  // Calculate size...

  return { startup, memoryUsage, bundleSize: 0 }
}

async function benchmarkElectron(): Promise<BenchmarkResult> {
  // Similar implementation for Electron
  return { startup: 0, memoryUsage: 0, bundleSize: 0 }
}

async function runComparison() {
  console.log('Running performance comparison...\n')

  const tauri = await benchmarkTauri()
  const electron = await benchmarkElectron()

  console.table({
    'Tauri': tauri,
    'Electron': electron,
    'Improvement': {
      startup: `${((electron.startup - tauri.startup) / electron.startup * 100).toFixed(1)}%`,
      memoryUsage: `${((electron.memoryUsage - tauri.memoryUsage) / electron.memoryUsage * 100).toFixed(1)}%`,
      bundleSize: `${((electron.bundleSize - tauri.bundleSize) / electron.bundleSize * 100).toFixed(1)}%`
    }
  })
}

runComparison()
```

## Step 5: Platform-Specific Testing

### 5.1 Test Matrix

| Feature | Linux | macOS (Intel) | macOS (ARM) | Windows |
|---------|-------|---------------|-------------|---------|
| Build succeeds | ☐ | ☐ | ☐ | ☐ |
| App launches | ☐ | ☐ | ☐ | ☐ |
| Window creation | ☐ | ☐ | ☐ | ☐ |
| IPC works | ☐ | ☐ | ☐ | ☐ |
| Menus work | ☐ | ☐ | ☐ | ☐ |
| Plugins load | ☐ | ☐ | ☐ | ☐ |
| kubectl integration | ☐ | ☐ | ☐ | ☐ |
| Theme switching | ☐ | ☐ | ☐ | ☐ |
| Bundle size < 20MB | ☐ | ☐ | ☐ | ☐ |

### 5.2 Platform Build Commands

```bash
# Linux x86_64
npm run build:tauri:linux:amd64

# macOS Intel
npm run build:tauri:mac:amd64

# macOS Apple Silicon
npm run build:tauri:mac:arm64

# Windows x86_64
npm run build:tauri:win32:amd64
```

### 5.3 Cross-Compilation Setup

**For cross-platform builds from Linux:**

```bash
# Install cross-compilation targets
rustup target add x86_64-apple-darwin
rustup target add aarch64-apple-darwin
rustup target add x86_64-pc-windows-msvc

# Install additional tools
cargo install cargo-bundle
cargo install tauri-cli
```

**For macOS universal binary:**

```bash
rustup target add x86_64-apple-darwin
rustup target add aarch64-apple-darwin

# Build universal binary
npm run build:tauri:mac:amd64
npm run build:tauri:mac:arm64

# Combine into universal binary
lipo -create \
  src-tauri/target/x86_64-apple-darwin/release/kui \
  src-tauri/target/aarch64-apple-darwin/release/kui \
  -output src-tauri/target/release/kui-universal
```

## Step 6: Complete Missing Features

### 6.1 Implement Full Menu System

**Create:** `src-tauri/src/menu.rs`

```rust
use tauri::{
    AppHandle, CustomMenuItem, Menu, MenuItem, Submenu,
    WindowMenuEvent,
};

pub fn create_menu(_app: &AppHandle) -> Result<Menu, tauri::Error> {
    let menu = Menu::new()
        .add_submenu(create_file_menu())
        .add_submenu(create_edit_menu())
        .add_submenu(create_view_menu())
        .add_submenu(create_window_menu())
        .add_submenu(create_help_menu());

    Ok(menu)
}

fn create_file_menu() -> Submenu {
    Submenu::new(
        "File",
        Menu::new()
            .add_item(CustomMenuItem::new("new_tab", "New Tab").accelerator("CmdOrCtrl+T"))
            .add_item(CustomMenuItem::new("new_window", "New Window").accelerator("CmdOrCtrl+N"))
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("close_tab", "Close Tab").accelerator("CmdOrCtrl+W"))
            .add_native_item(MenuItem::Quit),
    )
}

fn create_edit_menu() -> Submenu {
    Submenu::new(
        "Edit",
        Menu::new()
            .add_native_item(MenuItem::Undo)
            .add_native_item(MenuItem::Redo)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Cut)
            .add_native_item(MenuItem::Copy)
            .add_native_item(MenuItem::Paste)
            .add_native_item(MenuItem::SelectAll),
    )
}

fn create_view_menu() -> Submenu {
    Submenu::new(
        "View",
        Menu::new()
            .add_item(CustomMenuItem::new("toggle_devtools", "Toggle DevTools").accelerator("F12"))
            .add_item(CustomMenuItem::new("reload", "Reload").accelerator("CmdOrCtrl+R"))
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("zoom_in", "Zoom In").accelerator("CmdOrCtrl+Plus"))
            .add_item(CustomMenuItem::new("zoom_out", "Zoom Out").accelerator("CmdOrCtrl+-"))
            .add_item(CustomMenuItem::new("zoom_reset", "Reset Zoom").accelerator("CmdOrCtrl+0")),
    )
}

fn create_window_menu() -> Submenu {
    Submenu::new(
        "Window",
        Menu::new()
            .add_native_item(MenuItem::Minimize)
            .add_native_item(MenuItem::Zoom)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::CloseWindow),
    )
}

fn create_help_menu() -> Submenu {
    Submenu::new(
        "Help",
        Menu::new()
            .add_item(CustomMenuItem::new("docs", "Documentation"))
            .add_item(CustomMenuItem::new("about", "About Kui")),
    )
}

pub fn handle_menu_event(event: WindowMenuEvent) {
    match event.menu_item_id() {
        "new_tab" => {
            // Handle new tab
        }
        "new_window" => {
            // Handle new window
        }
        "close_tab" => {
            // Handle close tab
        }
        "toggle_devtools" => {
            #[cfg(debug_assertions)]
            event.window().open_devtools();
        }
        "reload" => {
            event.window().eval("location.reload()").ok();
        }
        "docs" => {
            // Open documentation
        }
        "about" => {
            // Show about dialog
        }
        _ => {}
    }
}
```

**Update:** `src-tauri/src/main.rs`

```rust
// Add menu handling
fn main() {
    tauri::Builder::default()
        // ... existing setup ...
        .menu(menu::create_menu)
        .on_menu_event(menu::handle_menu_event)
        // ... rest of setup ...
        .run(tauri::generate_context!())
        .expect("error while running Kui application");
}
```

### 6.2 Implement Screenshot Functionality

**Update:** `src-tauri/src/main.rs`

Add platform-specific screenshot implementation:

```rust
#[tauri::command]
async fn capture_to_clipboard(
    window: Window,
    x: i32,
    y: i32,
    width: u32,
    height: u32,
) -> Result<Vec<u8>, String> {
    use tauri_plugin_clipboard_manager::ClipboardExt;

    // Capture screenshot (platform-specific)
    #[cfg(target_os = "macos")]
    {
        // macOS implementation using objc
        // ...
    }

    #[cfg(target_os = "linux")]
    {
        // Linux implementation using X11/Wayland
        // ...
    }

    #[cfg(target_os = "windows")]
    {
        // Windows implementation
        // ...
    }

    Ok(vec![])
}
```

### 6.3 Update Plugin System

**Create:** `packages/core/src/main/tauri-plugins.ts`

```typescript
/**
 * Plugin loading for Tauri runtime
 */
import { isTauriRuntime } from './tauri-bridge'

export async function loadPlugin(pluginName: string) {
  if (isTauriRuntime()) {
    // Tauri plugin loading
    const { invoke } = window.__TAURI__.core
    return await invoke('load_plugin', { name: pluginName })
  } else {
    // Electron plugin loading (existing implementation)
    return await import(`@kui-shell/plugin-${pluginName}`)
  }
}
```

## Step 7: Update Existing Code for Tauri

### 7.1 Replace Electron IPC Calls

**Find all Electron IPC usage:**

```bash
grep -r "ipcRenderer" packages/ plugins/ --include="*.ts" --include="*.tsx"
grep -r "ipcMain" packages/ --include="*.ts"
grep -r "require('electron')" packages/ plugins/ --include="*.ts" --include="*.tsx"
```

**Replace pattern:**

Before:
```typescript
const { ipcRenderer } = require('electron')
ipcRenderer.send('channel', data)
```

After:
```typescript
import { getIpcRenderer } from '@kui-shell/core/src/main/tauri-bridge'
const ipc = getIpcRenderer()
ipc.send('channel', data)
```

### 7.2 Update plugin-electron-components

**Option 1: Rename to plugin-native-components**

```bash
mv plugins/plugin-electron-components plugins/plugin-native-components
```

**Option 2: Create plugin-tauri-components**

```bash
mkdir -p plugins/plugin-tauri-components/src
```

Update component implementations to use Tauri APIs where needed.

### 7.3 Update Tests

**Find tests that use Electron:**

```bash
grep -r "electron" packages/test/ plugins/*/tests/ --include="*.ts"
```

**Create Tauri test utilities:** `packages/test/src/tauri-utils.ts`

```typescript
import { isTauriRuntime } from '@kui-shell/core/src/main/tauri-bridge'

export function skipIfTauri(test: any) {
  if (isTauriRuntime()) {
    test.skip()
  }
}

export function skipIfElectron(test: any) {
  if (!isTauriRuntime()) {
    test.skip()
  }
}

export function runInBothRuntimes(testFn: () => void) {
  describe('in Electron', () => {
    // Run with Electron
    testFn()
  })

  describe('in Tauri', () => {
    // Run with Tauri
    testFn()
  })
}
```

## Step 8: Continuous Integration Setup

### 8.1 GitHub Actions Workflow

**Create:** `.github/workflows/tauri-build.yml`

```yaml
name: Tauri Build

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-tauri:
    strategy:
      fail-fast: false
      matrix:
        platform: [macos-latest, ubuntu-20.04, windows-latest]

    runs-on: ${{ matrix.platform }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Install dependencies (Ubuntu)
        if: matrix.platform == 'ubuntu-20.04'
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev \
            libayatana-appindicator3-dev librsvg2-dev patchelf \
            libwayland-dev libxkbcommon-dev wayland-protocols xwayland

      - name: Install npm dependencies
        run: npm ci

      - name: Build Tauri app
        run: npm run tauri:build

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: tauri-${{ matrix.platform }}
          path: src-tauri/target/release/bundle/

  test-tauri:
    needs: build-tauri
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Run tests
        run: npm test
```

### 8.2 Add Pre-commit Hooks

**Update:** `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Lint TypeScript
npm run lint

# Check Rust formatting
cd src-tauri && cargo fmt --check
cd ..

# Run quick tests
npm test
```

## Step 9: Documentation Updates

### 9.1 Update README.md

Add Tauri installation instructions:

```markdown
## Installation

### Using Tauri (Recommended)

#### macOS
```bash
brew install kui
```

#### Linux
```bash
# Download the .deb or .AppImage from releases
sudo dpkg -i kui_*.deb
# or
chmod +x kui_*.AppImage && ./kui_*.AppImage
```

#### Windows
Download the .msi installer from releases and run it.

### Building from Source

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Clone repository
git clone https://github.com/IBM/kui.git
cd kui

# Install dependencies
npm ci

# Build and run
npm run open:tauri
```
```

### 9.2 Create User Migration Guide

**Create:** `docs/MIGRATING_TO_TAURI.md`

Explain:
- What users need to know
- How to install Tauri version
- Differences from Electron version
- How to report issues

### 9.3 Update API Documentation

Update docs to reflect Tauri-specific APIs and changes.

## Step 10: Remove Electron

### 10.1 Deprecation Plan

**Phase 1: Dual Support (Current)**
- Both Electron and Tauri available
- Tauri is recommended
- Duration: 3-6 months

**Phase 2: Deprecation Warning**
- Add deprecation warnings to Electron builds
- Update documentation
- Announce timeline
- Duration: 3 months

**Phase 3: Electron Removal**
- Remove Electron dependencies
- Remove Electron-specific code
- Update build scripts

### 10.2 Files to Remove

Once Tauri is fully tested and stable:

**Electron-specific packages:**
```bash
# Remove from package.json
- "@electron/remote"
- "electron"

# Remove build tools
- packages/builder/dist/electron/
```

**Electron-specific code:**
```bash
# These can be removed:
- packages/core/src/main/spawn-electron.ts (keep for reference initially)
- plugins/plugin-electron-components/ (if fully replaced)
```

**Update package.json:**

Remove:
```json
{
  "scripts": {
    "build:electron:*": "...",
    "open": "electron . -- shell"
  },
  "devDependencies": {
    "electron": "^22.3.5",
    "@electron/remote": "^2.0.9"
  }
}
```

Keep only:
```json
{
  "scripts": {
    "build": "npm run tauri:build",
    "open": "npm run open:tauri",
    "open:tauri": "npm run tauri:dev"
  }
}
```

### 10.3 Update Import Statements

Remove Electron imports throughout codebase:

```bash
# Find all electron imports
grep -r "from 'electron'" packages/ plugins/ --include="*.ts" --include="*.tsx"

# Replace with Tauri bridge
sed -i "s/from 'electron'/from '@kui-shell\/core\/src\/main\/tauri-bridge'/g" **/*.ts
```

## Step 11: Final Validation

### 11.1 Full Test Suite

```bash
# Run all tests
npm test

# Run specific Tauri tests
npm test -- --grep "tauri"

# Run integration tests
npm run test:browser
```

### 11.2 Smoke Tests

Manual testing checklist:
- [ ] Application launches successfully
- [ ] All plugins load correctly
- [ ] kubectl commands execute properly
- [ ] Tables render and are sortable
- [ ] Terminal output displays correctly
- [ ] Themes switch properly
- [ ] Windows can be created/closed
- [ ] Menus work on all platforms
- [ ] Context menus function
- [ ] Screenshots work
- [ ] Clipboard operations succeed
- [ ] File dialogs work
- [ ] No console errors

### 11.3 Performance Validation

Confirm improvements:
- [ ] Bundle size < 20MB (vs ~150MB Electron)
- [ ] Memory usage < 100MB (vs ~150MB Electron)
- [ ] Startup time < 1s (vs ~2s Electron)

### 11.4 Security Audit

```bash
# Audit Rust dependencies
cd src-tauri
cargo audit

# Audit npm dependencies
npm audit

# Check for known vulnerabilities
cargo outdated
npm outdated
```

## Timeline Estimate

| Phase | Duration | Tasks |
|-------|----------|-------|
| Dependency Updates | 1-2 days | Update all deps to latest stable |
| System Setup | 1 day | Install deps on all platforms |
| Initial Testing | 3-5 days | Build, test basic features |
| Feature Completion | 1-2 weeks | Menus, screenshots, plugins |
| Code Migration | 1 week | Replace all Electron calls |
| Testing | 1-2 weeks | Full test suite, all platforms |
| Documentation | 3-5 days | Update all docs |
| CI/CD Setup | 2-3 days | GitHub Actions, automation |
| Stabilization | 1-2 weeks | Bug fixes, polish |
| Electron Removal | 1 week | Remove old code |
| **Total** | **6-10 weeks** | Full migration |

## Success Criteria

Before removing Electron completely:

- [ ] Tauri builds successfully on all platforms (macOS, Linux, Windows)
- [ ] All features work identically in Tauri and Electron
- [ ] Full test suite passes with Tauri
- [ ] Performance improvements confirmed
- [ ] No regressions in functionality
- [ ] Documentation is complete and accurate
- [ ] CI/CD pipeline is working
- [ ] User feedback is positive
- [ ] Security audit passes
- [ ] Bundle size < 20MB
- [ ] Memory usage < 100MB
- [ ] Startup time < 1s

## Rollback Plan

If issues arise:

1. **Revert to Electron**: Keep Electron support for 6+ months
2. **Fix issues**: Address problems in Tauri implementation
3. **Gradual adoption**: Let users choose runtime
4. **Gather feedback**: Understand pain points
5. **Iterate**: Improve Tauri implementation
6. **Re-attempt removal**: Once stable

## Resources

- **Tauri Documentation**: https://tauri.app/v1/guides/
- **Tauri Discord**: https://discord.com/invite/tauri
- **Kui Issues**: https://github.com/IBM/kui/issues
- **Migration Guide**: [TAURI_MIGRATION.md](./TAURI_MIGRATION.md)

## Contact

For questions about this migration:
- Create an issue: https://github.com/IBM/kui/issues
- Tag with `tauri` and `migration`
- Include platform and version information
