import * as vscode from 'vscode';
import { AuthManager } from './utils/auth';
import { ApiClient } from './api/client';
import { PromptProvider, PromptTreeItem } from './providers/PromptProvider';
import { ProjectProvider, ProjectTreeItem } from './providers/ProjectProvider';

let authManager: AuthManager;
let apiClient: ApiClient;
let promptProvider: PromptProvider;
let projectProvider: ProjectProvider;
let extensionContext: vscode.ExtensionContext;

/**
 * 激活扩展
 */
export function activate(context: vscode.ExtensionContext) {
  extensionContext = context;
  console.log('PromptVow extension is now active!');

  // 初始化管理器
  authManager = AuthManager.getInstance(context);
  apiClient = ApiClient.getInstance(authManager);
  promptProvider = new PromptProvider(apiClient);
  projectProvider = new ProjectProvider(apiClient, context);

    // 注册树形视图 - Projects 视图显示项目列表
  const projectTreeView = vscode.window.createTreeView('promptvow.prompts', {
    treeDataProvider: projectProvider,
    showCollapseAll: true
  });

  // 注册树形视图 - Prompts 视图显示提示词列表
  const promptsTreeView = vscode.window.createTreeView('promptvow.projects', {
    treeDataProvider: promptProvider,
    showCollapseAll: true
  });

  // 双击事件：自动复制提示词内容
  projectTreeView.onDidChangeSelection(async (e) => {
    if (e.selection.length > 0 && !e.selection[0].isActionItem && !e.selection[0].isProject) {
      const prompt = e.selection[0].prompt;
      if (prompt && prompt.content) {
        await vscode.env.clipboard.writeText(prompt.content);
        vscode.window.showInformationMessage('提示词已复制到剪贴板');
      }
    }
  });

  // 注册命令
  const commands = [
    vscode.commands.registerCommand('promptvow.showPromptPanel', () => {
      vscode.window.showInformationMessage('PromptVow Panel is active');
    }),

    vscode.commands.registerCommand('promptvow.insertPrompt', async (item: PromptTreeItem) => {
      if (!item || item.isProject) {
        vscode.window.showWarningMessage('Please select a prompt to insert');
        return;
      }
      await insertPrompt(item.prompt);
    }),

    vscode.commands.registerCommand('promptvow.searchPrompts', () => {
      searchPrompts();
    }),

    vscode.commands.registerCommand('promptvow.saveSelectionAsPrompt', async () => {
      await saveSelectionAsPrompt();
    }),

    vscode.commands.registerCommand('promptvow.refreshPrompts', () => {
      promptProvider.refresh();
      projectProvider.refresh();
    }),

    vscode.commands.registerCommand('promptvow.openPromptEditor', () => {
      openPromptEditor();
    }),

    vscode.commands.registerCommand('promptvow.copyPrompt', async (item: any) => {
      if (!item || item.isProject) {
        vscode.window.showWarningMessage('Please select a prompt to copy');
        return;
      }
      await copyPrompt(item.prompt);
    }),

    vscode.commands.registerCommand('promptvow.setAsDefaultProject', async (item: any) => {
      if (!item || !item.isProject) {
        vscode.window.showWarningMessage('Please select a project to set as default');
        return;
      }
      await setAsDefaultProject(context, item);
    }),

    vscode.commands.registerCommand('promptvow.authenticate', async () => {
      await authenticate();
    }),

    vscode.commands.registerCommand('promptvow.selectProject', async () => {
      await selectProject();
    }),

    // 处理"选择项目"按钮点击
    vscode.commands.registerCommand('promptvow.handleSelectProjectClick', async () => {
      await selectProject();
    }),

    // 完成任务：将提示词状态设置为COMPLETED
    vscode.commands.registerCommand('promptvow.completeTask', async (item: any) => {
      if (!item || item.isProject || item.isActionItem) {
        vscode.window.showWarningMessage('Please select a prompt to complete');
        return;
      }
      await completeTask(item.prompt);
    }),

    // 新增提示词：显示输入框添加新提示词
    vscode.commands.registerCommand('promptvow.addPrompt', async () => {
      await addPrompt();
    })
  ];

  // 添加到上下文
  commands.forEach(command => context.subscriptions.push(command));

  // 显示欢迎消息
  if (!authManager.isAuthenticated()) {
    vscode.window.showInformationMessage(
      'Welcome to PromptVow! Please authenticate to start managing your prompts.',
      'Authenticate',
      'Later'
    ).then((selection: string | undefined) => {
      if (selection === 'Authenticate') {
        vscode.commands.executeCommand('promptvow.authenticate');
      }
    });
  }

  // 加载默认项目
  loadDefaultProject(context);
}

/**
 * 加载默认项目
 */
async function loadDefaultProject(context: vscode.ExtensionContext): Promise<void> {
  try {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return;
    }

    const workspacePath = workspaceFolders[0].uri.fsPath;
    const defaultProjectId = context.globalState.get<string>(`defaultProject.${workspacePath}`);

    if (defaultProjectId) {
      console.log(`Loading default project: ${defaultProjectId}`);
      await projectProvider.selectProject(defaultProjectId);
    }
  } catch (error) {
    console.error('Failed to load default project:', error);
  }
}

/**
 * 插入提示词到编辑器
 */
async function insertPrompt(prompt: any): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }

  const position = editor.selection.active;
  await editor.edit((editBuilder: vscode.TextEditorEdit) => {
    editBuilder.insert(position, prompt.content);
  });

  vscode.window.showInformationMessage(`Inserted: ${prompt.title}`);
}

/**
 * 复制提示词到剪贴板
 */
async function copyPrompt(prompt: any): Promise<void> {
  try {
    await vscode.env.clipboard.writeText(prompt.content);
    vscode.window.showInformationMessage(`Copied: ${prompt.title}`);
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to copy prompt: ${error}`);
  }
}

/**
 * 搜索提示词
 */
async function searchPrompts(): Promise<void> {
  const searchTerm = await vscode.window.showInputBox({
    placeHolder: 'Enter search term',
    prompt: 'Search prompts by title, content, or tags'
  });

  if (!searchTerm) {
    return;
  }

  try {
    const prompts = await apiClient.getGeneralPrompts({ search: searchTerm });
    if (prompts.length === 0) {
      vscode.window.showInformationMessage('No prompts found');
      return;
    }

    // 显示快速选择
    const selected = await vscode.window.showQuickPick(
      prompts.map(prompt => ({
        label: prompt.title,
        description: prompt.content.substring(0, 50),
        prompt: prompt
      })),
      { placeHolder: 'Select a prompt' }
    );

    if (selected) {
      await insertPrompt(selected.prompt);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Search failed: ${error}`);
  }
}

/**
 * 保存选中的文本为提示词
 */
async function saveSelectionAsPrompt(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }

  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);

  if (!selectedText.trim()) {
    vscode.window.showWarningMessage('Please select some text first');
    return;
  }

  if (!authManager.isAuthenticated()) {
    vscode.window.showWarningMessage('Please authenticate first');
    return;
  }

  // 获取标题
  const title = await vscode.window.showInputBox({
    placeHolder: 'Enter prompt title',
    prompt: 'Title for this prompt'
  });

  if (!title) {
    return;
  }

  try {
    await apiClient.createGeneralPrompt({
      title,
      content: selectedText,
      status: 'IN_PROGRESS',
      tags: ''  // tags必须是字符串格式
    });

    vscode.window.showInformationMessage('Prompt saved successfully!');
    promptProvider.refresh();
    projectProvider.refresh();
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to save prompt: ${error}`);
  }
}

/**
 * 打开提示词编辑器
 */
function openPromptEditor(): void {
  vscode.window.showInformationMessage('Prompt Editor coming soon!');
}

/**
 * 用户认证
 */
async function authenticate(): Promise<void> {
  const token = await vscode.window.showInputBox({
    placeHolder: '例如: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p',
    prompt: '请输入您的 API Key（32位十六进制字符串），您可以在 PromptVow 网站的用户设置中创建',
    password: true,
    validateInput: (value: string) => {
      if (!value || value.trim().length === 0) {
        return 'API Key 不能为空';
      }
      // 检查是否为32位十六进制字符串
      if (!/^[a-f0-9]{32}$/i.test(value.trim())) {
        return 'API Key 格式错误，应为32位十六进制字符串（例如: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p）';
      }
      return null;
    }
  });

  if (!token) {
    return;
  }

  try {
    // 保存token到永久存储
    await authManager.setToken(token);
    console.log('API Key 已保存到永久存储');
    
    // 立即验证token是否有效
    const isValid = await verifyToken(token);
    
    if (isValid === true) {
      // 验证成功
      vscode.window.showInformationMessage('认证成功！API Key 已保存。');
      promptProvider.refresh();
      projectProvider.refresh();
    } else if (isValid === false) {
      // token 无效，清除已保存的token
      await authManager.clearToken();
      vscode.window.showErrorMessage(
        '认证失败：无效的 API Key。请检查您输入的 API Key 是否正确，并确保该 Key 已在 PromptVow 网站上创建。',
        '重新输入',
        '查看帮助'
      ).then(selection => {
        if (selection === '重新输入') {
          vscode.commands.executeCommand('promptvow.authenticate');
        } else if (selection === '查看帮助') {
          openApiKeyHelp();
        }
      });
    } else {
      // 无法确定 token 是否有效（网络错误等），但已保存
      vscode.window.showInformationMessage(
        'API Key 已保存！由于网络原因无法验证，您可以在使用时再测试。',
        '确定'
      );
      promptProvider.refresh();
      projectProvider.refresh();
    }
  } catch (error: any) {
    // 保存时发生错误，清除已保存的token
    await authManager.clearToken();
    vscode.window.showErrorMessage(
      `保存 API Key 失败: ${error?.message || error}`,
      '重试'
    ).then(selection => {
      if (selection === '重试') {
        vscode.commands.executeCommand('promptvow.authenticate');
      }
    });
  }
}

/**
 * 打开 API Key 帮助页面
 */
function openApiKeyHelp(): void {
  const config = vscode.workspace.getConfiguration('promptvow');
  const baseUrl = config.get<string>('apiUrl', 'https://promptvow.com');
  const helpUrl = `${baseUrl}/user/settings#api-keys`;
  
  vscode.env.openExternal(vscode.Uri.parse(helpUrl));
}

/**
 * 验证API token是否有效
 * 返回值：true-有效，false-无效，null-无法确定（网络错误等）
 */
async function verifyToken(token: string): Promise<boolean | null> {
  try {
    // 尝试调用一个简单的API端点来验证token
    const config = vscode.workspace.getConfiguration('promptvow');
    const baseUrl = config.get<string>('apiUrl', 'https://promptvow.com');
    
    const url = new URL(`${baseUrl}/api/general-prompts`);
    url.searchParams.append('key', token);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // 401或403表示token无效
    if (response.status === 401 || response.status === 403) {
      return false;
    }
    
    // 200表示token有效
    if (response.status === 200) {
      return true;
    }
    
    // 500等服务器错误，无法确定token是否有效
    console.warn(`Token verification returned status ${response.status}`);
    return null;
  } catch (error) {
    console.error('Token verification failed:', error);
    // 网络错误等情况，无法确定token是否有效
    return null;
  }
}

/**
 * 设置为默认项目
 */
async function setAsDefaultProject(context: vscode.ExtensionContext, item: any): Promise<void> {
  // 获取当前工作区路径
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showWarningMessage('No workspace folder found');
    return;
  }

  const workspacePath = workspaceFolders[0].uri.fsPath;

  // 保存工作区路径到项目ID的映射
  await context.globalState.update(`defaultProject.${workspacePath}`, item.projectId);

  vscode.window.showInformationMessage(
    `Set "${item.projectName}" as default project for this workspace`,
    'OK'
  );

  // 刷新项目视图
  projectProvider.refresh();
}

/**
 * 选择项目
 */
async function selectProject(): Promise<void> {
  console.log('selectProject command called');
  try {
    console.log('Fetching projects...');
    const projects = await apiClient.getProjects();
    console.log(`Found ${projects.length} projects`);
    
    if (projects.length === 0) {
      vscode.window.showInformationMessage(
        '暂无项目，请先在网页版 PromptVow 创建项目',
        '打开网页版'
      ).then(selection => {
        if (selection === '打开网页版') {
          vscode.env.openExternal(vscode.Uri.parse('https://promptvow.com/projects'));
        }
      });
      return;
    }

    const selected = await vscode.window.showQuickPick(
      projects.map(p => ({
        label: p.name,
        description: `ID: ${p.id}`,
        detail: `创建于: ${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}`,
        projectId: p.id,
        projectName: p.name
      })),
      {
        placeHolder: '选择一个项目查看提示词',
        matchOnDescription: true,
        matchOnDetail: true
      }
    );

    if (selected) {
      console.log(`User selected project: ${selected.projectName} (${selected.projectId})`);
      await projectProvider.selectProject(selected.projectId);
      vscode.window.showInformationMessage(`已切换到项目: ${selected.projectName}`);
      
      // 保存为默认项目
      await setAsDefaultProject(extensionContext, { projectId: selected.projectId, projectName: selected.projectName });
    }
  } catch (error) {
    console.error('Failed to select project:', error);
    vscode.window.showErrorMessage(`选择项目失败: ${error}`);
  }
}

/**
 * 完成任务：将提示词状态设置为COMPLETED
 */
async function completeTask(prompt: any): Promise<void> {
  if (!authManager.isAuthenticated()) {
    vscode.window.showWarningMessage('请先进行认证');
    return;
  }

  try {
    // 调用API完成任务
    const updatedPrompt = await apiClient.completeTask(prompt.id);
    
    // 刷新列表
    projectProvider.refresh();
    
    vscode.window.showInformationMessage('任务已完成！提示词状态已更新为"已开发"');
  } catch (error) {
    vscode.window.showErrorMessage(`完成任务失败: ${error}`);
  }
}

/**
 * 新增提示词：显示输入框添加新提示词
 */
async function addPrompt(): Promise<void> {
  if (!authManager.isAuthenticated()) {
    vscode.window.showWarningMessage('请先进行认证');
    return;
  }

  // 获取当前选中的项目ID
  const currentProjectId = (projectProvider as any).selectedProjectId;
  if (!currentProjectId) {
    vscode.window.showWarningMessage('请先选择一个项目');
    return;
  }

  // 显示输入框
  const content = await vscode.window.showInputBox({
    placeHolder: '输入提示词内容...',
    prompt: '请输入新的提示词内容',
    value: '',
    ignoreFocusOut: true
  });

  if (!content || content.trim().length === 0) {
    return;
  }

  const trimmedContent = content.trim();

  try {
    // 调用API创建提示词
    await apiClient.createProjectPrompt(currentProjectId, {
      title: trimmedContent.substring(0, 50), // 使用内容前50字符作为标题
      content: trimmedContent,
      status: 'IN_PROGRESS',
      tags: '', // tags必须是字符串格式
      notes: '' // 添加notes字段
    });

    // 刷新列表
    projectProvider.refresh();
    
    vscode.window.showInformationMessage('提示词添加成功！');
  } catch (error: any) {
    console.error('添加提示词失败:', error);
    let errorMessage = '添加提示词失败';
    if (error?.message) {
      errorMessage += `: ${error.message}`;
    } else if (error?.details) {
      errorMessage += `: ${JSON.stringify(error.details)}`;
    } else if (typeof error === 'object') {
      errorMessage += `: ${JSON.stringify(error)}`;
    } else {
      errorMessage += `: ${String(error)}`;
    }
    vscode.window.showErrorMessage(errorMessage);
  }
}

/**
 * 停用扩展
 */
export function deactivate() {
  console.log('PromptVow extension is now deactivated!');
}
