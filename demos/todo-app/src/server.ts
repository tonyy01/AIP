import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { AIPort } from '@aiport/sdk';

// Simple in-memory todo storage
interface Todo {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  userId: string;
}

// Map of user IDs to their todo lists
const todos: Map<string, Todo[]> = new Map();

// Helper function to get todos for a user
function getUserTodos(userId: string): Todo[] {
  if (!todos.has(userId)) {
    todos.set(userId, []);
  }
  return todos.get(userId)!;
}

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create AIPort application
const todoApp = new AIPort.Application({
  id: 'com.example.todoapp',
  name: 'Todo Application',
  version: '1.0.0',
  description: 'A simple todo list application demonstrating the AIPort protocol',
  capabilities: [
    {
      id: 'getTodos',
      name: 'Get Todo Items',
      description: 'Retrieves todo items based on filters',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['all', 'active', 'completed'],
            default: 'all',
            description: 'Filter todos by completion status'
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20,
            description: 'Maximum number of todo items to return'
          }
        }
      },
      returns: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            completed: { type: 'boolean' },
            dueDate: { type: 'string', format: 'date-time' }
          }
        }
      },
      permissions: ['read:todos']
    },
    {
      id: 'addTodo',
      name: 'Add Todo Item',
      description: 'Creates a new todo item',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Title of the todo item',
            required: true
          },
          dueDate: {
            type: 'string',
            format: 'date-time',
            description: 'Due date for the task',
            required: false
          }
        }
      },
      returns: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          success: { type: 'boolean' }
        }
      },
      permissions: ['write:todos']
    },
    {
      id: 'updateTodo',
      name: 'Update Todo Item',
      description: 'Updates an existing todo item',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'ID of the todo item to update',
            required: true
          },
          title: {
            type: 'string',
            description: 'New title for the todo item'
          },
          completed: {
            type: 'boolean',
            description: 'Whether the todo item is completed'
          },
          dueDate: {
            type: 'string',
            format: 'date-time',
            description: 'Updated due date for the task'
          }
        }
      },
      returns: {
        type: 'object',
        properties: {
          success: { type: 'boolean' }
        }
      },
      permissions: ['write:todos']
    },
    {
      id: 'deleteTodo',
      name: 'Delete Todo Item',
      description: 'Deletes a todo item',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'ID of the todo item to delete',
            required: true
          }
        }
      },
      returns: {
        type: 'object',
        properties: {
          success: { type: 'boolean' }
        }
      },
      permissions: ['write:todos']
    }
  ]
});

// Implement capabilities
todoApp.implement('getTodos', async (params, context) => {
  const { status, limit } = params;
  const userTodos = getUserTodos(context.user.id);
  
  // Filter todos based on status
  let filteredTodos = userTodos;
  if (status === 'active') {
    filteredTodos = userTodos.filter(todo => !todo.completed);
  } else if (status === 'completed') {
    filteredTodos = userTodos.filter(todo => todo.completed);
  }
  
  // Apply limit
  return filteredTodos.slice(0, limit).map(({ userId, ...todo }) => todo);
});

todoApp.implement('addTodo', async (params, context) => {
  const { title, dueDate } = params;
  const userId = context.user.id;
  const userTodos = getUserTodos(userId);
  
  const todo: Todo = {
    id: uuidv4(),
    title,
    completed: false,
    userId,
    ...(dueDate ? { dueDate } : {})
  };
  
  userTodos.push(todo);
  
  return { id: todo.id, success: true };
});

todoApp.implement('updateTodo', async (params, context) => {
  const { id, title, completed, dueDate } = params;
  const userId = context.user.id;
  const userTodos = getUserTodos(userId);
  
  const todoIndex = userTodos.findIndex(todo => todo.id === id);
  if (todoIndex === -1) {
    throw new AIPort.Error(
      'todo_not_found',
      `Todo item with ID ${id} not found`,
      { id }
    );
  }
  
  const todo = userTodos[todoIndex];
  
  // Update fields if provided
  if (title !== undefined) todo.title = title;
  if (completed !== undefined) todo.completed = completed;
  if (dueDate !== undefined) todo.dueDate = dueDate;
  
  return { success: true };
});

todoApp.implement('deleteTodo', async (params, context) => {
  const { id } = params;
  const userId = context.user.id;
  const userTodos = getUserTodos(userId);
  
  const todoIndex = userTodos.findIndex(todo => todo.id === id);
  if (todoIndex === -1) {
    throw new AIPort.Error(
      'todo_not_found',
      `Todo item with ID ${id} not found`,
      { id }
    );
  }
  
  userTodos.splice(todoIndex, 1);
  
  return { success: true };
});

// Add some sample todos
const demoUserId = 'user-123';
todos.set(demoUserId, [
  {
    id: uuidv4(),
    title: 'Learn about AIPort protocol',
    completed: true,
    userId: demoUserId
  },
  {
    id: uuidv4(),
    title: 'Build a demo application',
    completed: false,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    userId: demoUserId
  },
  {
    id: uuidv4(),
    title: 'Integrate with an AI assistant',
    completed: false,
    dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    userId: demoUserId
  }
]);

// Mount AIPort middleware
app.use('/aiport', todoApp.createExpressMiddleware().router);

// Regular REST API endpoints (for non-AIPort clients)
app.get('/api/todos', (req, res) => {
  const demoTodos = getUserTodos(demoUserId);
  res.json(demoTodos.map(({ userId, ...todo }) => todo));
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Todo application server running on port ${port}`);
  console.log(`AIPort protocol available at http://localhost:${port}/aiport`);
}); 