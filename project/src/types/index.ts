// Type definitions for the application

export interface OsintTool {
  id: string;
  name: string;
  description: string;
  url: string;
  apiKey?: string;
  isActive: boolean;
  category: ToolCategory;
  capabilities: ToolCapability[];
  responseFormat: string;
}

export enum ToolCategory {
  SOCIAL_MEDIA = "Social Media",
  DOMAIN_INFO = "Domain Information",
  EMAIL_INFO = "Email Information",
  PERSON_INFO = "Person Information",
  COMPANY_INFO = "Company Information",
  GENERAL = "General Purpose"
}

export enum ToolCapability {
  SOCIAL_PROFILES = "Social Profiles",
  EMAIL_VERIFICATION = "Email Verification",
  DOMAIN_WHOIS = "Domain WHOIS",
  PERSON_SEARCH = "Person Search",
  COMPANY_RESEARCH = "Company Research",
  IP_LOOKUP = "IP Lookup",
  DARK_WEB = "Dark Web",
  NEWS_SEARCH = "News Search"
}

export interface Investigation {
  id: string;
  query: string;
  type: InvestigationType;
  date: Date;
  toolIds: string[];
  results: ToolResult[];
}

export enum InvestigationType {
  PERSON = "Person",
  DOMAIN = "Domain",
  EMAIL = "Email",
  USERNAME = "Username",
  COMPANY = "Company",
  GENERIC = "Generic"
}

export interface ToolResult {
  toolId: string;
  status: ResultStatus;
  rawResponse: string;
  standardizedResponse?: StandardizedResponse;
  processedAt: Date;
  executionTimeMs: number;
  score?: number;
  notes?: string;
}

export enum ResultStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  TIMEOUT = "timeout"
}

// This interface defines a common structure for standardized responses
// regardless of the tool's original format
export interface StandardizedResponse {
  summary: string;
  entities: Entity[];
  links: Link[];
  confidence: number;
  sources: Source[];
  metadata: Record<string, any>;
}

export interface Entity {
  type: EntityType;
  value: string;
  confidence: number;
  metadata?: Record<string, any>;
}

export enum EntityType {
  PERSON = "person",
  ORGANIZATION = "organization",
  LOCATION = "location",
  EMAIL = "email",
  PHONE = "phone",
  URL = "url",
  USERNAME = "username",
  SOCIAL_PROFILE = "social_profile",
  DATE = "date",
  OTHER = "other"
}

export interface Link {
  source: string;
  target: string;
  type: string;
  confidence: number;
}

export interface Source {
  name: string;
  url?: string;
  date?: Date;
  reliability?: number;
}

export interface ComparisonMetric {
  name: string;
  description: string;
  evaluator: (result: ToolResult) => number;
  weight: number;
}

export interface User {
  id: string;
  username: string;
  preferences: {
    defaultTools: string[];
    theme: 'light' | 'dark';
    defaultMetrics: string[];
  };
}