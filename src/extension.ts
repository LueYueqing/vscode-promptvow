import * as vscode from 'vscode';
import { AuthManager } from './utils/auth';
import { ApiClient } from './api/client';
import { ActiveProjectProvider } from './providers/ActiveProjectProvider';
import { LibraryProvider } from './providers/LibraryProvider';

let authManager: AuthManager;
let apiClient: ApiClient;
let activeProjectProvider: ActiveProjectProvider;
let libraryProvider: LibraryProvider;
let extensionContext: vscode.ExtensionContext;
let statusBarItem: vscode.StatusBarItem;

/**
 * 激活扩展
 */
export function activate(context: vscode.ExtensionContext) {
  extensionContext = context;
  console.log('PromptVow extension is now active!');

  // 初始化管理器
  authManager = AuthManager.getInstance(context);
  apiClient = ApiClient.getInstance(authManager);

  // 初始化 Providers
  activeProjectProvider = new ActiveProjectProvider(context.extensionUri, apiClient, authManager, context);
  libraryProvider = new LibraryProvider(context.extensionUri, apiClient, authManager, context);

  // 1. 注册 Webview View (Active Project)
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ActiveProjectProvider.viewType, activeProjectProvider)
  );

  // 2. 注册 Webview View (Library)
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(LibraryProvider.viewType, libraryProvider)
  );

  // 3. 注册状态栏项目
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'promptvow.activeProject.focus';
  context.subscriptions.push(statusBarItem);
  updateStatusBarItem();

  // 注册内部命令：当在 Webview 中选择项目后，更新状态栏
  context.subscriptions.push(
    vscode.commands.registerCommand('promptvow.onProjectSelected', (projectName: string) => {
      updateStatusBarItem(projectName);
    })
  );

  // 全局刷新命令
  context.subscriptions.push(
    vscode.commands.registerCommand('promptvow.refreshPrompts', () => {
      activeProjectProvider.refresh();
      libraryProvider.refresh();
    })
  );

  // 注册其他命令
  const commands = [
    vscode.commands.registerCommand('promptvow.searchPrompts', () => {
      searchPrompts();
    }),

    vscode.commands.registerCommand('promptvow.saveSelectionAsPrompt', async () => {
      await saveSelectionAsPrompt();
    }),

    vscode.commands.registerCommand('promptvow.authenticate', async () => {
      await vscode.commands.executeCommand('promptvow.activeProject.focus');
    }),

    vscode.commands.registerCommand('promptvow.selectProject', async () => {
      await vscode.commands.executeCommand('promptvow.activeProject.focus');
    })
  ];

  commands.forEach(command => context.subscriptions.push(command));

  // 加载默认项目并初始化状态栏
  loadDefaultProject(context);
}

/**
 * 更新状态栏
 */
function updateStatusBarItem(projectName?: string) {
  if (projectName) {
    statusBarItem.text = `$(database) PV: ${projectName}`;
    statusBarItem.tooltip = '点击在侧边栏切换项目';
    statusBarItem.show();
  } else {
    statusBarItem.text = `$(database) PV: 未选项目`;
    statusBarItem.show();
  }
}

/**
 * 加载默认项目
 */
async function loadDefaultProject(context: vscode.ExtensionContext): Promise<void> {
  try {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      updateStatusBarItem();
      return;
    }

    const workspacePath = workspaceFolders[0].uri.fsPath;
    const defaultProject = context.globalState.get<any>(`defaultProject.${workspacePath}`);

    if (defaultProject) {
      const projectId = typeof defaultProject === 'string' ? defaultProject : defaultProject.id;
      const projectName = typeof defaultProject === 'string' ? undefined : defaultProject.name;

      if (projectId) {
        let resolvedName = projectName;
        if (!resolvedName) {
          const projects = await apiClient.getProjects();
          const p = projects.find(x => x.id == projectId);
          resolvedName = p?.name;
        }
        await activeProjectProvider.selectProject(projectId, resolvedName || projectId);
        updateStatusBarItem(resolvedName);
      }
    } else {
      updateStatusBarItem();
    }
  } catch (error) {
    updateStatusBarItem();
  }
}

/**
 * 搜索提示词
 */
async function searchPrompts(): Promise<void> {
  const searchTerm = await vscode.window.showInputBox({ placeHolder: '输入关键词搜索提示词...' });
  if (!searchTerm) return;

  try {
    const prompts = await apiClient.getGeneralPrompts({ search: searchTerm });
    if (prompts.length === 0) return;
    const selected = await vscode.window.showQuickPick(
      prompts.map(prompt => ({ label: prompt.title, description: prompt.content.substring(0, 50), prompt }))
    );
    if (selected) {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const position = editor.selection.active;
        await editor.edit(eb => eb.insert(position, selected.prompt.content));
      }
    }
  } catch (error) { }
}

/**
 * 保存选中的文本为提示词
 */
async function saveSelectionAsPrompt(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.selection.isEmpty) return;
  const selectedText = editor.document.getText(editor.selection);
  const title = await vscode.window.showInputBox({ placeHolder: '输入提示词标题' });
  if (!title) return;

  try {
    await apiClient.createGeneralPrompt({ title, content: selectedText, status: 'IN_PROGRESS', tags: '' });
    vscode.window.showInformationMessage('提示词已保存至通用库');
    libraryProvider.refresh();
  } catch (error) { }
}

export function deactivate() { }
