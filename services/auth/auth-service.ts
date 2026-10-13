import { AdminSession, AdminUser, AuthResult, IAuthService } from './types';

class CentralAuthService implements IAuthService {
  private activeSessions: Map<string, AdminSession> = new Map();

  private getAdminCredential(): { user: string; pass: string } {
    const pass = process.env.ADMIN_PASSWORD || 'admin2026';
    const user = process.env.ADMIN_USERNAME || 'admin';
    return { user, pass };
  }

  public async authenticate(password: string, username = 'admin'): Promise<AuthResult> {
    const creds = this.getAdminCredential();

    if (username.trim() !== creds.user || password !== creds.pass) {
      return {
        success: false,
        error: 'Invalid administrator credentials. Please check your username and password.',
      };
    }

    const adminUser: AdminUser = {
      id: 'usr_adm_01',
      username: creds.user,
      email: 'admin@goinstaller.com',
      role: 'superadmin',
      createdAt: '2026-01-01T00:00:00.000Z',
      lastLogin: new Date().toISOString(),
    };

    // Generate secure session token
    const token = 'gis_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const session: AdminSession = {
      token,
      user: adminUser,
      expiresAt,
    };

    this.activeSessions.set(token, session);

    return {
      success: true,
      user: adminUser,
      token,
    };
  }

  public async verifySession(token: string): Promise<AdminUser | null> {
    if (!token) return null;
    const session = this.activeSessions.get(token);
    if (!session) return null;

    if (new Date(session.expiresAt) < new Date()) {
      this.activeSessions.delete(token);
      return null;
    }

    return session.user;
  }

  public async revokeSession(token: string): Promise<boolean> {
    return this.activeSessions.delete(token);
  }

  public isAuthorized(user: AdminUser, requiredRole: 'superadmin' | 'moderator' | 'analyst'): boolean {
    if (user.role === 'superadmin') return true;
    if (user.role === 'moderator' && requiredRole !== 'superadmin') return true;
    return user.role === requiredRole;
  }
}

export const authService = new CentralAuthService();
