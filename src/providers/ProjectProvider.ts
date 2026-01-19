import * as vscode from 'vscode';
import { Project } from '../types';
import { ApiClient } from '../api/client';

/**
 * Project树形数据提供者
 * 重新设计：只显示选中项目的提示词列表
 */
export class ProjectProvider implements vscode.TreeDataProvider<ProjectTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<ProjectTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private projects: Project[] = [];
  private selectedProjectId: string | null = null;
  private selectedProjectName: string | null = null;

  constructor(private apiClient: ApiClient, private context?: vscode.ExtensionContext) { }

  /**
   * 刷新数据
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * 设置选中的项目
   */
  async selectProject(projectId: string, projectName?: string): Promise<void> {
    this.selectedProjectId = projectId;
    this.selectedProjectName = projectName || null;

    // 如果没有项目名称，尝试从 API 获取所有项目并匹配名称
    if (!this.selectedProjectName && this.selectedProjectId) {
      try {
        const projects = await this.apiClient.getProjects();
        const project = projects.find(p => p.id === projectId);
        if (project) {
          this.selectedProjectName = project.name;
        }
      } catch (error) {
        console.error('[ProjectProvider] Failed to resolve project name:', error);
      }
    }

    this.refresh();
  }

  /**
   * 获取树形项
   */
  getTreeItem(element: ProjectTreeItem): vscode.TreeItem {
    return element;
  }

  /**
   * 获取子项
   */
  async getChildren(element?: ProjectTreeItem): Promise<ProjectTreeItem[]> {
    console.log('[ProjectProvider] getChildren called, element:', element);
    console.log('[ProjectProvider] selectedProjectId:', this.selectedProjectId);

    // 如果没有选中项目，提示用户选择项目
    if (!this.selectedProjectId) {
      console.log('[ProjectProvider] No project selected, showing select button');
      return [
        new ProjectTreeItem({
          id: 'select-project',
          title: '📋 选择项目',
          content: '点击此处选择要查看的项目',
          isActionItem: true,
          command: 'promptvow.selectProject'
        }, false, undefined, undefined)
      ];
    }

    // 显示选中项目的提示词（只显示IN_PROGRESS状态的）
    try {
      console.log('[ProjectProvider] Fetching prompts for project:', this.selectedProjectId);
      const prompts = await this.apiClient.getProjectPrompts(this.selectedProjectId, 'IN_PROGRESS');
      console.log('[ProjectProvider] Received prompts:', prompts);
      console.log('[ProjectProvider] Prompts count:', prompts.length);

      // 构建项目信息项
      const projectInfoItem = new ProjectTreeItem({
        id: 'project-info',
        title: `📁 ${this.selectedProjectName || this.selectedProjectId}`,
        content: '点击切换到其他项目',
        isActionItem: true,
        command: 'promptvow.selectProject'
      }, false, this.selectedProjectId, this.selectedProjectName || undefined);

      if (prompts.length === 0) {
        console.log('[ProjectProvider] No prompts found, showing empty message');
        return [
          projectInfoItem,
          new ProjectTreeItem({
            id: 'add-prompt',
            title: '➕ 新增提示词',
            content: '点击添加新的提示词',
            isActionItem: true,
            command: 'promptvow.addPrompt'
          }, false, this.selectedProjectId, undefined),
          new ProjectTreeItem({
            id: 'no-prompts',
            title: '📝 此项目暂无"新录入"状态的提示词',
            content: '点击上方"新增提示词"按钮添加，或在网页版中创建',
            isActionItem: false
          }, false, this.selectedProjectId, undefined)
        ];
      }

      console.log('[ProjectProvider] Mapping prompts to tree items');
      const items = prompts.map(prompt => {
        console.log('[ProjectProvider] Processing prompt:', {
          id: prompt.id,
          contentLength: prompt.content?.length,
          status: prompt.status
        });

        return new ProjectTreeItem({
          id: prompt.id,
          title: prompt.content ? prompt.content.substring(0, 60) : '无内容', // 只显示内容的前60个字符
          content: prompt.content || '',
          projectId: this.selectedProjectId || undefined,
          projectName: prompt.projectName || '项目',
          status: prompt.status,
          tags: prompt.tags,
          createdAt: prompt.createdAt,
          updatedAt: prompt.updatedAt
        }, false, this.selectedProjectId || undefined, prompt.projectName);
      });

      console.log('[ProjectProvider] Returning', items.length, 'tree items');

      // 在提示词列表后添加"新增提示词"按钮
      const addPromptButton = new ProjectTreeItem({
        id: 'add-prompt',
        title: '➕ 新增提示词',
        content: '点击添加新的提示词',
        isActionItem: true,
        command: 'promptvow.addPrompt'
      }, false, this.selectedProjectId, undefined);

      return [projectInfoItem, ...items, addPromptButton];
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('[ProjectProvider] Failed to load project prompts:', error);
      console.error('[ProjectProvider] Error stack:', error?.stack);

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
      }

      return [
        new ProjectTreeItem({
          id: 'error',
          title: `❌ 加载失败: ${errorMessage}`,
          content: '请检查网络连接或API密钥',
          isActionItem: false
        }, false, undefined, undefined)
      ];
    }
  }
}

/**
 * Project树形项
 */
export class ProjectTreeItem extends vscode.TreeItem {
  public tooltip?: string;
  public description?: string;
  public contextValue?: string;
  public iconPath?: vscode.ThemeIcon | string | vscode.Uri | { light: vscode.Uri; dark: vscode.Uri };
  public projectId?: string;
  public projectName?: string;
  public isActionItem?: boolean;
  public commandId?: string;

  constructor(
    public prompt: any,
    public isProject: boolean = false,
    projectId?: string,
    projectName?: string
  ) {
    super(
      prompt.title,
      vscode.TreeItemCollapsibleState.None
    );

    // 如果是操作项（如"选择项目"按钮）
    if (prompt.isActionItem) {
      this.tooltip = prompt.content;
      this.description = '点击操作';
      this.contextValue = 'action';
      this.commandId = prompt.command;

      // 根据不同的操作项设置不同的图标
      if (prompt.command === 'promptvow.selectProject') {
        this.iconPath = new vscode.ThemeIcon('database');
      } else if (prompt.command === 'promptvow.addPrompt') {
        this.iconPath = new vscode.ThemeIcon('add');
      } else {
        this.iconPath = new vscode.ThemeIcon('refresh');
      }

      this.isActionItem = true;

      // 设置点击时执行的命令
      if (prompt.command) {
        this.command = {
          command: prompt.command,
          title: prompt.title
        };
      }
      return;
    }

    // 提示词项
    this.tooltip = prompt.content;
    this.description = ''; // 不显示状态和日期信息
    this.contextValue = 'prompt';
    this.iconPath = new vscode.ThemeIcon('file');
    this.projectId = projectId;
    this.projectName = projectName;
  }
}
