/**
 * VS Code Extension Type Definitions
 */

export interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  projectId: string;
  projectName?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'DEVELOPED' | 'TESTED' | 'ACCEPTED';
  tags: string; // API中使用字符串格式，如"登录,认证,用户"
  category?: string; // 分类字段
  notes?: string; // 备注字段
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthToken {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ApiError {
  message: string;
  code?: number;
  details?: any;
}

export interface PromptFilter {
  projectId?: string;
  status?: Prompt['status'];
  tags?: string; // 使用字符串格式，如"登录,认证,用户"
  search?: string;
  category?: string;
}

export interface InsertPromptOptions {
  prompt: Prompt;
  position?: 'before' | 'after' | 'replace';
  cursorPosition?: {
    line: number;
    character: number;
  };
}
