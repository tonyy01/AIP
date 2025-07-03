import { AIPort } from '@aiport/sdk';

/**
 * This is a simple demonstration of how an AI assistant would
 * use the AIPort protocol to interact with the Todo application.
 */
async function main() {
  try {
    console.log('AI Assistant Demo - Todo App Integration');
    console.log('---------------------------------------');
    
    // Connect to the Todo application
    console.log('Connecting to Todo application...');
    const todoApp = await AIPort.connect('com.example.todoapp', {
      endpoint: 'http://localhost:3000/aiport'
    });
    
    // Create a session
    console.log('Creating session...');
    await todoApp.createSession();
    
    // Get capabilities
    console.log('\nDiscovering application capabilities:');
    const capabilities = todoApp.getCapabilities();
    capabilities.forEach(cap => {
      console.log(`- ${cap.name}: ${cap.description}`);
    });
    
    // Get current todos
    console.log('\nRetrieving current todos:');
    const todos = await todoApp.call('getTodos', { status: 'all', limit: 10 });
    console.log('Current todos:');
    todos.forEach((todo: any) => {
      console.log(`[${todo.completed ? 'x' : ' '}] ${todo.title}${todo.dueDate ? ` (due: ${new Date(todo.dueDate).toLocaleDateString()})` : ''}`);
    });
    
    // Add a new todo based on "user request"
    console.log('\nUser says: "Add a task to review the AIPort documentation"');
    console.log('Adding new todo...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const result = await todoApp.call('addTodo', {
      title: 'Review AIPort documentation',
      dueDate: tomorrow.toISOString()
    });
    
    console.log(`Todo added with ID: ${result.id}`);
    
    // Get updated list
    console.log('\nRetrieving updated todo list:');
    const updatedTodos = await todoApp.call('getTodos', { status: 'all', limit: 10 });
    console.log('Updated todos:');
    updatedTodos.forEach((todo: any) => {
      console.log(`[${todo.completed ? 'x' : ' '}] ${todo.title}${todo.dueDate ? ` (due: ${new Date(todo.dueDate).toLocaleDateString()})` : ''}`);
    });
    
    // Mark a todo as completed
    console.log('\nUser says: "Mark the task about learning AIPort protocol as completed"');
    console.log('Finding and updating todo...');
    
    const learnTodo = updatedTodos.find((todo: any) => todo.title.includes('AIPort protocol'));
    
    if (learnTodo) {
      await todoApp.call('updateTodo', {
        id: learnTodo.id,
        completed: true
      });
      console.log(`Marked "${learnTodo.title}" as completed`);
    } else {
      console.log('Could not find the requested todo');
    }
    
    // Get final list
    console.log('\nFinal todo list:');
    const finalTodos = await todoApp.call('getTodos', { status: 'all', limit: 10 });
    finalTodos.forEach((todo: any) => {
      console.log(`[${todo.completed ? 'x' : ' '}] ${todo.title}${todo.dueDate ? ` (due: ${new Date(todo.dueDate).toLocaleDateString()})` : ''}`);
    });
    
    // End the session
    console.log('\nEnding session...');
    await todoApp.endSession();
    
    console.log('\nDemo completed successfully!');
    
  } catch (error) {
    console.error('Error in AI Assistant Demo:', error);
  }
}

main(); 