# Claude Guide for Kui Development

This guide helps AI assistants understand and work effectively with the Kui codebase.

## Project Overview

Kui is a framework that enhances command-line interfaces with graphical elements. It transforms traditional ASCII terminal output into interactive, visual experiences. The primary use case is Kubernetes tooling, where `kubectl` commands are enhanced with sortable tables, clickable elements, and rich visualizations.

**Key Facts:**
- Built with TypeScript, Electron, and React
- Monorepo structure with multiple packages and plugins
- 2-3x faster than native `kubectl` for many operations
- Supports both desktop apps (Electron) and web-based deployments

## Repository Structure

```
kui/
├── packages/           # Core framework components
│   ├── core/          # Core APIs, REPL, command processing
│   ├── builder/       # Build tools for Electron apps
│   ├── react/         # React components and UI framework
│   ├── webpack/       # Webpack configuration and loaders
│   ├── proxy/         # Client-server proxy support
│   └── test/          # Testing infrastructure
├── plugins/           # Feature plugins
│   ├── plugin-kubectl/         # Kubernetes enhancements
│   ├── plugin-bash-like/       # Bash-like shell features
│   ├── plugin-client-*/        # Client implementations
│   ├── plugin-*-themes/        # Theme providers
│   └── [others]/              # Git, S3, Electron, etc.
└── docs/              # API documentation
```

## Core Architecture

### Command Processing Flow

1. User enters command in REPL
2. Command parsed by `@kui-shell/core`
3. Matched against registered command handlers
4. Handler executes and returns response
5. Response rendered based on type (Table, HTML, Terminal, etc.)

### Response Types

Kui supports multiple response formats:

- **Table**: Sortable, filterable data tables
- **MultiModalResponse**: Rich content with multiple modes/views
- **Terminal/XtermResponse**: Traditional terminal output
- **HTML/React**: Custom rendered components
- **NavResponse**: Navigation and drilldown experiences

### Plugin System

Plugins extend Kui functionality through:

- **Command Registration**: Add new CLI commands
- **Mode Registration**: Add views/tabs to responses
- **Badge Registration**: Add status indicators
- **Theme Registration**: Custom visual themes
- **Preload Registration**: Initialization hooks

Each plugin exports a `preload` function that receives a `Registrar` to register its capabilities.

## Key Packages

### @kui-shell/core

The foundation of Kui. Contains:
- REPL (Read-Eval-Print-Loop) implementation
- Command registration and routing
- Event system
- Plugin loading mechanism
- Core response types (Table, Cell, Row)

**Important files:**
- `src/repl/exec.ts` - Command execution
- `src/core/command-tree.ts` - Command routing
- `src/models/` - Core data models

### @kui-shell/react

React components for the UI:
- Client shell and tab management
- Card/Table renderers
- Terminal (xterm.js) integration
- Split views and layouts

### @kui-shell/plugin-kubectl

The most feature-rich plugin, providing:
- Enhanced kubectl command output
- Resource drilldown and navigation
- YAML/JSON editors with validation
- Pod logs with streaming
- Helm, odo, and oc integration

## Development Workflow

### Setup

```bash
npm ci                  # Install dependencies
npm run compile         # Build TypeScript
npm run link            # Link packages
```

### Development Mode

```bash
npm run watch           # Watch mode for Electron
npm run watch:browser   # Watch mode for browser
```

### Building

```bash
npm run build:electron:mac:amd64    # Mac Intel
npm run build:electron:mac:arm64    # Mac Apple Silicon
npm run build:electron:linux:amd64  # Linux
npm run build:electron:win32:amd64  # Windows
```

### Testing

```bash
npm run test            # Run full test suite
npm run test1           # Run with PORT_OFFSET=0
npm run test:browser    # Browser-specific tests
```

## Making Changes

### Adding a Command

1. Create command handler in appropriate plugin
2. Define command registration in plugin's `preload`
3. Implement command logic with proper response type
4. Add tests in plugin's test directory

Example:
```typescript
export default async (commandTree: Registrar) => {
  commandTree.listen(
    '/mycommand',
    async ({ command, parsedOptions, execOptions }) => {
      // Command logic here
      return 'Response'
    },
    {
      usage: {
        docs: 'Description of command'
      }
    }
  )
}
```

### Modifying UI Components

1. Locate React component in `packages/react` or plugin
2. Ensure TypeScript types are maintained
3. Test in both Electron and browser contexts
4. Verify theme compatibility

### Working with Kubernetes Resources

The kubectl plugin provides utilities for:
- Resource fetching: `src/controller/kubectl/exec.ts`
- Resource formatting: `src/view/modes/`
- Resource navigation: `src/controller/kubectl/drilldown.ts`

## Common Patterns

### Async Command Handlers

Commands can return promises. Kui handles loading states automatically:

```typescript
commandTree.listen('/async-cmd', async () => {
  const data = await fetchData()
  return formatAsTable(data)
})
```

### Multi-Modal Responses

Provide multiple views for a single resource:

```typescript
return {
  apiVersion: 'kui-shell/v1',
  kind: 'NavResponse',
  breadcrumbs: [...],
  menus: [...],
  links: [...],
  resource: myResource
}
```

### Streaming Responses

For long-running operations:

```typescript
return {
  apiVersion: 'kui-shell/v1',
  kind: 'XtermResponse',
  rows: [{
    cells: [{
      apiVersion: 'kui-shell/v1',
      kind: 'XtermResponseCell',
      ptyProcess: childProcess
    }]
  }]
}
```

## Important Conventions

1. **TypeScript strict mode**: All code uses strict type checking
2. **Linting**: ESLint and Prettier are enforced via pre-commit hooks
3. **Exports**: Use explicit exports, avoid `export *`
4. **Error handling**: Use `UsageError` for user-facing errors
5. **Internationalization**: Use i18n strings where user-facing

## Testing Guidelines

- Unit tests alongside source files
- Integration tests in `tests/` directories
- Browser tests use headless Chrome
- Electron tests use spectron

Test files follow pattern: `*.spec.ts` or located in `tests/` directories

## Build System

### Webpack Configuration

- Main config: `packages/webpack/`
- Custom loaders for Monaco, WASM, etc.
- Tree-shaking enabled for production
- Source maps in development

### Electron Packaging

- Builder: `packages/builder/`
- Icons and assets: Set via `seticon.js`
- Platform-specific handling for PTY, native modules
- Code signing for macOS

## Performance Considerations

1. **Lazy loading**: Plugins loaded on demand
2. **Virtual scrolling**: For large tables
3. **Web workers**: For heavy computation
4. **Streaming**: For large datasets
5. **Caching**: Command output caching where appropriate

## Debugging

### Electron DevTools

```bash
npm run watch    # Launches with DevTools
```

### Browser Mode

```bash
npm run watch:browser  # Accessible at localhost:9080
```

### Logs

- Electron logs: Check console in DevTools
- PTY issues: Enable debug mode in settings
- Command execution: Use REPL debug commands

## Common Issues

### Build Failures

- Clear dist: `npm run compile:clean`
- Rebuild node modules: `npm run pty:rebuild`
- Clear cache: Remove `node_modules` and reinstall

### Test Failures

- Port conflicts: Adjust `PORT_OFFSET`
- Timing issues: Increase timeouts in test specs
- Browser issues: Update Chrome/Electron version

### Module Resolution

- Check `tsconfig.json` paths
- Verify package.json exports
- Ensure `npm run link` has been run

## Git Workflow

1. Branch from main
2. Make focused commits
3. Run tests before pushing
4. PR with clear description
5. Address review feedback

## Resources

- [API Documentation](docs/api/README.md)
- [Medium Blog](https://medium.com/the-graphical-terminal)
- [Template Repository](https://github.com/kui-shell/KuiClientTemplate)
- [Issues](https://github.com/IBM/kui/issues)

## Quick Reference

**File Search:**
- Command handlers: `plugins/*/src/controller/`
- UI components: `packages/react/src/` or `plugins/*/src/view/`
- Tests: `*/tests/` or `*.spec.ts`
- Types: `*/src/**/*.d.ts`

**Key Concepts:**
- REPL = Read-Eval-Print-Loop (the command processor)
- Tab = A workspace with command history
- Block = A single command execution
- Split = Side-by-side view layout
- Mode = A view/tab within a response

## Contributing Philosophy

Kui values:
- **Performance**: Fast startup, fast command execution
- **Extensibility**: Plugin-based architecture
- **Flexibility**: Support both Electron and browser
- **Polish**: Smooth animations, responsive UI
- **Developer experience**: Clear APIs, good documentation
