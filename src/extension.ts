import * as vscode from 'vscode';
import { AuthManager } from './utils/auth';
import { ApiClient } from './api/client';
import { MainProvider } from './providers/MainProvider';

let authManager: AuthManager;
let apiClient: ApiClient;
let mainProvider: MainProvider;
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

  // 初始化 Provider
  mainProvider = new MainProvider(context.extensionUri, apiClient, authManager, context);

  // 1. 注册 Webview View (Main View)
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(MainProvider.viewType, mainProvider)
  );

  // 2. 注册状态栏项目
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'promptvow.mainView.focus';
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
      mainProvider.refresh();
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
      await vscode.commands.executeCommand('promptvow.mainView.focus');
    }),

    vscode.commands.registerCommand('promptvow.selectProject', async () => {
      await vscode.commands.executeCommand('promptvow.mainView.focus');
      // 可以发送消息给 webview 切换到项目 tab
    }),

    vscode.commands.registerCommand('promptvow.resetApiKey', async () => {
      await authManager.clearToken();
      mainProvider.refresh();

      // Allow user to verify if they still have config key
      if (authManager.isAuthenticated()) {
        const selection = await vscode.window.showWarningMessage(
          'API Key is currently set via VS Code Settings and cannot be cleared here. Would you like to open Settings?',
          'Open Settings',
          'Cancel'
        );
        if (selection === 'Open Settings') {
          vscode.commands.executeCommand('workbench.action.openSettings', 'promptvow.apiKey');
        }
      } else {
        vscode.window.showInformationMessage('API Key has been reset. Please enter a new one in the PromptVow view.');
      }
    })
  ];

  commands.forEach(command => context.subscriptions.push(command));

  // 加载默认项目并初始化状态栏
  loadDefaultProject(context);
}

/**
 * Update status bar item
 */
function updateStatusBarItem(projectName?: string) {
  if (projectName) {
    statusBarItem.text = `$(database) PV: ${projectName}`;
    statusBarItem.tooltip = 'Click to switch project in Side Bar';
    statusBarItem.show();
  } else {
    statusBarItem.text = `$(database) PV: No Project Selected`;
    statusBarItem.show();
  }
}

/**
 * Load default project
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
        await mainProvider.selectProject(projectId, resolvedName || projectId);
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
 * Search prompts
 */
async function searchPrompts(): Promise<void> {
  const searchTerm = await vscode.window.showInputBox({ placeHolder: 'Search prompts...' });
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
 * Save selection as prompt
 */
async function saveSelectionAsPrompt(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.selection.isEmpty) return;
  const selectedText = editor.document.getText(editor.selection);
  const title = await vscode.window.showInputBox({ placeHolder: 'Enter prompt title' });
  if (!title) return;

  try {
    await apiClient.createGeneralPrompt({ title, content: selectedText, status: 'IN_PROGRESS', tags: '' });
    vscode.window.showInformationMessage('Prompt saved to General Library');
    mainProvider.refresh();
  } catch (error) { }
}

export function deactivate() { }
