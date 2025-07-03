/**
 * Core type definitions for the AIPort protocol
 */

// Base parameter types
export type PrimitiveType = 'string' | 'number' | 'boolean' | 'integer' | 'null';
export type ComplexType = 'object' | 'array';
export type ParameterType = PrimitiveType | ComplexType;

// Parameter schema types (based on JSON Schema)
export interface BaseParameterSchema {
  type: ParameterType;
  description?: string;
  default?: any;
}

export interface StringParameterSchema extends BaseParameterSchema {
  type: 'string';
  format?: string;
  pattern?: string;
  enum?: string[];
  minLength?: number;
  maxLength?: number;
  required?: boolean;
}

export interface NumberParameterSchema extends BaseParameterSchema {
  type: 'number' | 'integer';
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
  required?: boolean;
}

export interface BooleanParameterSchema extends BaseParameterSchema {
  type: 'boolean';
  required?: boolean;
}

export interface ArrayParameterSchema extends BaseParameterSchema {
  type: 'array';
  items: ParameterSchema;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  required?: boolean;
}

export interface ObjectParameterSchema extends BaseParameterSchema {
  type: 'object';
  properties: Record<string, ParameterSchema>;
  required?: string[];
  additionalProperties?: boolean | ParameterSchema;
}

export type ParameterSchema =
  | StringParameterSchema
  | NumberParameterSchema
  | BooleanParameterSchema
  | ArrayParameterSchema
  | ObjectParameterSchema
  | { type: 'null'; required?: boolean };

// Capability types
export interface CapabilityExample {
  name: string;
  parameters: Record<string, any>;
  returns: any;
}

export interface Capability {
  id: string;
  name: string;
  description: string;
  parameters: ObjectParameterSchema;
  returns: ParameterSchema;
  permissions: string[];
  examples?: CapabilityExample[];
}

// Application manifest
export interface ApplicationInfo {
  id: string;
  name: string;
  version: string;
  publisher?: string;
  website?: string;
  description?: string;
}

export interface AuthenticationConfig {
  required: boolean;
  methods: ('oauth2' | 'api_key' | 'jwt' | 'session')[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Extension {
  id: string;
  name: string;
  version: string;
  capabilities: Capability[];
}

export interface ApplicationManifest {
  protocol: 'aiport';
  version: string;
  application: ApplicationInfo;
  capabilities: Capability[];
  authentication: AuthenticationConfig;
  permissions: Permission[];
  extensions?: Extension[];
}

// Request/Response types
export interface RequestContext {
  locale?: string;
  timezone?: string;
  [key: string]: any;
}

export interface InvokeRequest {
  session: string;
  capability: string;
  parameters: Record<string, any>;
  context?: RequestContext;
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  error: null;
}

export interface ErrorDetails {
  [key: string]: any;
}

export interface ErrorResponse {
  success: false;
  data: null;
  error: {
    code: string;
    message: string;
    details?: ErrorDetails;
  };
}

export type Response<T = any> = SuccessResponse<T> | ErrorResponse;

// Session types
export interface SessionInfo {
  session_id: string;
  expires_at?: string;
}

// Event types
export interface EventMessage<T = any> {
  event: string;
  data: T;
  timestamp: string;
}

// Auth types
export interface OAuth2Config {
  type: 'oauth2';
  clientId: string;
  clientSecret?: string;
  authorizeUrl?: string;
  tokenUrl?: string;
  scope?: string[];
  redirectUri?: string;
}

export interface ApiKeyConfig {
  type: 'api_key';
  key: string;
  headerName?: string;
}

export interface JwtConfig {
  type: 'jwt';
  token: string;
}

export type AuthConfig = OAuth2Config | ApiKeyConfig | JwtConfig;

// Connection options
export interface ConnectionOptions {
  endpoint: string;
  auth?: AuthConfig;
}

// Handler types
export type CapabilityHandler<P = any, R = any> = (
  params: P, 
  context: {
    user: { id: string; [key: string]: any };
    session: { id: string; [key: string]: any };
    [key: string]: any;
  }
) => Promise<R>;

export interface ApplicationOptions {
  id: string;
  name: string;
  version: string;
  capabilities: Capability[];
  publisher?: string;
  website?: string;
  description?: string;
}

// Error classes
export class AIPortError extends Error {
  code: string;
  details?: ErrorDetails;

  constructor(code: string, message: string, details?: ErrorDetails) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'AIPortError';
  }
} 