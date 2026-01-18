# PromptVow VS Code Extension

[![Version](https://img.shields.io/visual-studio-marketplace/v/promptvow.promptvow)](https://marketplace.visualstudio.com/items?itemName=promptvow.promptvow)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/promptvow.promptvow)](https://marketplace.visualstudio.com/items?itemName=promptvow.promptvow)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/promptvow.promptvow)](https://marketplace.visualstudio.com/items?itemName=promptvow.promptvow)

智能管理AI编程提示词，提升编程效率。

## 功能特性

### 🔥 核心功能
- **Prompt管理** - 创建、编辑、删除和组织AI提示词
- **快速插入** - 一键插入提示词到代码编辑器
- **智能搜索** - 按标题、内容、标签快速搜索提示词
- **项目组织** - 按项目分类管理提示词
- **云端同步** - 与PromptVow平台实时同步

### ⚡ 快捷操作
- `Ctrl+Shift+P` (Windows/Linux) / `Cmd+Shift+P` (Mac) - 搜索提示词
- `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Shift+I` (Mac) - 插入提示词
- 右键菜单 - 保存选中文本为提示词

### 🌟 特色功能
- **树形视图** - 直观的提示词组织结构
- **实时预览** - 查看提示词详情
- **团队协作** - 支持团队共享和权限管理
- **版本控制** - 提示词版本管理和历史记录

## 安装

### 方式一：从VS Code Marketplace安装（推荐）
1. 打开VS Code
2. 进入扩展视图（Ctrl+Shift+X）
3. 搜索 "PromptVow"
4. 点击安装

### 方式二：从.vsix文件安装
1. 下载最新的.vsix文件
2. 在VS Code中运行 `Extensions: Install from VSIX...` 命令
3. 选择下载的.vsix文件

### 方式三：从源码安装
```bash
# 克隆仓库
git clone https://github.com/LueYueqing/vscode-promptvow.git
cd vscode-promptvow

# 安装依赖
npm install

# 编译
npm run compile

# 打包
npm run package
```

## 配置

### 认证设置
1. 点击左侧PromptVow图标
2. 点击"Authenticate with PromptVow"
3. 输入你的API Token（从PromptVow网站获取）

### API地址配置
默认连接到 `https://promptvow.com`，如需修改：
```json
{
  "promptvow.apiUrl": "https://api.promptvow.com"
}
```

## 使用指南

### 创建提示词
1. 在编辑器中选中要保存的文本
2. 右键点击，选择"Save Selection as Prompt"
3. 输入标题并保存

### 插入提示词
1. 打开PromptVow面板（左侧图标）
2. 浏览或搜索提示词
3. 双击提示词或右键选择"Insert Prompt"

### 搜索提示词
1. 使用快捷键 `Ctrl+Shift+P`
2. 输入搜索关键词
3. 选择要插入的提示词

### 项目管理
1. 在PromptVow面板中切换到"Projects"视图
2. 查看和管理你的项目
3. 点击项目查看相关提示词

## 开发

### 环境要求
- Node.js 18+
- VS Code 1.75.0+
- TypeScript 5.1+

### 开发步骤
```bash
# 安装依赖
npm install

# 监听模式编译
npm run watch

# 运行测试
npm test

# 代码检查
npm run lint
```

### 调试
1. 在VS Code中打开扩展目录
2. 按 `F5` 启动扩展开发主机
3. 在新窗口中测试扩展功能

## 发布

### 准备发布
```bash
# 编译项目
npm run compile

# 打包扩展
npm run package
```

### 发布到Marketplace
```bash
# 安装vsce工具
npm install -g vsce

# 发布扩展
vsce publish
```

## 项目结构

```
extension/VSCode/
├── src/
│   ├── extension.ts          # 扩展入口
│   ├── api/
│   │   └── client.ts         # API客户端
│   ├── commands/
│   │   ├── insertPrompt.ts   # 插入命令
│   │   ├── savePrompt.ts     # 保存命令
│   │   └── searchPrompts.ts  # 搜索命令
│   ├── panels/
│   │   └── PromptTreePanel.ts # 树形面板
│   ├── providers/
│   │   └── PromptProvider.ts # 数据提供者
│   ├── types/
│   │   └── index.ts          # 类型定义
│   └── utils/
│       └── auth.ts           # 认证工具
├── package.json              # 配置文件
├── tsconfig.json             # TypeScript配置
└── README.md                 # 说明文档
```

## 常见问题

### Q: 如何获取API Token？
A: 登录PromptVow网站，在设置页面生成API Token。

### Q: 提示词如何同步？
A: 提示词会自动与PromptVow平台同步，确保网络连接正常。

### Q: 支持哪些AI平台？
A: 目前支持所有基于文本的AI平台，如OpenAI、Claude等。

### Q: 可以离线使用吗？
A: 需要网络连接来访问PromptVow API，暂不支持离线模式。

## 贡献

欢迎贡献代码、报告问题或提出建议！

### 贡献方式
1. Fork本项目
2. 创建特性分支
3. 提交更改
4. 发起Pull Request

## 许可证

MIT License

## 联系我们

- **项目主页**: [https://promptvow.com](https://promptvow.com)
- **GitHub仓库**: [https://github.com/LueYueqing/vscode-promptvow](https://github.com/LueYueqing/vscode-promptvow)
- **问题反馈**: [GitHub Issues](https://github.com/LueYueqing/vscode-promptvow/issues)
- **邮箱**: contact@promptvow.com

## 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**PromptVow** - 让承诺，秒级兑现 🚀
