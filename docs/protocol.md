# AIPort Protocol Specification

Version: 0.1.0

## Introduction

AIPort (AI-Native Application Protocol) is a standardized communication protocol enabling AI systems to discover, access, and utilize application capabilities across different platforms. This document defines the core components, data formats, and interaction flows of the protocol.

## Core Concepts

### Applications

An **Application** is any software entity that exposes capabilities to AI systems. Applications can be:
- Web applications
- Desktop applications
- Mobile applications
- Cloud services
- IoT devices
- System functions

### Capabilities

A **Capability** represents a discrete function or service that an application exposes. Each capability:
- Has a unique identifier
- Defines its input parameters and return values
- Specifies required permissions
- May include documentation and usage examples

### Sessions

A **Session** represents an authenticated connection between an AI system and an application. Sessions:
- Establish authentication context
- Maintain state when needed
- Can be short-lived or persistent
- Track permission grants

## Protocol Format

AIPort uses JSON for all protocol messages. The protocol can be transported over:
- HTTP/HTTPS (REST)
- WebSockets
- IPC (Inter-Process Communication)
- Other transport mechanisms as needed

## Manifest Format

Applications expose their capabilities through a manifest. The manifest is a JSON document with the following structure:

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
      "id": "addTodo",
      "name": "Add Todo Item",
      "description": "Creates a new todo item in the list",
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
            "format": "date",
            "description": "Due date for the task",
            "required": false
          },
          "priority": {
            "type": "string",
            "enum": ["low", "medium", "high"],
            "default": "medium",
            "description": "Priority level of the task"
          }
        }
      },
      "returns": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "Unique ID of the created todo item"
          },
          "success": {
            "type": "boolean",
            "description": "Whether the operation was successful"
          }
        }
      },
      "permissions": ["write:todos"],
      "examples": [
        {
          "name": "Basic example",
          "parameters": {
            "title": "Buy groceries"
          },
          "returns": {
            "id": "todo-123",
            "success": true
          }
        }
      ]
    }
  ],
  "authentication": {
    "required": true,
    "methods": ["oauth2", "api_key"]
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

## Request Format

When an AI system calls a capability, it sends a request in the following format:

```json
{
  "session": "session-xyz-123",
  "capability": "addTodo",
  "parameters": {
    "title": "Prepare presentation slides",
    "dueDate": "2023-12-15"
  },
  "context": {
    "locale": "en-US",
    "timezone": "America/Los_Angeles"
  }
}
```

## Response Format

The application responds with:

```json
{
  "success": true,
  "data": {
    "id": "todo-abc-123",
    "success": true
  },
  "error": null
}
```

Or in case of an error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "invalid_parameters",
    "message": "The 'title' parameter is required",
    "details": {
      "parameter": "title"
    }
  }
}
```

## Authentication Flow

AIPort supports multiple authentication methods:

1. **OAuth 2.0**: For user-authenticated access
2. **API Keys**: For AI system authentication
3. **JWT**: For secure token-based authentication
4. **Session Cookies**: For web applications

The specific authentication flow depends on the selected method and the application requirements.

## Permission Model

AIPort implements a capability-based permission model:

1. Each capability declares required permissions
2. AI systems request permissions from users
3. Users grant or deny permission requests
4. Applications verify permissions before executing capabilities

## Callback Mechanism

For long-running operations, AIPort supports callbacks:

1. The application returns a callback token in the response
2. The AI system can poll for updates using the token
3. The application can push updates when the operation completes

```json
{
  "success": true,
  "data": {
    "callbackToken": "cb-token-123",
    "estimatedCompletionTime": 120
  }
}
```

## Events

Applications can send events to AI systems:

```json
{
  "event": "todo.created",
  "data": {
    "id": "todo-123",
    "title": "Buy groceries"
  },
  "timestamp": "2023-11-10T15:30:00Z"
}
```

## Security Considerations

1. **Transport Security**: All communication should use TLS/SSL
2. **Authentication**: Validate identities of AI systems and applications
3. **Authorization**: Enforce permission model
4. **Input Validation**: Validate all parameters against schemas
5. **Rate Limiting**: Prevent abuse through rate limiting
6. **Audit Logging**: Log all capability invocations

## Versioning

AIPort uses semantic versioning for both the protocol and individual applications. Version compatibility is negotiated during connection establishment.

## Extensions

The protocol can be extended through standard extensions. Extensions follow the format:

```json
{
  "extensions": [
    {
      "id": "com.example.realtime",
      "name": "Real-time Collaboration Extension",
      "version": "1.0.0",
      "capabilities": [
        // Extension-specific capabilities
      ]
    }
  ]
}
```

## Future Considerations

1. **Multi-Agent Collaboration**: Support for multiple AI agents working together
2. **Cross-Application Workflows**: Orchestration of capabilities across applications
3. **Federated Discovery**: Finding applications and capabilities across networks
4. **Privacy Controls**: Advanced data sharing and privacy mechanisms 