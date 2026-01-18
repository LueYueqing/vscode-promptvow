# VS Code 插件使用指南

## 概述

PromptVow VS Code 插件已成功发布到 Visual Studio Marketplace，现在你可以在 VS Code 中直接管理你的 AI 提示词。

## 安装插件

### 方式一：从 Marketplace 安装（推荐）

1. 打开 VS Code
2. 进入扩展视图（`Ctrl+Shift+X` 或 `Cmd+Shift+X`）
3. 搜索 "PromptVow"
4. 点击 "Install" 安装

### 方式二：从 VSIX 文件安装

如果你已经打包了 .vsix 文件：

```bash
code --install-extension extension/VSCode/promptvow-0.1.0.vsix
```

## 配置插件

### 1. 配置 API 地址

插件默认连接到 `https://promptvow.com`（生产环境）。如果你需要连接到其他地址，可以修改配置：

1. 打开 VS Code 设置（`Ctrl+,` 或 `Cmd+,`）
2. 搜索 "promptvow"
3. 找到 "PromptVow: Api Url" 配置项
4. 修改为你的应用 API 地址，例如：
   - 生产环境：`https://promptvow.com`
   - 测试环境：`https://test.promptvow.com`

### 2. 获取 API Key

为了使用插件，你需要从 PromptVow 应用获取 API Key：

1. 登录你的 PromptVow 应用
2. 进入 "API" 页面
3. 点击 "创建 API Key" 按钮
4. 输入 API Key 名称（例如："VS Code 插件"）
5. 复制生成的 API Key

### 3. 配置 API Key

1. 打开 VS Code 设置（`Ctrl+,` 或 `Cmd+,`）
2. 搜索 "promptvow"
3. 找到 "PromptVow: Api Key" 配置项
4. 粘贴刚才复制的 API Key

## 使用插件

### 基本功能

#### 1. 查看提示词

- 点击左侧活动栏的 PromptVow 图标
- 在 "Prompts" 视图中查看所有通用提示词
- 点击刷新按钮重新加载数据

#### 2. 搜索提示词

- 使用快捷键 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (Mac)
- 输入搜索关键词
- 选择要插入的提示词

#### 3. 插入提示词

- 在左侧 PromptVow 面板中双击提示词
- 或右键点击提示词，选择 "Insert Prompt"
- 提示词内容将插入到当前编辑器光标位置

#### 4. 保存选中文本为提示词

1. 在编辑器中选中要保存的文本
2. 右键点击，选择 "Save Selection as Prompt"
3. 输入提示词标题
4. 点击确认保存

### 快捷键

| 功能 | Windows/Linux | Mac |
|------|--------------|-----|
| 搜索提示词 | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| 插入提示词 | `Ctrl+Shift+I` | `Cmd+Shift+I` |

## API 端点说明

插件通过以下 API 端点与你的应用通信：

### 通用提示词

- `GET /api/general-prompts?key={apiKey}` - 获取通用提示词列表
  - 参数：`search`（搜索关键词）、`category`（分类）、`isFavorite`（是否收藏）
- `POST /api/general-prompts?key={apiKey}` - 创建通用提示词

### 项目管理

- `GET /api/projects?key={apiKey}` - 获取项目列表
- `GET /api/projects/{id}/prompts?key={apiKey}` - 获取项目下的提示词
- `POST /api/projects/{id}/prompts?key={apiKey}` - 创建项目提示词

### 提示词操作

- `PATCH /api/prompts/{id}?key={apiKey}` - 更新提示词
- `DELETE /api/prompts/{id}?key={apiKey}` - 删除提示词

## 开发和调试

### 本地开发

如果你想基于本地开发环境测试插件：

1. 启动你的 Next.js 应用：
   ```bash
   npm run dev
   ```

2. 确保应用运行在 `https://promptvow.com`

3. 插件配置保持默认 API 地址即可

### 调试插件

1. 在 VS Code 中打开 `extension/VSCode` 目录
2. 按 `F5` 启动扩展开发主机
3. 在新打开的 VS Code 窗口中测试插件功能

## 常见问题

### Q: 插件无法连接到 API？

**A:** 检查以下几点：
1. 确认 API 地址配置正确
2. 确认应用正在运行
3. 确认 API Key 有效且未过期
4. 检查网络连接

### Q: API Key 从哪里获取？

**A:** 登录 PromptVow 应用，进入 API 页面，创建新的 API Key。

### Q: 如何更新插件？

**A:** 插件会自动更新。你也可以手动检查更新：
1. 进入扩展视图
2. 找到 PromptVow 插件
3. 点击更新按钮

### Q: 插件支持哪些 API？

**A:** 目前支持：
- 通用提示词库
- 项目提示词库
- 提示词的增删改查
- 搜索和过滤功能

### Q: 可以在多个 VS Code 实例中使用同一个 API Key 吗？

**A:** 可以。同一个 API Key 可以在多个 VS Code 实例中使用。

## 技术支持

如有问题，请通过以下方式联系我们：

- **GitHub/Gitee Issues**: 在项目仓库提交问题
- **邮箱**: contact@promptvow.com

## 更新日志

### v0.1.0 (2026-01-18)

- 初始版本发布
- 支持通用提示词管理
- 支持项目提示词管理
- 支持搜索和过滤
- 支持 API Key 认证
