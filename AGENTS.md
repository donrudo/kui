# Kui Plugin Architecture and Agent System

This document explains Kui's plugin system, available plugins, and how to create custom extensions.

## Plugin Architecture

Kui uses a plugin-based architecture where functionality is modularized into independent packages. Each plugin can:

- Register new commands
- Add visual modes/views to responses
- Contribute UI widgets and themes
- Extend existing commands
- Provide custom response renderers

### Plugin Lifecycle

1. **Discovery**: Plugins listed in root `package.json` dependencies
2. **Loading**: Core loads plugins during initialization
3. **Registration**: Plugin's `preload` function called with `Registrar`
4. **Activation**: Commands and features become available

### Plugin Structure

```
plugin-name/
├── package.json          # Plugin metadata
├── src/
│   ├── preload.ts       # Main entry point
│   ├── controller/      # Command handlers
│   ├── view/            # UI components, modes
│   └── models/          # Data structures
└── tests/               # Plugin tests
```

## Core Plugin Types

### 1. Client Plugins

Define the overall application shell and user experience.

#### plugin-client-default

The standard Kui client with full features:
- Tab management
- Command palette
- Split views
- Context widgets (directory, git branch)
- Status stripe

#### plugin-client-alternate

Alternative client layouts for different use cases.

#### plugin-client-common

Shared components used by all clients:
- Input provider (command line)
- Tab content rendering
- Context menu handlers
- Settings panel

#### plugin-client-notebook

Notebook-style interface for sequential command execution.

### 2. Shell Plugins

Provide shell-like functionality and command processing.

#### plugin-bash-like

Bash-compatible features:
- Filesystem navigation (`cd`, `ls`, `pwd`)
- Pipe operators
- Environment variables
- Process execution
- PTY (pseudo-terminal) support
- WebSocket streaming for remote execution

#### plugin-core-support

Essential utilities:
- `clear` command
- `history` management
- `help` command
- `about` information
- Command commentary and hints

### 3. CLI Integration Plugins

Enhance specific command-line tools with graphical output.

#### plugin-kubectl

The flagship plugin for Kubernetes:

**Features:**
- Enhanced resource tables with sorting/filtering
- Drilldown navigation (click to view details)
- Live updates and watches
- YAML/JSON editing with validation
- Pod log streaming with syntax highlighting
- Resource creation wizards
- Multi-cluster support
- Event correlation

**Sub-packages:**
- `components/`: Reusable K8s UI components
- `helm/`: Helm chart support
- `oc/`: OpenShift CLI integration
- `odo/`: OpenShift Do support
- `krew/`: Kubectl plugin manager
- `logs/`: Enhanced log viewing
- `heuristics/`: Smart defaults
- `view-utilization/`: Resource usage metrics

#### plugin-kubectl-core

Core Kubernetes functionality used by other plugins.

#### plugin-kubectl-tray-menu

System tray integration for quick access.

#### plugin-git

Git command enhancements:
- Branch visualization
- Current branch widget
- Repository status

#### plugin-s3

S3 storage integration:
- Bucket browsing
- Object management
- Multiple provider support (AWS, IBM Cloud)

### 4. UI and Theme Plugins

Control visual appearance and styling.

#### plugin-core-themes

Base themes:
- Light theme
- Dark theme
- High contrast options

#### plugin-carbon-themes

IBM Carbon Design System themes.

#### plugin-patternfly4-themes

Red Hat PatternFly design themes.

**Theme capabilities:**
- Color schemes
- Font choices
- Spacing and layout
- Component styling

### 5. Platform Plugins

Platform-specific integrations.

#### plugin-electron-components

Electron-only features:
- Native window controls
- Screenshot functionality
- Update checker
- Global search (Cmd+F)
- Native menus

#### plugin-proxy-support

Client-server architecture support:
- Offline indicator
- Connection management
- Remote command execution
- WebSocket communication

### 6. Advanced Features

#### plugin-madwizard

Guidebook and tutorial system:
- Interactive walkthroughs
- Step-by-step guides
- Progress tracking
- Conditional flows

**Sub-packages:**
- `components/`: UI for guides
- `do/`: Guide execution engine
- `watch/`: Progress monitoring

#### plugin-iter8

Iter8 experimentation platform integration for A/B testing and canary deployments.

## Creating a Custom Plugin

### Step 1: Plugin Scaffold

```typescript
// src/preload.ts
import { Registrar } from '@kui-shell/core'

export default async (registrar: Registrar) => {
  // Registration code here
}
```

### Step 2: Register Commands

```typescript
import { Arguments, Registrar } from '@kui-shell/core'

export default async (registrar: Registrar) => {
  registrar.listen(
    '/mycommand',
    async (args: Arguments) => {
      const { command, argvNoOptions, parsedOptions } = args

      // Command implementation
      return {
        content: 'Hello from my plugin!',
        contentType: 'text/plain'
      }
    },
    {
      usage: {
        command: 'mycommand',
        docs: 'Description of what this command does',
        optional: [
          { name: '--flag', docs: 'Optional flag description' }
        ]
      }
    }
  )
}
```

### Step 3: Return Rich Responses

#### Table Response

```typescript
return {
  header: {
    name: 'Name',
    attributes: [
      { key: 'status', value: 'Status' },
      { key: 'age', value: 'Age' }
    ]
  },
  body: [
    {
      name: 'item-1',
      attributes: [
        { key: 'status', value: 'Running' },
        { key: 'age', value: '5d' }
      ]
    }
  ]
}
```

#### Multi-Modal Response

```typescript
return {
  apiVersion: 'kui-shell/v1',
  kind: 'NavResponse',
  menus: [
    {
      label: 'Summary',
      content: summaryHTML
    },
    {
      label: 'Details',
      content: detailsTable
    }
  ]
}
```

### Step 4: Add Modes to Existing Responses

Modes add tabs to resource views:

```typescript
import { ModeRegistration } from '@kui-shell/core'

const myMode: ModeRegistration = {
  when: (resource) => resource.kind === 'Pod',
  mode: {
    mode: 'metrics',
    label: 'Metrics',
    content: async (resource) => {
      const metrics = await fetchMetrics(resource)
      return renderMetricsChart(metrics)
    }
  }
}

registrar.registerMode(myMode)
```

### Step 5: Add UI Widgets

```typescript
import { TextWithIconWidget } from '@kui-shell/plugin-client-common'

registrar.registerWidget({
  when: () => true,
  mode: {
    mode: 'my-widget',
    label: 'Status',
    content: () => new TextWithIconWidget('✓', 'All systems operational')
  }
})
```

## Plugin Communication

### Event System

Plugins can communicate via events:

```typescript
import { eventBus } from '@kui-shell/core'

// Emit event
eventBus.emit('/my/event', { data: 'value' })

// Listen for event
eventBus.on('/my/event', (data) => {
  console.log('Received:', data)
})
```

### Shared State

Use the Tab object for shared state:

```typescript
import { Tab } from '@kui-shell/core'

// Store data
tab.state.capture = { myData: 'value' }

// Retrieve data
const data = tab.state.capture.myData
```

## Plugin Dependencies

Plugins can depend on other plugins:

```json
{
  "name": "@kui-shell/plugin-my-plugin",
  "dependencies": {
    "@kui-shell/core": "file:../../packages/core",
    "@kui-shell/plugin-kubectl": "file:../plugin-kubectl"
  }
}
```

Import functionality:

```typescript
import { getCommandFromArgs } from '@kui-shell/plugin-kubectl'
```

## Plugin Best Practices

### 1. Naming Conventions

- Package: `@kui-shell/plugin-name`
- Directory: `plugin-name`
- Commands: Use verb prefixes (`get`, `list`, `create`, `delete`)

### 2. Command Design

- Keep commands focused and single-purpose
- Provide clear usage documentation
- Support common flags (`--help`, `--output`)
- Return appropriate response types

### 3. UI Components

- Use existing components from `@kui-shell/react`
- Follow theme guidelines
- Support both light and dark themes
- Ensure responsive layouts

### 4. Performance

- Lazy load heavy dependencies
- Use streaming for large datasets
- Cache expensive computations
- Debounce frequent updates

### 5. Error Handling

```typescript
import { UsageError } from '@kui-shell/core'

if (!validInput) {
  throw new UsageError({ message: 'Invalid input provided' })
}
```

### 6. Testing

Write tests for:
- Command parsing
- Response formatting
- Error conditions
- UI rendering

```typescript
describe('mycommand', () => {
  it('should return expected output', async () => {
    const res = await CLI.command('mycommand', this.app)
    expect(res).toMatchSnapshot()
  })
})
```

## Advanced Plugin Patterns

### Command Interception

Modify behavior of existing commands:

```typescript
const originalExec = registrar.find('/kubectl/get')

registrar.override('/kubectl/get', async (args) => {
  const result = await originalExec(args)
  return enhanceResult(result)
})
```

### Custom Response Renderers

Register renderer for custom content types:

```typescript
registrar.registerRenderer({
  when: (response) => response.contentType === 'my-type',
  render: (response, tab) => {
    return <MyCustomComponent data={response.content} />
  }
})
```

### Badge Providers

Add status indicators to resources:

```typescript
import { BadgeRegistration } from '@kui-shell/core'

const myBadge: BadgeRegistration = {
  when: (resource) => resource.metadata.labels?.app === 'myapp',
  badge: () => ({
    title: 'Custom App',
    css: 'green-background'
  })
}

registrar.registerBadge(myBadge)
```

## Distribution

### Template Repository

Start from the official template: https://github.com/kui-shell/KuiClientTemplate

### Custom Builds

1. Fork the template or Kui repository
2. Modify `package.json` to include your plugins
3. Customize themes and icons
4. Build with `npm run build:electron:[platform]:[arch]`
5. Distribute the resulting application

### Plugin Registry

Plugins can be published to npm and installed via:

```bash
npm install @your-org/kui-plugin-name
```

Then added to your Kui client's dependencies.

## Plugin Examples

### Simple Text Command

```typescript
registrar.listen('/hello', async ({ argvNoOptions }) => {
  const name = argvNoOptions[1] || 'World'
  return `Hello, ${name}!`
})
```

### Data Fetching Command

```typescript
registrar.listen('/users/list', async () => {
  const users = await fetchUsers()

  return {
    header: { name: 'Username', attributes: [{ key: 'email', value: 'Email' }] },
    body: users.map(user => ({
      name: user.username,
      attributes: [{ key: 'email', value: user.email }]
    }))
  }
})
```

### Interactive Command

```typescript
registrar.listen('/deploy', async ({ REPL }) => {
  const confirmed = await REPL.qexec('confirm "Deploy to production?"')

  if (confirmed) {
    return await performDeployment()
  } else {
    return 'Deployment cancelled'
  }
})
```

## Resources

- [Core API Documentation](docs/api/README.md)
- [Template Repository](https://github.com/kui-shell/KuiClientTemplate)
- [Plugin Examples](plugins/)
- [Contributing Guide](CONTRIBUTING.md)

## Getting Help

- GitHub Issues: https://github.com/IBM/kui/issues
- Discussions: Use GitHub Discussions for questions
- Examples: Study existing plugins in `plugins/` directory

The plugin system is designed to be flexible and powerful. Whether enhancing Kubernetes workflows, integrating new CLIs, or building custom developer tools, Kui's architecture supports diverse use cases.
