import * as vscode from 'vscode';
import { Prompt, Project, PromptFilter, ApiError } from '../types';
import { AuthManager } from '../utils/auth';

/**
 * API客户端
 */
export class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string;
  private authManager: AuthManager;

  private constructor(authManager: AuthManager) {
    // 从配置获取API地址，默认为localhost开发环境
    const config = vscode.workspace.getConfiguration('promptvow');
    this.baseUrl = config.get<string>('apiUrl', 'https://promptvow.com');
    this.authManager = authManager;
  }

  static getInstance(authManager: AuthManager): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(authManager);
    }
    return ApiClient.instance;
  }

  /**
   * 获取通用提示词列表
   */
  async getGeneralPrompts(filters?: PromptFilter): Promise<Prompt[]> {
    // 使用正确的API端点：/api/general-prompts/list
    const url = new URL(`${this.baseUrl}/api/general-prompts/list`);

    if (filters?.search) {
      url.searchParams.append('search', filters.search);
    }
    if (filters?.tags) {
      url.searchParams.append('tags', filters.tags); // tags已经是字符串格式，不需要join
    }
    if (filters?.category) {
      url.searchParams.append('category', filters.category);
    }

    // 添加认证信息（优先使用手动输入的token，其次使用配置中的API key）
    const token = this.authManager.getToken();
    
    // 调试日志：显示请求详情
    console.log('[ApiClient] 正在调用 getGeneralPrompts:');
    console.log('[ApiClient] Base URL:', this.baseUrl);
    console.log('[ApiClient] Token exists:', !!token);
    console.log('[ApiClient] Token length:', token?.length || 0);
    console.log('[ApiClient] Request URL (before adding key):', url.toString());
    
    if (token) {
      url.searchParams.append('key', token);
      console.log('[ApiClient] Request URL (after adding key):', url.toString());
      // 隐藏完整的 token，只显示前8个字符用于调试
      console.log('[ApiClient] Token (first 8 chars):', token.substring(0, 8) + '...');
    } else {
      console.warn('[ApiClient] 警告：没有找到 token，请求可能会失败！');
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('[ApiClient] Response status:', response.status);
    console.log('[ApiClient] Response ok:', response.ok);

    if (!response.ok) {
      throw await this.handleError(response);
    }

    const data = await response.json();
    return data as Prompt[];
  }

  /**
   * 创建通用提示词
   */
  async createGeneralPrompt(prompt: Partial<Prompt>): Promise<Prompt> {
    const url = new URL(`${this.baseUrl}/api/general-prompts/create`);

    // 添加 API Key 参数
    const apiKey = this.authManager.getToken();
    if (apiKey) {
      url.searchParams.append('key', apiKey);
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(prompt)
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return await response.json() as Promise<Prompt>;
  }

  /**
   * 获取项目列表
   */
  async getProjects(): Promise<Project[]> {
    const url = new URL(`${this.baseUrl}/api/projects`);

    // 添加 API Key 参数
    const apiKey = this.authManager.getToken();
    
    // 调试日志
    console.log('[ApiClient] 正在调用 getProjects:');
    console.log('[ApiClient] Token exists:', !!apiKey);
    console.log('[ApiClient] Token length:', apiKey?.length || 0);
    console.log('[ApiClient] Request URL (before adding key):', url.toString());
    
    if (apiKey) {
      url.searchParams.append('key', apiKey);
      console.log('[ApiClient] Request URL (after adding key):', url.toString());
      console.log('[ApiClient] Token (first 8 chars):', apiKey.substring(0, 8) + '...');
    } else {
      console.warn('[ApiClient] 警告：没有找到 token，请求可能会失败！');
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('[ApiClient] getProjects Response status:', response.status);
    console.log('[ApiClient] getProjects Response ok:', response.ok);

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return await response.json() as Promise<Project[]>;
  }

  /**
   * 获取项目下的提示词
   */
  async getProjectPrompts(projectId: string, status?: string): Promise<Prompt[]> {
    const url = new URL(`${this.baseUrl}/api/projects/${projectId}/prompts`);

    // 添加状态筛选参数
    if (status) {
      url.searchParams.append('status', status);
    }

    // 添加 API Key 参数
    const apiKey = this.authManager.getToken();
    
    // 调试日志
    console.log('[ApiClient] 正在调用 getProjectPrompts:');
    console.log('[ApiClient] Project ID:', projectId);
    console.log('[ApiClient] Status:', status);
    console.log('[ApiClient] Token exists:', !!apiKey);
    console.log('[ApiClient] Token length:', apiKey?.length || 0);
    console.log('[ApiClient] Request URL (before adding key):', url.toString());
    
    if (apiKey) {
      url.searchParams.append('key', apiKey);
      console.log('[ApiClient] Request URL (after adding key):', url.toString());
      console.log('[ApiClient] Token (first 8 chars):', apiKey.substring(0, 8) + '...');
    } else {
      console.warn('[ApiClient] 警告：没有找到 token，请求可能会失败！');
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('[ApiClient] getProjectPrompts Response status:', response.status);
    console.log('[ApiClient] getProjectPrompts Response ok:', response.ok);

    if (!response.ok) {
      const error = await this.handleError(response);
      console.error('[ApiClient] getProjectPrompts Error:', error);
      throw error;
    }

    const rawData = await response.json();
    console.log('[ApiClient] getProjectPrompts Raw response:', rawData);
    console.log('[ApiClient] getProjectPrompts Raw response type:', Array.isArray(rawData) ? 'array' : typeof rawData);
    
    // 检查返回的数据格式
    if (Array.isArray(rawData)) {
      console.log('[ApiClient] Response is an array, returning directly');
      return rawData as Prompt[];
    } else if (rawData && typeof rawData === 'object' && 'prompts' in rawData) {
      console.log('[ApiClient] Response is an object with prompts field');
      return rawData.prompts as Prompt[];
    } else {
      console.warn('[ApiClient] Unexpected response format:', rawData);
      return [];
    }
  }

  /**
   * 创建项目提示词
   */
  async createProjectPrompt(projectId: string, prompt: Partial<Prompt>): Promise<Prompt> {
    const url = new URL(`${this.baseUrl}/api/projects/${projectId}/prompts`);

    // 添加 API Key 参数
    const apiKey = this.authManager.getToken();
    if (apiKey) {
      url.searchParams.append('key', apiKey);
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(prompt)
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return await response.json() as Promise<Prompt>;
  }

  /**
   * 更新提示词
   */
  async updatePrompt(promptId: string, updates: Partial<Prompt>): Promise<Prompt> {
    const url = new URL(`${this.baseUrl}/api/prompts/${promptId}`);

    // 添加 API Key 参数
    const apiKey = this.authManager.getToken();
    if (apiKey) {
      url.searchParams.append('key', apiKey);
    }

    const response = await fetch(url.toString(), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return await response.json() as Promise<Prompt>;
  }

  /**
   * 完成任务 - 将提示词状态设置为COMPLETED
   */
  async completeTask(promptId: string): Promise<Prompt> {
    console.log('[ApiClient] 完成任务，promptId:', promptId);
    return this.updatePrompt(promptId, { status: 'COMPLETED' });
  }

  /**
   * 删除提示词
   */
  async deletePrompt(promptId: string): Promise<void> {
    const url = new URL(`${this.baseUrl}/api/prompts/${promptId}`);

    // 添加 API Key 参数
    const apiKey = this.authManager.getToken();
    if (apiKey) {
      url.searchParams.append('key', apiKey);
    }

    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }
  }

  /**
   * 处理错误
   */
  private async handleError(response: Response): Promise<ApiError> {
    let message = 'Unknown error';
    let code = response.status;
    let details: any = null;

    try {
      const data = await response.json() as { error?: string; message?: string; details?: any };
      message = data.error || data.message || message;
      details = data.details;
    } catch (e) {
      message = response.statusText || message;
    }

    const error: ApiError = {
      message,
      code,
      details
    };

    // 显示错误通知（移除，避免重复显示）
    // vscode.window.showErrorMessage(`PromptVow API Error: ${message}`);
    return error;
  }

  /**
   * 更新API地址
   */
  updateBaseUrl(url: string): void {
    this.baseUrl = url;
  }
}
