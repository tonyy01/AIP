# AIPort: AI-Native Application Protocol

AIPort is an open-source protocol that enables standardized communication between AI systems (agents, assistants, large language models) and applications across platforms.

## Vision

As AI systems become more capable, they need standardized ways to interact with applications on behalf of users. AIPort creates a unified protocol for AI systems to discover, understand, and invoke application capabilities while respecting security and permissions.

## Core Features

- **Capability Discovery**: Applications expose their functionality through a standardized manifest
- **Type-Safe Interactions**: Strong typing for parameters and return values
- **Permission Model**: Granular permissions for AI system access to application capabilities
- **Callbacks & Events**: Support for asynchronous operations and event handling
- **Cross-Platform**: Works across web, desktop, and mobile environments
- **Extensible**: Plugin architecture for custom protocol extensions

## Project Structure

```
AIPort/
├── docs/                    # Protocol documentation
│   ├── protocol.md          # Core protocol specification
│   ├── examples/            # Example use cases and implementations
│   └── api/                 # API reference
├── sdk/                     # SDKs for different languages
│   ├── typescript/          # TypeScript SDK
│   ├── python/              # Python SDK (future)
│   └── go/                  # Go SDK (future)
├── demos/                   # Demo applications
│   ├── todo-app/            # Todo list application demo
│   └── smart-home/          # Smart home control demo (future)
└── tools/                   # Developer tools and utilities
    └── validator/           # Protocol validator
```

## Getting Started

### For Application Developers

To make your application AI-native:

```typescript
import { AIPort } from '@aiport/sdk';

// Define your application capabilities
const todoApp = new AIPort.Application({
  name: 'TodoApp',
  version: '1.0.0',
  capabilities: [
    {
      id: 'addTodo',
      name: 'Add Todo Item',
      description: 'Creates a new todo item in the list',
      parameters: {
        title: { type: 'string', required: true, description: 'Title of todo item' },
        dueDate: { type: 'string', format: 'date', required: false }
      },
      returns: { type: 'object', properties: {
        id: { type: 'string' },
        success: { type: 'boolean' }
      }}
    }
    // Other capabilities...
  ]
});

// Implement capability handlers
todoApp.implement('addTodo', async (params) => {
  const { title, dueDate } = params;
  // Actual implementation...
  return { id: 'todo-123', success: true };
});

// Start listening for AI requests
todoApp.listen();
```

### For AI System Developers

To connect an AI system to AIPort applications:

```typescript
import { AIPort } from '@aiport/sdk';

// Connect to an application
const todoApp = await AIPort.connect('TodoApp');

// Discover available capabilities
const capabilities = await todoApp.getCapabilities();
console.log(capabilities);

// Call a capability
const result = await todoApp.call('addTodo', { 
  title: 'Prepare presentation',
  dueDate: '2023-12-15'
});
```

## Contributing

AIPort is an open-source project and we welcome contributions. See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

AIPort is released under the MIT License. 