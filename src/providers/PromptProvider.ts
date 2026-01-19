import * as vscode from 'vscode';
import { Prompt, Project } from '../types';
import { ApiClient } from '../api/client';

/**
 * Prompt树形数据提供者
 */
export class PromptProvider implements vscode.TreeDataProvider<PromptTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<PromptTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private prompts: Prompt[] = [];
  private projects: Project[] = [];
  private selectedProjectId: string | undefined;

  constructor(private apiClient: ApiClient) {}

  /**
   * 刷新数据
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * 设置选中的项目
   */
  setSelectedProject(projectId: string | undefined): void {
    this.selectedProjectId = projectId;
    this.refresh();
  }

  /**
   * 获取树形项
   */
  getTreeItem(element: PromptTreeItem): vscode.TreeItem {
    return element;
  }

  /**
   * 获取子项
   */
  async getChildren(element?: PromptTreeItem): Promise<PromptTreeItem[]> {
    // 获取所有通用提示词
    try {
      this.prompts = await this.apiClient.getGeneralPrompts();
      return this.prompts.map(prompt => new PromptTreeItem(prompt));
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('Failed to load prompts:', error);
      
      // 检查是否是认证相关的错误
      if (errorMessage.includes('认证') || errorMessage.includes('访问令牌') || errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('unauthorized')) {
        vscode.window.showWarningMessage(
          '请先认证以使用此功能',
          '认证'
        ).then(selection => {
          if (selection === '认证') {
            vscode.commands.executeCommand('promptvow.authenticate');
          }
        });
      } else {
        vscode.window.showErrorMessage(`Failed to load prompts: ${errorMessage}`);
      }
      return [];
    }
  }
}

/**
 * Prompt树形项
 */
export class PromptTreeItem extends vscode.TreeItem {
  public tooltip?: string;
  public description?: string;
  public contextValue?: string;
  public iconPath?: vscode.ThemeIcon | string | vscode.Uri | { light: vscode.Uri; dark: vscode.Uri };
  public projectId?: string;

  constructor(
    public prompt: Prompt,
    public isProject: boolean = false
  ) {
    super(
      prompt.title,
      isProject ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
    );

    this.tooltip = isProject 
      ? `Project: ${prompt.title}`
      : `${prompt.title}\n${prompt.content.substring(0, 100)}...`;
    
    this.description = isProject ? 'Project' : prompt.status;
    
    if (!isProject) {
      this.contextValue = 'prompt';
      this.iconPath = new vscode.ThemeIcon('file');
    } else {
      this.contextValue = 'project';
      this.iconPath = new vscode.ThemeIcon('folder');
      this.projectId = (this.prompt as any).projectId;
    }
  }
}
