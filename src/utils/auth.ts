import * as vscode from 'vscode';
import { AuthToken } from '../types';

/**
 * 认证管理器
 */
export class AuthManager {
  private static instance: AuthManager;
  private context: vscode.ExtensionContext;
  private token: string | null = null;

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.loadToken();
  }

  static getInstance(context: vscode.ExtensionContext): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager(context);
    }
    return AuthManager.instance;
  }

  /**
   * 从存储加载token
   */
  private loadToken(): void {
    this.token = this.context.globalState.get<string>('authToken') || null;
    console.log('[AuthManager] Token loaded from globalState:', !!this.token);
    if (this.token) {
      console.log('[AuthManager] Token length:', this.token.length);
      console.log('[AuthManager] Token (first 8 chars):', this.token.substring(0, 8) + '...');
    }
  }

  /**
   * 保存token到存储
   */
  private async saveToken(token: string): Promise<void> {
    await this.context.globalState.update('authToken', token);
    this.token = token;
  }



  /**
   * 设置token
   */
  async setToken(token: string): Promise<void> {
    await this.saveToken(token);
  }

  /**
   * 清除token
   */
  async clearToken(): Promise<void> {
    await this.context.globalState.update('authToken', undefined);
    this.token = null;
  }

  /**
   * 检查是否已认证
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * 获取当前token
   * 优先返回手动输入的token，其次返回配置中的API Key
   */
  getToken(): string | null {
    return this.token || this.getApiKey();
  }

  /**
   * 获取认证头
   */
  getAuthHeader(): Record<string, string> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }
    return {
      'Authorization': `Bearer ${this.token}`
    };
  }

  /**
   * 从配置获取 API Key
   */
  getApiKey(): string | null {
    const config = vscode.workspace.getConfiguration('promptvow');
    const apiKey = config.get<string>('apiKey');
    return apiKey || null;
  }
}
