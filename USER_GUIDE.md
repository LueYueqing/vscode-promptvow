# PromptVow 插件用户指南

## 安装后如何看到插件

安装 PromptVow 插件后，您可以在 VS Code 中通过以下方式访问它：

### 1. 活动栏图标（主要入口）

在 VS Code 左侧的活动栏（Activity Bar）中，您会看到一个 PromptVow 图标：

```
📦 ← 点击这个图标打开 PromptVow 面板
```

**位置说明**：
- 位于 VS Code 左侧垂直活动栏
- 图标位置可能在：文件搜索、调试、扩展 等图标旁边
- 如果未看到，请重启 VS Code

### 2. 侧边栏视图

点击 PromptVow 图标后，侧边栏会显示两个视图：

#### 📋 Prompts 视图
- 显示您所有的提示词
- 按项目分组展示
- 可以点击提示词直接插入到编辑器
- 右键提示词可以编辑或插入

#### 📁 Projects 视图
- 显示您的所有项目
- 点击项目可以查看该项目下的提示词

### 3. 命令面板快捷访问

**打开命令面板**：
- Windows/Linux: `Ctrl + Shift + P`
- Mac: `Cmd + Shift + P`

输入以下命令：

- `PromptVow: Show Prompt Panel` - 显示提示词面板
- `PromptVow: Search Prompts` - 搜索提示词
- `PromptVow: Insert Prompt` - 插入选中的提示词
- `PromptVow: Save Selection as Prompt` - 将选中的文本保存为提示词
- `PromptVow: Refresh Prompts` - 刷新提示词列表
- `PromptVow: Authenticate with PromptVow` - 认证账号

### 4. 快捷键

插件预配置了以下快捷键：

- `Ctrl + Shift + P` (Mac: `Cmd + Shift + P`) - 搜索提示词
  - 注意：这个快捷键在快速打开对话框时会被禁用
- `Ctrl + Shift + I` (Mac: `Cmd + Shift + I`) - 插入提示词

### 5. 编辑器右键菜单

在编辑器中选中文本后，右键菜单会显示：

```
PromptVow
  └─ Save Selection as Prompt
```

## 配置插件

### 步骤 1: 打开设置

1. 按 `Ctrl + ,` (Mac: `Cmd + ,`) 打开设置
2. 搜索 "PromptVow"
3. 或者直接点击左下角齿轮图标 → 设置

### 步骤 2: 配置 API 地址

在设置中找到：

```
PromptVow: Api Url
默认值: https://promptvow.com
```

如果您在服务器上部署 PromptVow，请修改为实际地址：
- 默认使用：`https://promptvow.com`

### 步骤 3: 配置 API Key

在设置中找到：

```
PromptVow: Api Key
默认值: (空)
```

**获取 API Key 的步骤**：

1. 访问 PromptVow 网站
2. 登录您的账号
3. 进入个人设置或 API 设置页面
4. 生成或复制您的 API Key
5. 粘贴到 VS Code 设置中

## 使用示例

### 示例 1: 快速插入提示词

1. 在编辑器中打开代码文件
2. 点击活动栏的 PromptVow 图标
3. 在 Prompts 视图中找到需要的提示词
4. 右键点击提示词 → 选择 "Insert Prompt"
5. 或者双击提示词直接插入
6. 或者使用快捷键 `Ctrl + Shift + I`

### 示例 2: 搜索提示词

1. 按快捷键 `Ctrl + Shift + P` (确保不在快速打开对话框中)
2. 输入提示词关键词
3. 选择要插入的提示词

### 示例 3: 保存选中文本为提示词

1. 在编辑器中选中一段代码或文本
2. 右键点击 → "Save Selection as Prompt"
3. 填写提示词信息（标题、项目等）
4. 保存

### 示例 4: 查看项目提示词

1. 点击活动栏的 PromptVow 图标
2. 切换到 "Projects" 视图
3. 点击某个项目
4. 在 "Prompts" 视图中会显示该项目的所有提示词

## 视图界面说明

### Prompts 视图

```
📋 Prompts                    [🔄] [⬇️]
├─ 📁 项目 A
│  ├─ 📄 React 组件模板
│  ├─ 📄 API 请求封装
│  └─ 📄 数据验证函数
├─ 📁 项目 B
│  ├─ 📄 Python 数据处理
│  └─ 📄 数据库查询
└─ 📄 通用提示词（未分类）
```

**图标说明**：
- 📁 文件夹 = 项目
- 📄 文档 = 提示词

**操作按钮**：
- 🔄 刷新 = 重新加载提示词列表
- ⬇️ 显示面板 = 打开完整提示词面板

### 工具栏按钮

在 Prompts 视图标题栏有两个按钮：

1. **刷新按钮 (🔄)**: 
   - 点击刷新提示词列表
   - 当您在网站上更新提示词后，点击此按钮同步

2. **显示面板按钮 (⬇️)**:
   - 在独立面板中显示提示词详情
   - 更详细的提示词预览和编辑界面

## 首次使用配置

### 完整配置流程

1. **安装插件**
   - 从 VS Code 扩展市场搜索 "PromptVow"
   - 点击安装

2. **重启 VS Code**
   - 完全退出并重新打开 VS Code

3. **配置 API**
   - 打开设置 (`Ctrl + ,`)
   - 搜索 "PromptVow"
   - 设置 API URL 和 API Key

4. **测试连接**
   - 点击活动栏的 PromptVow 图标
   - 应该能看到您的项目和提示词

5. **开始使用**
   - 在编辑器中编写代码
   - 使用快捷键或点击插入提示词

## 常见问题

### Q: 我看不到 PromptVow 图标？

**解决方案**：
1. 重启 VS Code
2. 确认插件已安装（扩展 → 已安装）
3. 检查 VS Code 版本是否 ≥ 1.75.0

### Q: 提示词列表为空？

**解决方案**：
1. 检查 API Key 是否正确配置
2. 检查 API URL 是否正确
3. 确认网络连接正常
4. 点击刷新按钮重试

### Q: 快捷键 Ctrl+Shift+P 不工作？

**原因**：这是 VS Code 的默认快捷键（打开命令面板）

**解决方案**：
1. 使用命令面板手动执行 "PromptVow: Search Prompts"
2. 或者在设置中修改快捷键：
   - 打开键盘快捷键 (`Ctrl + K, Ctrl + S`)
   - 搜索 "promptvow.searchPrompts"
   - 修改为其他快捷键，如 `Ctrl + Alt + P`

### Q: 如何自定义配置？

1. 打开 `.vscode/settings.json`
2. 添加配置：

```json
{
  "promptvow.apiUrl": "https://your-api.com",
  "promptvow.apiKey": "your-api-key-here"
}
```

## 高级功能

### 工作区配置

可以为不同工作区配置不同的 API：

1. 在项目根目录创建 `.vscode/settings.json`
2. 添加项目特定的配置

### 自动刷新

插件会在以下情况自动刷新：
- VS Code 启动时
- 配置更改后
- 手动点击刷新按钮

## 技术支持

如果遇到问题：

1. 查看输出面板：
   - 查看 → 输出 → 选择 "PromptVow" 频道
   - 查看错误日志

2. 访问项目页面：
   - Gitee: https://gitee.com/dongguan_mengyi_87371/promptvow

3. 提交 Issue：
   - 描述问题详情
   - 附上错误日志

---

**享受使用 PromptVow 提升您的编程效率！** 🚀
