import * as vscode from 'vscode';
import { ApiClient } from '../api/client';
import { AuthManager } from '../utils/auth';

export class MainProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'promptvow.mainView';
    private _view?: vscode.WebviewView;

    private selectedProjectId: string | null = null;
    private selectedProjectName: string | null = null;

    // Tab state: 'project' or 'library'
    private activeTab: 'project' | 'library' = 'project';

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
                // Tab Switching
                case 'switchTab':
                    this.activeTab = data.value;
                    await this.refresh();
                    break;

                // Common
                case 'saveToken':
                    await this.authManager.setToken(data.value);
                    await this.refresh();
                    vscode.commands.executeCommand('promptvow.refreshPrompts');
                    break;
                case 'openUrl':
                    vscode.env.openExternal(vscode.Uri.parse(data.value));
                    break;
                case 'copyPrompt':
                    if (data.value) {
                        await vscode.env.clipboard.writeText(data.value);
                        vscode.window.showInformationMessage('Copied to clipboard');
                    }
                    break;

                // Active Project Actions
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
                case 'addProjectPrompt':
                    await this._handleAddProjectPrompt(data.value);
                    break;
                case 'completeProjectPrompt':
                    await this._handleCompleteProjectPrompt(data.value);
                    break;

                // Library Actions
                case 'addLibraryPrompt':
                    this._handleAddLibraryPrompt(data.value);
                    break;
                case 'completeLibraryPrompt':
                    this._handleCompleteLibraryPrompt(data.value);
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
        // Also switch to project tab if selecting a project
        this.activeTab = 'project';
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
            let projectPrompts: any[] = [];
            let libraryPrompts: any[] = [];

            if (isAuthenticated) {
                if (this.activeTab === 'project') {
                    projects = await this.apiClient.getProjects();
                    if (this.selectedProjectId) {
                        projectPrompts = await this.apiClient.getProjectPrompts(this.selectedProjectId, 'IN_PROGRESS');
                    }
                } else if (this.activeTab === 'library') {
                    libraryPrompts = await this.apiClient.getGeneralPrompts({ status: 'IN_PROGRESS' });
                }
            }

            this._view.webview.postMessage({
                type: 'render',
                activeTab: this.activeTab,
                isAuthenticated,
                projects,
                selectedId: this.selectedProjectId,
                projectPrompts,
                libraryPrompts
            });
        } catch (error: any) {
            this._view.webview.postMessage({ type: 'renderError', value: error.message });
        } finally {
            this._view.webview.postMessage({ type: 'setLoading', value: false });
        }
    }

    private async _handleAddProjectPrompt(content: string) {
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
            vscode.window.showErrorMessage('Add failed: ' + error.message);
        }
    }

    private async _handleCompleteProjectPrompt(id: string) {
        try {
            await this.apiClient.completeTask(id);
            await this.refresh();
        } catch (error: any) {
            vscode.window.showErrorMessage('Action failed: ' + error.message);
        }
    }

    private async _handleAddLibraryPrompt(content: string) {
        try {
            await this.apiClient.createGeneralPrompt({
                title: content.substring(0, 50),
                content: content,
                category: 'Others',
                status: 'IN_PROGRESS',
                tags: ''
            });
            await this.refresh();
        } catch (error: any) {
            vscode.window.showErrorMessage('Add failed: ' + error.message);
        }
    }

    private async _handleCompleteLibraryPrompt(id: string) {
        try {
            await this.apiClient.completeGeneralTask(id);
            await this.refresh();
        } catch (error: any) {
            vscode.window.showErrorMessage('Action failed: ' + error.message);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); padding: 0; margin: 0; display: flex; flex-direction: column; height: 100vh; }
        
        /* Tab Bar */
        .tabs {
            display: flex;
            border-bottom: 1px solid var(--vscode-panel-border);
            background: var(--vscode-sideBar-background);
            padding: 0 8px;
        }
        .tab {
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            opacity: 0.7;
            font-size: 13px;
        }
        .tab:hover { opacity: 1; }
        .tab.active {
            border-bottom-color: var(--vscode-panelTitle-activeBorder);
            font-weight: bold;
            opacity: 1;
            color: var(--vscode-panelTitle-activeForeground);
        }

        /* Content Area */
        .content {
            flex: 1;
            padding: 12px;
            overflow-y: auto;
        }
        
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
        
        .prompt-card { 
            border: 1px solid var(--vscode-widget-border); 
            border-radius: 6px; 
            padding: 10px; 
            margin-bottom: 8px; 
            background: var(--vscode-welcomePage-tileBackground);
            transition: opacity 0.2s ease-out;
        }
        .prompt-content { 
            font-size: 12px; line-height: 1.4; color: var(--vscode-foreground); margin-bottom: 8px;
            display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        
        .card-footer { display: flex; justify-content: flex-end; gap: 6px; }
        .btn { padding: 4px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; border: none; }
        .btn-primary { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
        .btn-secondary { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }
        .btn-danger { background: #e51400; color: white; }

        .loading { display: none; text-align: center; padding: 10px; color: var(--vscode-descriptionForeground); font-size: 11px; }
        .setup-msg { text-align: center; padding: 20px; color: var(--vscode-descriptionForeground); font-size: 12px; }

        a { color: var(--vscode-textLink-foreground); text-decoration: none; word-break: break-all; }
        a:hover { text-decoration: underline; }
        
        .prompt-card.selected {
            border-color: var(--vscode-focusBorder);
            background-color: var(--vscode-list-inactiveSelectionBackground);
        }
        
        .hidden { display: none !important; }
    </style>
</head>
<body>
    <div class="tabs">
        <div class="tab active" id="tab-project" onclick="switchTab('project')">Active Project</div>
        <div class="tab" id="tab-library" onclick="switchTab('library')">Prompts Library</div>
    </div>

    <div id="authArea" style="padding: 12px;"></div>
    
    <div id="mainContent" class="content">
        <!-- Project View -->
        <div id="view-project">
            <div id="project-selector-area"></div>
            <div id="project-prompts-area"></div>
        </div>
        
        <!-- Library View -->
        <div id="view-library" class="hidden">
            <div id="library-prompts-area"></div>
        </div>
    </div>

    <div id="loading" class="loading">Loading...</div>

    <script>
        const vscode = acquireVsCodeApi();
        const authArea = document.getElementById('authArea');
        const loading = document.getElementById('loading');
        
        let currentState = vscode.getState() || {
            isAuthenticated: false,
            activeTab: 'project',
            projects: [],
            selectedId: null,
            projectPrompts: [],
            libraryPrompts: [],
            projectInputValue: '',
            libraryInputValue: '',
            selectedCardId: null
        };

        // Initialize
        renderAll();

        window.addEventListener('message', event => {
            const m = event.data;
            if (m.type === 'render') {
                currentState = {
                    ...currentState,
                    isAuthenticated: m.isAuthenticated,
                    activeTab: m.activeTab,
                    projects: m.projects || [],
                    selectedId: m.selectedId,
                    projectPrompts: m.projectPrompts || [],
                    libraryPrompts: m.libraryPrompts || [],
                };
                vscode.setState(currentState);
                renderAll();
            } else if (m.type === 'setLoading') {
                loading.style.display = m.value ? 'block' : 'none';
            }
        });

        function renderAll() {
            renderTabs();
            renderAuth();
            
            if (currentState.isAuthenticated) {
                renderProjectView();
                renderLibraryView();
            } else {
                // If not authenticated, clear detailed views
                document.getElementById('project-prompts-area').innerHTML = '';
                document.getElementById('library-prompts-area').innerHTML = '<div class="setup-msg">请先完成认证</div>';
            }
            
            // Restore Inputs
            restoreInputs();
        }

        function switchTab(tab) {
            vscode.postMessage({type: 'switchTab', value: tab});
        }

        function renderTabs() {
            document.getElementById('tab-project').className = 'tab ' + (currentState.activeTab === 'project' ? 'active' : '');
            document.getElementById('tab-library').className = 'tab ' + (currentState.activeTab === 'library' ? 'active' : '');
            
            document.getElementById('view-project').className = currentState.activeTab === 'project' ? '' : 'hidden';
            document.getElementById('view-library').className = currentState.activeTab === 'library' ? '' : 'hidden';
        }

        function renderAuth() {
            const isAuth = currentState.isAuthenticated;
            authArea.innerHTML = isAuth ? '' : \`
                <div class="setup-card">
                    <h2>🔑 云端同步</h2>
                    <div class="setup-input-group">
                        <input id="keyInput" type="password" placeholder="粘贴您的 API Key...">
                        <button onclick="saveToken()">连接</button>
                    </div>
                </div>
            \`;
            authArea.style.display = isAuth ? 'none' : 'block';
        }

        function renderProjectView() {
            const projects = currentState.projects;
            const selectedId = currentState.selectedId;
            const prompts = currentState.projectPrompts;

            // Selector
            const selectorArea = document.getElementById('project-selector-area');
            selectorArea.innerHTML = \`
                <select onchange="vscode.postMessage({type: 'changeProject', id: this.value, name: this.options[this.selectedIndex].text})">
                    <option value="" \${!selectedId ? 'selected' : ''} disabled>-- 选择项目 --</option>
                    \${projects.map(p => \`<option value="\${p.id}" \${p.id == selectedId ? 'selected' : ''}>\${p.name}</option>\`).join('')}
                </select>
            \`;

            // Prompts
            const promptsArea = document.getElementById('project-prompts-area');
            if (selectedId) {
                let html = \`<textarea id="projectInput" placeholder="添加项目提示词... (Ctrl+Enter 保存)"></textarea>\`;
                prompts.forEach((p, index) => {
                    html += createPromptCard(p, index, 'project');
                });
                promptsArea.innerHTML = html;
                setupProjectInput();
            } else {
                promptsArea.innerHTML = '<div class="setup-msg">请先选择一个项目</div>';
            }
        }

        function renderLibraryView() {
            const prompts = currentState.libraryPrompts;
            const area = document.getElementById('library-prompts-area');
            
            let html = \`<textarea id="libraryInput" placeholder="存入通用库... (Ctrl+Enter 保存)"></textarea>\`;
            
            if (prompts.length === 0) {
                html += \`<div class="setup-msg">通用库目前为空</div>\`;
            } else {
                prompts.forEach((p, index) => {
                    html += createPromptCard(p, index, 'library');
                });
            }
            area.innerHTML = html;
            setupLibraryInput();
        }

        function createPromptCard(p, index, type) {
            const copyBtn = \`<button class="btn btn-secondary" onclick="copyPrompt('\${escapeHtml(p.content)}')">复制</button>\`;
            const actionBtn = type === 'project' 
                ? \`<button class="btn btn-primary" onclick="completePrompt(event, '\${p.id}', 'project')">完成</button>\`
                : \`<button class="btn btn-secondary" onclick="completePrompt(event, '\${p.id}', 'library')">删除</button>\`;

            return \`
                <div class="prompt-card" id="card-\${p.id}" onclick="selectCard('\${p.id}')">
                    <div class="prompt-content" title="\${escapeHtml(p.content)}">\${formatWithLinks(p.content)}</div>
                    <div class="card-footer">
                        \${copyBtn}
                        \${actionBtn}
                    </div>
                </div>
            \`;
        }

        // --- Input Handling ---

        function setupProjectInput() {
            const input = document.getElementById('projectInput');
            if (!input) return;
            
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    if (input.value.trim()) {
                        vscode.postMessage({type: 'addProjectPrompt', value: input.value.trim()});
                        input.value = '';
                        currentState.projectInputValue = '';
                        vscode.setState(currentState);
                    }
                }
            });
            input.addEventListener('input', e => {
                currentState.projectInputValue = e.target.value;
                vscode.setState(currentState);
            });
        }

        function setupLibraryInput() {
            const input = document.getElementById('libraryInput');
            if (!input) return;
            
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    if (input.value.trim()) {
                        vscode.postMessage({type: 'addLibraryPrompt', value: input.value.trim()});
                        input.value = '';
                        currentState.libraryInputValue = '';
                        vscode.setState(currentState);
                    }
                }
            });
            input.addEventListener('input', e => {
                currentState.libraryInputValue = e.target.value;
                vscode.setState(currentState);
            });
        }

        function restoreInputs() {
            setTimeout(() => {
                const pInput = document.getElementById('projectInput');
                if (pInput && currentState.projectInputValue) pInput.value = currentState.projectInputValue;
                
                const lInput = document.getElementById('libraryInput');
                if (lInput && currentState.libraryInputValue) lInput.value = currentState.libraryInputValue;
                
                if (currentState.selectedCardId) {
                    const el = document.getElementById('card-' + currentState.selectedCardId);
                    if (el) el.classList.add('selected');
                }
            }, 50);
        }

        // --- Actions ---

        function saveToken() {
            const val = document.getElementById('keyInput').value.trim();
            if (val) vscode.postMessage({type: 'saveToken', value: val});
        }

        function copyPrompt(content) {
            vscode.postMessage({type: 'copyPrompt', value: content});
        }

        function completePrompt(event, id, type) {
            const btn = event.target;
            const originalText = type === 'project' ? '完成' : '删除';
            const originalClass = type === 'project' ? 'btn-primary' : 'btn-secondary';

            if (btn.innerText === originalText) {
                btn.innerText = '确认？';
                btn.classList.replace(originalClass, 'btn-danger');
                setTimeout(() => {
                    if (btn && btn.innerText === '确认？') {
                        btn.innerText = originalText;
                        btn.classList.replace('btn-danger', originalClass);
                    }
                }, 3000);
                return;
            }

            // Optimistic UI update
            const card = btn.closest('.prompt-card');
            if (card) {
                card.style.opacity = '0.3';
                card.style.pointerEvents = 'none';
            }

            const messageType = type === 'project' ? 'completeProjectPrompt' : 'completeLibraryPrompt';
            vscode.postMessage({type: messageType, value: id});
        }

        function selectCard(id) {
            document.querySelectorAll('.prompt-card').forEach(e => e.classList.remove('selected'));
            const el = document.getElementById('card-' + id);
            if (el) el.classList.add('selected');
            
            currentState.selectedCardId = id;
            vscode.setState(currentState);
        }

        function openUrl(url) {
            if (url) vscode.postMessage({type: 'openUrl', value: url});
        }

        function formatWithLinks(text) {
            if (!text) return '';
            const urlRegex = /(https?:\\/\\/[^\\s]+)/g;
            return text.split(urlRegex).map(part => {
                if (part.match(/^https?:\\/\\//)) {
                    const safeUrl = escapeHtml(part);
                    const jsUrl = safeUrl.replace(/'/g, "\\\\'"); 
                    return \`<a href="javascript:void(0)" onclick="openUrl('\${jsUrl}')">\${safeUrl}</a>\`;
                }
                return escapeHtml(part);
            }).join('');
        }

        function escapeHtml(text) {
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
    </script>
</body>
</html>`;
    }
}
