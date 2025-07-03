import axios, { AxiosInstance } from 'axios';
import EventEmitter from 'eventemitter3';
import {
  ApplicationManifest,
  Capability,
  ConnectionOptions,
  Response,
  SessionInfo,
  InvokeRequest,
  AIPortError
} from './types';

/**
 * AIPort client for connecting to and interacting with AIPort-enabled applications
 */
export class AIPortClient extends EventEmitter {
  private axios: AxiosInstance;
  private manifest?: ApplicationManifest;
  private sessionId?: string;
  private capabilities: Map<string, Capability> = new Map();
  private eventSource?: EventSource;
  
  /**
   * Create a new AIPortClient
   * @param appId The application ID to connect to
   * @param options Connection options
   */
  constructor(private appId: string, private options: ConnectionOptions) {
    super();
    
    this.axios = axios.create({
      baseURL: options.endpoint,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // Configure authentication if provided
    if (options.auth) {
      switch (options.auth.type) {
        case 'oauth2':
          // OAuth2 will be handled during session creation
          break;
        case 'api_key':
          const headerName = options.auth.headerName || 'X-API-Key';
          this.axios.defaults.headers.common[headerName] = options.auth.key;
          break;
        case 'jwt':
          this.axios.defaults.headers.common['Authorization'] = `Bearer ${options.auth.token}`;
          break;
      }
    }
  }
  
  /**
   * Initialize the client connection
   */
  async initialize(): Promise<ApplicationManifest> {
    try {
      // Fetch the application manifest
      const response = await this.axios.get<ApplicationManifest>('/aiport/manifest');
      this.manifest = response.data;
      
      // Store capabilities for easy access
      this.manifest.capabilities.forEach(capability => {
        this.capabilities.set(capability.id, capability);
      });
      
      return this.manifest;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new AIPortError(
          'connection_failed',
          `Failed to connect to AIPort application: ${error.message}`,
          { status: error.response?.status }
        );
      }
      throw new AIPortError('unknown_error', 'An unknown error occurred during connection');
    }
  }
  
  /**
   * Create a new session with the application
   * @param accessToken OAuth access token (if using OAuth)
   */
  async createSession(accessToken?: string): Promise<SessionInfo> {
    if (!this.manifest) {
      throw new AIPortError('not_initialized', 'Client not initialized. Call initialize() first.');
    }
    
    try {
      const payload: Record<string, any> = {
        client_id: this.appId
      };
      
      if (accessToken) {
        payload.access_token = accessToken;
      } else if (this.options.auth?.type === 'oauth2') {
        throw new AIPortError(
          'auth_required',
          'OAuth2 authentication requires an access token'
        );
      }
      
      const response = await this.axios.post<Response<SessionInfo>>('/aiport/sessions', payload);
      
      if (!response.data.success) {
        throw new AIPortError(
          response.data.error.code,
          response.data.error.message,
          response.data.error.details
        );
      }
      
      this.sessionId = response.data.data.session_id;
      
      // Set up event source for server-sent events if available
      this.setupEventSource();
      
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new AIPortError(
          'session_creation_failed',
          `Failed to create session: ${error.message}`,
          { status: error.response?.status }
        );
      }
      if (error instanceof AIPortError) {
        throw error;
      }
      throw new AIPortError('unknown_error', 'An unknown error occurred during session creation');
    }
  }
  
  /**
   * Call a capability on the application
   * @param capabilityId The ID of the capability to call
   * @param parameters The parameters to pass to the capability
   * @param context Additional context information
   */
  async call<P = any, R = any>(
    capabilityId: string,
    parameters: P,
    context?: Record<string, any>
  ): Promise<R> {
    if (!this.sessionId) {
      throw new AIPortError('no_session', 'No active session. Call createSession() first.');
    }
    
    if (!this.capabilities.has(capabilityId)) {
      throw new AIPortError(
        'unknown_capability',
        `The capability '${capabilityId}' is not supported by this application`
      );
    }
    
    try {
      const request: InvokeRequest = {
        session: this.sessionId,
        capability: capabilityId,
        parameters: parameters as any,
        context
      };
      
      const response = await this.axios.post<Response<R>>('/aiport/invoke', request);
      
      if (!response.data.success) {
        throw new AIPortError(
          response.data.error.code,
          response.data.error.message,
          response.data.error.details
        );
      }
      
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new AIPortError(
          'invoke_failed',
          `Failed to invoke capability '${capabilityId}': ${error.message}`,
          { status: error.response?.status }
        );
      }
      if (error instanceof AIPortError) {
        throw error;
      }
      throw new AIPortError('unknown_error', 'An unknown error occurred during capability invocation');
    }
  }
  
  /**
   * Get the list of available capabilities from the application
   */
  getCapabilities(): Capability[] {
    if (!this.manifest) {
      throw new AIPortError('not_initialized', 'Client not initialized. Call initialize() first.');
    }
    
    return Array.from(this.capabilities.values());
  }
  
  /**
   * Get a specific capability by ID
   * @param id The capability ID
   */
  getCapability(id: string): Capability | undefined {
    return this.capabilities.get(id);
  }
  
  /**
   * End the current session
   */
  async endSession(): Promise<boolean> {
    if (!this.sessionId) {
      return true; // No active session to end
    }
    
    try {
      await this.axios.delete(`/aiport/sessions/${this.sessionId}`);
      this.closeEventSource();
      this.sessionId = undefined;
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new AIPortError(
          'session_end_failed',
          `Failed to end session: ${error.message}`,
          { status: error.response?.status }
        );
      }
      throw new AIPortError('unknown_error', 'An unknown error occurred while ending the session');
    }
  }
  
  /**
   * Check the status of a long-running operation
   * @param callbackToken The token for the operation
   */
  async checkCallback(callbackToken: string): Promise<any> {
    if (!this.sessionId) {
      throw new AIPortError('no_session', 'No active session. Call createSession() first.');
    }
    
    try {
      const response = await this.axios.get<Response>(`/aiport/callbacks/${callbackToken}`);
      
      if (!response.data.success) {
        throw new AIPortError(
          response.data.error.code,
          response.data.error.message,
          response.data.error.details
        );
      }
      
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new AIPortError(
          'callback_check_failed',
          `Failed to check callback status: ${error.message}`,
          { status: error.response?.status }
        );
      }
      if (error instanceof AIPortError) {
        throw error;
      }
      throw new AIPortError('unknown_error', 'An unknown error occurred while checking callback status');
    }
  }
  
  /**
   * Set up event source for server-sent events
   */
  private setupEventSource(): void {
    if (!this.sessionId || typeof EventSource === 'undefined') {
      return;
    }
    
    this.closeEventSource();
    
    const url = new URL(`${this.options.endpoint}/aiport/events`);
    url.searchParams.append('session', this.sessionId);
    
    this.eventSource = new EventSource(url.toString());
    
    this.eventSource.onmessage = (event) => {
      try {
        const eventData = JSON.parse(event.data);
        this.emit(eventData.event, eventData);
      } catch (error) {
        console.error('Error parsing event data:', error);
      }
    };
    
    this.eventSource.onerror = () => {
      this.closeEventSource();
      // Attempt to reconnect after a delay
      setTimeout(() => this.setupEventSource(), 5000);
    };
  }
  
  /**
   * Close the event source connection
   */
  private closeEventSource(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
  }
} 