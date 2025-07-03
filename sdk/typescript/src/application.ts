import { Request, Response, NextFunction } from 'express';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {
  ApplicationOptions,
  Capability,
  CapabilityHandler,
  ApplicationManifest,
  AIPortError,
  InvokeRequest,
  SessionInfo
} from './types';

const PROTOCOL_VERSION = '0.1.0';

/**
 * AIPort application implementation
 */
export class Application {
  private capabilities: Map<string, Capability> = new Map();
  private handlers: Map<string, CapabilityHandler> = new Map();
  private sessions: Map<string, Record<string, any>> = new Map();
  private ajv: Ajv;
  private manifest: ApplicationManifest;
  
  /**
   * Create a new AIPort application
   * @param options Application configuration options
   */
  constructor(private options: ApplicationOptions) {
    // Initialize JSON Schema validator
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
    
    // Register capabilities
    options.capabilities.forEach(capability => {
      this.capabilities.set(capability.id, capability);
    });
    
    // Build the application manifest
    this.manifest = {
      protocol: 'aiport',
      version: PROTOCOL_VERSION,
      application: {
        id: options.id,
        name: options.name,
        version: options.version,
        publisher: options.publisher,
        website: options.website,
        description: options.description
      },
      capabilities: options.capabilities,
      authentication: {
        required: true,
        methods: ['oauth2', 'api_key']
      },
      permissions: []
    };
    
    // Extract permissions from capabilities
    const uniquePermissions = new Set<string>();
    options.capabilities.forEach(capability => {
      capability.permissions.forEach(permission => {
        uniquePermissions.add(permission);
      });
    });
    
    // Add permissions to manifest
    this.manifest.permissions = Array.from(uniquePermissions).map(id => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1).replace(':', ' '),
      description: `Permission to ${id.replace(':', ' ')}`
    }));
  }
  
  /**
   * Implement a capability handler
   * @param capabilityId The ID of the capability to implement
   * @param handler The handler function for the capability
   */
  implement<P = any, R = any>(capabilityId: string, handler: CapabilityHandler<P, R>): this {
    if (!this.capabilities.has(capabilityId)) {
      throw new Error(`Unknown capability: ${capabilityId}`);
    }
    
    this.handlers.set(capabilityId, handler as CapabilityHandler);
    return this;
  }
  
  /**
   * Create Express middleware for the AIPort application
   */
  createExpressMiddleware() {
    return {
      // Handle manifest requests
      getManifest: (_req: Request, res: Response) => {
        res.json(this.manifest);
      },
      
      // Handle session creation
      createSession: (req: Request, res: Response) => {
        try {
          // In a real implementation, validate auth tokens here
          const clientId = req.body.client_id;
          const accessToken = req.body.access_token;
          
          if (!clientId) {
            return res.status(400).json({
              success: false,
              data: null,
              error: {
                code: 'missing_client_id',
                message: 'Client ID is required'
              }
            });
          }
          
          // Create a session
          const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
          const expires = new Date();
          expires.setHours(expires.getHours() + 24); // 24-hour session
          
          this.sessions.set(sessionId, {
            clientId,
            accessToken,
            userId: 'user-123', // In a real implementation, get from the auth token
            created: new Date(),
            expires
          });
          
          const sessionInfo: SessionInfo = {
            session_id: sessionId,
            expires_at: expires.toISOString()
          };
          
          return res.json({
            success: true,
            data: sessionInfo,
            error: null
          });
        } catch (error) {
          console.error('Session creation error:', error);
          return res.status(500).json({
            success: false,
            data: null,
            error: {
              code: 'session_creation_failed',
              message: 'Failed to create session'
            }
          });
        }
      },
      
      // Handle session deletion
      deleteSession: (req: Request, res: Response) => {
        const sessionId = req.params.sessionId;
        
        if (this.sessions.has(sessionId)) {
          this.sessions.delete(sessionId);
        }
        
        return res.json({
          success: true,
          data: { success: true },
          error: null
        });
      },
      
      // Handle capability invocation
      invoke: async (req: Request, res: Response) => {
        try {
          const request = req.body as InvokeRequest;
          
          // Validate session
          if (!request.session || !this.sessions.has(request.session)) {
            return res.status(401).json({
              success: false,
              data: null,
              error: {
                code: 'invalid_session',
                message: 'Invalid or expired session'
              }
            });
          }
          
          // Get session data
          const session = this.sessions.get(request.session)!;
          
          // Check if capability exists
          if (!request.capability || !this.capabilities.has(request.capability)) {
            return res.status(400).json({
              success: false,
              data: null,
              error: {
                code: 'unknown_capability',
                message: `Unknown capability: ${request.capability}`
              }
            });
          }
          
          // Get capability and handler
          const capability = this.capabilities.get(request.capability)!;
          const handler = this.handlers.get(request.capability);
          
          if (!handler) {
            return res.status(501).json({
              success: false,
              data: null,
              error: {
                code: 'not_implemented',
                message: `The capability '${request.capability}' is not implemented`
              }
            });
          }
          
          // Validate parameters
          const validate = this.ajv.compile(capability.parameters);
          if (!validate(request.parameters)) {
            return res.status(400).json({
              success: false,
              data: null,
              error: {
                code: 'invalid_parameters',
                message: 'Invalid parameters',
                details: { errors: validate.errors }
              }
            });
          }
          
          // Check permissions (in a real implementation, check against user permissions)
          
          // Create context
          const context = {
            user: {
              id: session.userId
            },
            session: {
              id: request.session
            },
            ...request.context
          };
          
          // Invoke the handler
          const result = await handler(request.parameters, context);
          
          // Validate response
          const responseValidate = this.ajv.compile(capability.returns);
          if (!responseValidate(result)) {
            console.error('Invalid handler response:', responseValidate.errors);
            return res.status(500).json({
              success: false,
              data: null,
              error: {
                code: 'invalid_response',
                message: 'The handler returned an invalid response'
              }
            });
          }
          
          return res.json({
            success: true,
            data: result,
            error: null
          });
        } catch (error: any) {
          console.error('Invoke error:', error);
          
          if (error instanceof AIPortError) {
            return res.status(400).json({
              success: false,
              data: null,
              error: {
                code: error.code,
                message: error.message,
                details: error.details
              }
            });
          }
          
          return res.status(500).json({
            success: false,
            data: null,
            error: {
              code: 'internal_error',
              message: error.message || 'An internal error occurred'
            }
          });
        }
      },
      
      // Express router middleware function
      router: (req: Request, res: Response, next: NextFunction) => {
        const path = req.path;
        const method = req.method.toLowerCase();
        
        if (path === '/manifest' && method === 'get') {
          return this.createExpressMiddleware().getManifest(req, res);
        }
        
        if (path === '/sessions' && method === 'post') {
          return this.createExpressMiddleware().createSession(req, res);
        }
        
        if (path.startsWith('/sessions/') && method === 'delete') {
          req.params.sessionId = path.substring('/sessions/'.length);
          return this.createExpressMiddleware().deleteSession(req, res);
        }
        
        if (path === '/invoke' && method === 'post') {
          return this.createExpressMiddleware().invoke(req, res);
        }
        
        // Not found
        next();
      }
    };
  }
  
  /**
   * Get the application manifest
   */
  getManifest(): ApplicationManifest {
    return this.manifest;
  }
  
  /**
   * Listen for AIPort requests
   * @param port Port to listen on
   */
  async listen(port?: number): Promise<void> {
    if (!port) {
      console.log('AIPort application initialized in middleware mode');
      return;
    }
    
    try {
      const express = await import('express');
      const app = express.default();
      
      app.use(express.json());
      app.use('/aiport', this.createExpressMiddleware().router);
      
      app.listen(port, () => {
        console.log(`AIPort application listening on port ${port}`);
      });
    } catch (error) {
      console.error('Failed to start standalone server:', error);
      throw new Error('Failed to start standalone server. Make sure express is installed.');
    }
  }
} 