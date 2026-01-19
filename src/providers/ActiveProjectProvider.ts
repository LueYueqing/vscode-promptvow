import * as vscode from 'vscode';
import { ApiClient } from '../api/client';
import { AuthManager } from '../utils/auth';

export class ActiveProjectProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'promptvow.activeProject';
    private _view?: vscode.WebviewView;

    private selectedProjectId: string | null = null;
    private selectedProjectName: string | null = null;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly apiClient: ApiClient,
        private readonly authManager: AuthManager,
        private readonly context: vscode.ExtensionContext
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'saveToken':
                    await this.authManager.setToken(data.value);
                    await this.refresh();
                    vscode.commands.executeCommand('promptvow.refreshPrompts');
                    break;
                case 'changeProject':
                    await this.selectProject(data.id, data.name);
                    const workspaceFolders = vscode.workspace.workspaceFolders;
                    if (workspaceFolders) {
                        const workspacePath = workspaceFolders[0].uri.fsPath;
                        await this.context.globalState.update(`defaultProject.${workspacePath}`, {
                            id: data.id,
                            name: data.name
                        });
                    }
                    vscode.commands.executeCommand('promptvow.onProjectSelected', data.name);
                    break;
                case 'addPrompt':
                    await this._handleAddPrompt(data.value);
                    break;
                case 'copyPrompt':
                    if (data.value) {
                        await vscode.env.clipboard.writeText(data.value);
                        vscode.window.showInformationMessage('已复制');
                    }
                    break;
                case 'completePrompt':
                    await this._handleCompletePrompt(data.value);
                    break;
                case 'refresh':
                    await this.refresh();
                    break;
            }
        });

        this.loadPersistedProject();
    }

    private async loadPersistedProject() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            const workspacePath = workspaceFolders[0].uri.fsPath;
            const saved = this.context.globalState.get<any>(`defaultProject.${workspacePath}`);
            if (saved) {
                this.selectedProjectId = typeof saved === 'string' ? saved : saved.id;
                this.selectedProjectName = typeof saved === 'string' ? null : saved.name;
            }
        }
        this.updateWebview();
    }

    public async selectProject(id: string, name: string) {
        this.selectedProjectId = id;
        this.selectedProjectName = name;
        await this.refresh();
    }

    public async refresh() {
        if (this._view) {
            this.updateWebview();
        }
    }

    private async updateWebview() {
        if (!this._view) return;

        const isAuthenticated = this.authManager.isAuthenticated();

        try {
            this._view.webview.postMessage({ type: 'setLoading', value: true });

            let projects: any[] = [];
            let prompts: any[] = [];

            if (isAuthenticated) {
                projects = await this.apiClient.getProjects();
                if (this.selectedProjectId) {
                    prompts = await this.apiClient.getProjectPrompts(this.selectedProjectId, 'IN_PROGRESS');
                }
            }

            this._view.webview.postMessage({
                type: 'render',
                isAuthenticated,
                projects,
                selectedId: this.selectedProjectId,
                prompts
            });
        } catch (error: any) {
            this._view.webview.postMessage({ type: 'renderError', value: error.message });
        } finally {
            this._view.webview.postMessage({ type: 'setLoading', value: false });
        }
    }

    private async _handleAddPrompt(content: string) {
        if (!this.selectedProjectId) return;
        try {
            await this.apiClient.createProjectPrompt(this.selectedProjectId, {
                title: content.substring(0, 50),
                content: content,
                status: 'IN_PROGRESS',
                tags: '',
                notes: ''
            });
            await this.refresh();
        } catch (error: any) {
            vscode.window.showErrorMessage('添加失败: ' + error.message);
        }
    }

    private async _handleCompletePrompt(id: string) {
        try {
            await this.apiClient.completeTask(id);
            await this.refresh();
        } catch (error: any) {
            vscode.window.showErrorMessage('操作失败: ' + error.message);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); padding: 12px; margin: 0; }
        .setup-card { background: var(--vscode-button-background); color: var(--vscode-button-foreground); padding: 12px; border-radius: 6px; margin-bottom: 20px; }
        .setup-card h2 { margin: 0 0 8px 0; font-size: 14px; }
        .setup-input-group { display: flex; gap: 4px; }
        .setup-input-group input { flex: 1; border: none; padding: 6px; border-radius: 4px; background: rgba(255,255,255,0.2); color: white; outline: none; font-size: 12px; }
        .setup-input-group button { background: white; color: var(--vscode-button-background); border: none; padding: 6px 10px; border-radius: 4px; font-weight: bold; cursor: pointer; }

        select, textarea { 
            width: 100%; box-sizing: border-box; background: var(--vscode-input-background); color: var(--vscode-input-foreground); 
            border: 1px solid var(--vscode-input-border); padding: 8px; border-radius: 4px; font-family: inherit; font-size: 13px; margin-bottom: 12px;
        }
        select:focus, textarea:focus { outline: none; border-color: var(--vscode-focusBorder); }
        textarea { min-height: 60px; resize: none; margin-bottom: 8px; }
        
        .prompt-card { border: 1px solid var(--vscode-widget-border); border-radius: 6px; padding: 10px; margin-bottom: 8px; background: var(--vscode-welcomePage-tileBackground); }
        .prompt-content { 
            font-size: 12px; line-height: 1.4; color: var(--vscode-foreground); margin-bottom: 8px;
            display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        
        .card-footer { display: flex; justify-content: flex-end; gap: 6px; }
        .btn { padding: 4px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; border: none; }
        .btn-primary { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
        .btn-secondary { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }

        .loading { display: none; text-align: center; padding: 10px; color: var(--vscode-descriptionForeground); font-size: 11px; }
    </style>
</head>
<body>
    <div id="authArea"></div>
    <div id="mainArea"></div>
    <div id="loading" class="loading">加载中...</div>

    <script>
        const vscode = acquireVsCodeApi();
        const authArea = document.getElementById('authArea');
        const mainArea = document.getElementById('mainArea');
        const loading = document.getElementById('loading');
        
        let currentPrompts = [];

        window.addEventListener('message', event => {
            const m = event.data;
            if (m.type === 'render') {
                renderAuth(m.isAuthenticated);
                renderMain(m.isAuthenticated, m.projects, m.selectedId, m.prompts);
            } else if (m.type === 'setLoading') {
                loading.style.display = m.value ? 'block' : 'none';
            }
        });

        function renderAuth(isAuth) {
            authArea.innerHTML = isAuth ? '' : \`
                <div class="setup-card">
                    <h2>🔑 云端同步</h2>
                    <div class="setup-input-group">
                        <input id="keyInput" type="password" placeholder="粘贴您的 API Key...">
                        <button onclick="saveToken()">连接</button>
                    </div>
                </div>
            \`;
        }

        function renderMain(isAuth, projects, selectedId, prompts) {
            if (!isAuth) return;
            currentPrompts = prompts;

            let html = \`
                <select onchange="vscode.postMessage({type: 'changeProject', id: this.value, name: this.options[this.selectedIndex].text})">
                    <option value="" \${!selectedId ? 'selected' : ''} disabled>-- 选择项目 --</option>
                    \${projects.map(p => \`<option value="\${p.id}" \${p.id === selectedId ? 'selected' : ''}>\${p.name}</option>\`).join('')}
                </select>
            \`;

            if (selectedId) {
                html += \`<textarea id="promptInput" placeholder="快速输入提示词... (Ctrl+Enter 保存并同步)"></textarea>\`;
                
                prompts.forEach((p, index) => {
                    html += \`
                        <div class="prompt-card">
                            <div class="prompt-content">\${escapeHtml(p.content)}</div>
                            <div class="card-footer">
                                <button class="btn btn-secondary" onclick="copyPrompt(\${index})">复制</button>
                                <button class="btn btn-primary" onclick="completePrompt('\${p.id}')">完成</button>
                            </div>
                        </div>
                    \`;
                });
            }

            mainArea.innerHTML = html;

            const input = document.getElementById('promptInput');
            if (input) {
                input.focus();
                input.addEventListener('keydown', e => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        const val = input.value.trim();
                        if (val) { vscode.postMessage({type: 'addPrompt', value: val}); input.value = ''; }
                    }
                });
            }
        }

        function copyPrompt(index) {
            const p = currentPrompts[index];
            if (p) vscode.postMessage({type: 'copyPrompt', value: p.content});
        }

        function completePrompt(id) {
            vscode.postMessage({type: 'completePrompt', value: id});
        }

        function saveToken() {
            const val = document.getElementById('keyInput').value.trim();
            if (val) vscode.postMessage({type: 'saveToken', value: val});
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    </script>
</body>
</html>`;
    }
}
