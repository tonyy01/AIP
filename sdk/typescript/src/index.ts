/**
 * AIPort Protocol TypeScript SDK
 */

import { Application } from './application';
import { AIPortClient } from './client';
import { AIPortError } from './types';

// Export types
export * from './types';

// Namespace for AIPort
export const AIPort = {
  /**
   * Create a new AIPort application
   */
  Application,

  /**
   * Connect to an AIPort application
   * @param appId Application ID to connect to
   * @param options Connection options
   */
  async connect(appId: string, options: any): Promise<AIPortClient> {
    const client = new AIPortClient(appId, options);
    await client.initialize();
    return client;
  },

  /**
   * Error class for AIPort errors
   */
  Error: AIPortError
};

// Default export
export default AIPort; 