export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'superadmin' | 'moderator' | 'analyst';
  createdAt: string;
  lastLogin?: string;
}

export interface AdminSession {
  token: string;
  user: AdminUser;
  expiresAt: string;
}

export interface AuthResult {
  success: boolean;
  user?: AdminUser;
  token?: string;
  error?: string;
}

export interface IAuthService {
  authenticate(password: string, username?: string): Promise<AuthResult>;
  verifySession(token: string): Promise<AdminUser | null>;
  revokeSession(token: string): Promise<boolean>;
}

export interface SystemStats {
  totalDownloads: number;
  todayDownloads: number;
  totalBandwidthGB: number;
  successRate: number;
  activeExtractors: number;
  totalExtractors: number;
  averageLatencyMs: number;
  platformBreakdown: Array<{
    platform: string;
    downloads: number;
    percentage: number;
    color: string;
  }>;
  recentActivity: Array<{
    id: string;
    timestamp: string;
    platform: string;
    format: string;
    status: 'success' | 'failed' | 'processing';
    ipHash: string;
    latencyMs: number;
  }>;
}
