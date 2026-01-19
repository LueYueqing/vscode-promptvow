import * as vscode from 'vscode';
import { ApiClient } from '../api/client';
import { AuthManager } from '../utils/auth';

export class LibraryProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'promptvow.library';
    private _view?: vscode.WebviewView;

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

        this.refresh();
    }

    public async refresh() {
        if (!this._view) return;

        const isAuthenticated = this.authManager.isAuthenticated();

        try {
            this._view.webview.postMessage({ type: 'setLoading', value: true });

            let prompts: any[] = [];
            if (isAuthenticated) {
                prompts = await this.apiClient.getGeneralPrompts({ status: 'IN_PROGRESS' });
            }

            this._view.webview.postMessage({
                type: 'render',
                isAuthenticated,
                prompts
            });
        } catch (error: any) {
            this._view.webview.postMessage({ type: 'renderError', value: error.message });
        } finally {
            this._view.webview.postMessage({ type: 'setLoading', value: false });
        }
    }

    private async _handleAddPrompt(content: string) {
        try {
            await this.apiClient.createGeneralPrompt({
                title: content.substring(0, 50),
                content: content,
                category: '其他', // 添加默认分类，防止后端报错
                status: 'IN_PROGRESS',
                tags: ''
            });
            await this.refresh();
        } catch (error: any) {
            vscode.window.showErrorMessage('添加失败: ' + error.message);
        }
    }

    private async _handleCompletePrompt(id: string) {
        try {
            await this.apiClient.completeGeneralTask(id);
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
        textarea { 
            width: 100%; box-sizing: border-box; background: var(--vscode-input-background); color: var(--vscode-input-foreground); 
            border: 1px solid var(--vscode-input-border); padding: 8px; border-radius: 4px; font-family: inherit; font-size: 13px; margin-bottom: 12px;
            min-height: 60px; resize: none;
        }
        textarea:focus { outline: none; border-color: var(--vscode-focusBorder); }
        
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
    </style>
</head>
<body>
    <div id="mainArea"></div>
    <div id="loading" class="loading">加载中...</div>

    <script>
        const vscode = acquireVsCodeApi();
        const mainArea = document.getElementById('mainArea');
        const loading = document.getElementById('loading');
        
        let currentPrompts = [];
        let currentState = vscode.getState() || {
            isAuthenticated: false,
            prompts: [],
            inputValue: ''
        };

        // 页面加载时恢复之前的状态
        if (currentState.isAuthenticated) {
            renderMain(currentState.isAuthenticated, currentState.prompts);
            // 恢复输入框内容
            setTimeout(() => {
                const input = document.getElementById('libInput');
                if (input && currentState.inputValue) {
                    input.value = currentState.inputValue;
                }
            }, 100);
        }

        window.addEventListener('message', event => {
            const m = event.data;
            if (m.type === 'render') {
                currentState = {
                    isAuthenticated: m.isAuthenticated,
                    prompts: m.prompts || [],
                    inputValue: currentState.inputValue // 保留输入框内容
                };
                vscode.setState(currentState);
                renderMain(m.isAuthenticated, m.prompts);
                // 恢复输入框内容
                setTimeout(() => {
                    const input = document.getElementById('libInput');
                    if (input && currentState.inputValue) {
                        input.value = currentState.inputValue;
                    }
                }, 100);
            } else if (m.type === 'setLoading') {
                loading.style.display = m.value ? 'block' : 'none';
            }
        });

        function renderMain(isAuth, prompts) {
            if (!isAuth) {
                mainArea.innerHTML = '<div class="setup-msg">请在上方 ACTIVE PROJECT 视图中完成认证以查看库</div>';
                return;
            }
            currentPrompts = prompts;

            let html = \`
                <textarea id="libInput" placeholder="存入通用库... (Ctrl+Enter 快速保存)"></textarea>
            \`;

            if (prompts.length === 0) {
                html += \`<div class="setup-msg">通用库目前为空</div>\`;
            } else {
                prompts.forEach((p, index) => {
                    html += \`
                        <div class="prompt-card">
                            <div class="prompt-content" title="\${escapeHtml(p.content)}">\${escapeHtml(p.content)}</div>
                            <div class="card-footer">
                                <button class="btn btn-secondary" onclick="copyPrompt(\${index})">复制</button>
                                <button class="btn btn-secondary" onclick="completePrompt(event, '\${p.id}')">删除</button>
                            </div>
                        </div>
                    \`;
                });
            }

            mainArea.innerHTML = html;

            const input = document.getElementById('libInput');
            if (input) {
                input.addEventListener('keydown', e => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        const val = input.value.trim();
                        if (val) { 
                            vscode.postMessage({type: 'addPrompt', value: val}); 
                            input.value = ''; 
                            currentState.inputValue = '';
                            vscode.setState(currentState);
                        }
                    }
                });
                // 保存输入框内容
                input.addEventListener('input', e => {
                    currentState.inputValue = e.target.value;
                    vscode.setState(currentState);
                });
            }
        }

        function copyPrompt(index) {
            const p = currentPrompts[index];
            if (p) vscode.postMessage({type: 'copyPrompt', value: p.content});
        }

        function completePrompt(event, id) {
            const btn = event.target;
            if (btn.innerText === '删除') {
                btn.innerText = '确认？';
                btn.classList.replace('btn-secondary', 'btn-danger');
                setTimeout(() => {
                    if (btn && btn.innerText === '确认？') {
                        btn.innerText = '删除';
                        btn.classList.replace('btn-danger', 'btn-secondary');
                    }
                }, 3000);
                return;
            }

            // 乐观更新：立即从界面移除卡片
            const card = btn ? btn.closest('.prompt-card') : null;
            if (card) {
                card.style.opacity = '0.3';
                card.style.pointerEvents = 'none';
            }
            vscode.postMessage({type: 'completePrompt', value: id});
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
