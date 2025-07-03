# Todo Application Integration Example

This example demonstrates how a simple Todo application can integrate with the AIPort protocol, allowing AI systems to interact with it.

## Application Manifest

First, the Todo application defines its manifest:

```json
{
  "protocol": "aiport",
  "version": "0.1.0",
  "application": {
    "id": "com.example.todoapp",
    "name": "Todo Application",
    "version": "1.0.0",
    "publisher": "Example Corp",
    "website": "https://example.com/todoapp",
    "description": "A simple todo list application"
  },
  "capabilities": [
    {
      "id": "getTodos",
      "name": "Get Todo Items",
      "description": "Retrieves todo items based on filters",
      "parameters": {
        "type": "object",
        "properties": {
          "status": {
            "type": "string",
            "enum": ["all", "active", "completed"],
            "default": "all",
            "description": "Filter todos by completion status"
          },
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100,
            "default": 20,
            "description": "Maximum number of todo items to return"
          }
        }
      },
      "returns": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "id": { "type": "string" },
            "title": { "type": "string" },
            "completed": { "type": "boolean" },
            "dueDate": { "type": "string", "format": "date-time" }
          }
        }
      },
      "permissions": ["read:todos"]
    },
    {
      "id": "addTodo",
      "name": "Add Todo Item",
      "description": "Creates a new todo item",
      "parameters": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string",
            "description": "Title of the todo item",
            "required": true
          },
          "dueDate": {
            "type": "string",
            "format": "date-time",
            "description": "Due date for the task",
            "required": false
          }
        }
      },
      "returns": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "success": { "type": "boolean" }
        }
      },
      "permissions": ["write:todos"]
    },
    {
      "id": "updateTodo",
      "name": "Update Todo Item",
      "description": "Updates an existing todo item",
      "parameters": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "ID of the todo item to update",
            "required": true
          },
          "title": {
            "type": "string",
            "description": "New title for the todo item"
          },
          "completed": {
            "type": "boolean",
            "description": "Whether the todo item is completed"
          },
          "dueDate": {
            "type": "string",
            "format": "date-time",
            "description": "Updated due date for the task"
          }
        }
      },
      "returns": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" }
        }
      },
      "permissions": ["write:todos"]
    },
    {
      "id": "deleteTodo",
      "name": "Delete Todo Item",
      "description": "Deletes a todo item",
      "parameters": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "ID of the todo item to delete",
            "required": true
          }
        }
      },
      "returns": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" }
        }
      },
      "permissions": ["write:todos"]
    }
  ],
  "authentication": {
    "required": true,
    "methods": ["oauth2"]
  },
  "permissions": [
    {
      "id": "read:todos",
      "name": "Read Todo Items",
      "description": "Access to read the user's todo items"
    },
    {
      "id": "write:todos",
      "name": "Modify Todo Items",
      "description": "Access to create, update, or delete the user's todo items"
    }
  ]
}
```

## Integration Walkthrough

### 1. Discovery

An AI assistant discovers the Todo application through:

```
GET /aiport/manifest
```

The Todo application returns its manifest as defined above.

### 2. Authentication

The AI assistant initiates OAuth 2.0 authentication:

```
GET /aiport/auth?response_type=code&client_id=ai_assistant&redirect_uri=https://ai.example.com/callback&scope=read:todos,write:todos
```

The user grants permission, and the AI assistant obtains an access token.

### 3. Session Creation

The AI assistant creates a session:

```json
POST /aiport/sessions
{
  "client_id": "ai_assistant",
  "access_token": "oauth2_token_xyz"
}
```

The Todo application responds:

```json
{
  "success": true,
  "data": {
    "session_id": "session_abc123",
    "expires_at": "2023-11-15T14:30:00Z"
  }
}
```

### 4. Capability Invocation

#### Getting Todo Items

The AI assistant retrieves the user's active tasks:

```json
POST /aiport/invoke
{
  "session": "session_abc123",
  "capability": "getTodos",
  "parameters": {
    "status": "active",
    "limit": 5
  }
}
```

The Todo application responds:

```json
{
  "success": true,
  "data": [
    {
      "id": "todo1",
      "title": "Prepare presentation",
      "completed": false,
      "dueDate": "2023-11-15T09:00:00Z"
    },
    {
      "id": "todo2",
      "title": "Book flight tickets",
      "completed": false,
      "dueDate": "2023-11-12T18:00:00Z"
    }
  ]
}
```

#### Adding a Todo Item

The AI assistant creates a new todo based on user request:

```json
POST /aiport/invoke
{
  "session": "session_abc123",
  "capability": "addTodo",
  "parameters": {
    "title": "Schedule team meeting",
    "dueDate": "2023-11-16T10:00:00Z"
  }
}
```

The Todo application responds:

```json
{
  "success": true,
  "data": {
    "id": "todo3",
    "success": true
  }
}
```

#### Updating a Todo Item

The user asks the AI assistant to mark a task as completed:

```json
POST /aiport/invoke
{
  "session": "session_abc123",
  "capability": "updateTodo",
  "parameters": {
    "id": "todo2",
    "completed": true
  }
}
```

The Todo application responds:

```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

### 5. Event Handling

The Todo application sends an event when a todo's due date is approaching:

```json
POST /aiport/events
{
  "session": "session_abc123",
  "event": "todo.dueDate.approaching",
  "data": {
    "id": "todo1",
    "title": "Prepare presentation",
    "dueIn": 86400
  },
  "timestamp": "2023-11-14T09:00:00Z"
}
```

The AI assistant can process this event and notify the user.

## Implementation in TypeScript

### Application Side

```typescript
import express from 'express';
import { AIPort } from '@aiport/sdk';

// Create Express app
const app = express();
app.use(express.json());

// Create AIPort instance
const todoApp = new AIPort.Application({
  id: 'com.example.todoapp',
  name: 'Todo Application',
  version: '1.0.0',
  // ... other manifest properties
});

// Implement capabilities
todoApp.implement('getTodos', async (params, context) => {
  const { status, limit } = params;
  // Retrieve todos from database based on parameters
  const todos = await database.getTodos(context.user.id, status, limit);
  return todos;
});

todoApp.implement('addTodo', async (params, context) => {
  const { title, dueDate } = params;
  // Add todo to database
  const todoId = await database.addTodo(context.user.id, title, dueDate);
  return { id: todoId, success: true };
});

// ... implement other capabilities

// Initialize AIPort middleware
app.use('/aiport', todoApp.createExpressMiddleware());

// Start server
app.listen(3000, () => {
  console.log('Todo application running on port 3000');
});
```

### AI Assistant Side

```typescript
import { AIPort } from '@aiport/sdk';

async function assistUser() {
  // Connect to the Todo application
  const todoApp = await AIPort.connect('com.example.todoapp', {
    endpoint: 'https://example.com/aiport',
    auth: {
      type: 'oauth2',
      clientId: 'ai_assistant',
      // ... other OAuth2 parameters
    }
  });

  // Get user's tasks
  const todos = await todoApp.call('getTodos', { status: 'active' });
  console.log('User has', todos.length, 'active tasks');

  // Create a new task based on conversation
  const result = await todoApp.call('addTodo', {
    title: 'Schedule quarterly review',
    dueDate: '2023-11-20T15:00:00Z'
  });

  if (result.success) {
    console.log('Created new task with ID:', result.id);
  }

  // Listen for events
  todoApp.on('todo.dueDate.approaching', (event) => {
    console.log(`Task "${event.data.title}" is due soon!`);
    // Notify user about upcoming deadline
  });
}

assistUser().catch(console.error);
```

## Security Best Practices

1. **Validate All Inputs**: Thoroughly validate all incoming parameters against schemas.
2. **Scope Permissions**: Request only the permissions needed for the specific task.
3. **Token Handling**: Store tokens securely and refresh when needed.
4. **Revocation**: Provide mechanisms to revoke access when needed.
5. **User Consent**: Always obtain explicit user consent before accessing sensitive functionality. 