# PromptVow VS Code Extension - Quick Start Guide

## 🚀 快速开始

### 1. 安装依赖

```bash
cd extension/VSCode
npm install
```

### 2. 编译项目

```bash
npm run compile
```

### 3. 运行扩展（开发模式）

在VS Code中：
1. 按 `F5` 启动扩展开发主机
2. 在新窗口中测试扩展功能

或者在终端中：
```bash
# 启动开发服务器
npm run watch
```

## 📦 打包扩展

```bash
# 安装vsce工具（如果还没安装）
npm install -g vsce

# 打包为.vsix文件
vsce package
```

## 🔧 配置

### 开发环境配置

在 `extension/VSCode/.env` 文件中配置API地址（如果需要）：

```env
API_BASE_URL=https://promptvow.com
```

### VS Code设置

在VS Code设置中添加：

```json
{
  "promptvow.apiUrl": "https://promptvow.com"
}
```

## 🎯 测试功能

### 基本功能测试

1. **认证**
   - 打开命令面板 (`Ctrl+Shift+P`)
   - 运行 `PromptVow: Authenticate with PromptVow`
   - 输入API Token

2. **保存提示词**
   - 在编辑器中选中一些文本
   - 右键点击，选择 `Save Selection as Prompt`
   - 输入标题并保存

3. **插入提示词**
   - 打开PromptVow面板（左侧图标）
   - 浏览提示词
   - 双击或右键选择 `Insert Prompt`

4. **搜索提示词**
   - 按 `Ctrl+Shift+P`
   - 输入搜索关键词
   - 选择要插入的提示词

## 🐛 调试技巧

### 查看日志

1. 打开扩展开发主机的输出面板
2. 选择"Extension Host"频道
3. 查看扩展的日志输出

### 调试代码

1. 在代码中设置断点
2. 按 `F5` 启动调试
3. 执行相关功能
4. 调试器会在断点处暂停

### 测试API连接

确保PromptVow后端服务正在运行：

```bash
# 在项目根目录
npm run dev
```

## 📝 常见问题

### TypeScript错误

如果看到TypeScript错误，运行：

```bash
npm run compile
```

### API地址配置

如果需要连接到不同的环境，修改API地址配置：

```json
{
  "promptvow.apiUrl": "https://your-domain.com"
}
```

### 认证失败

确保：
1. PromptVow后端服务正在运行
2. API Token正确
3. 网络连接正常

## 🚀 下一步

- 查看完整文档：[README.md](./README.md)
- 自定义功能：修改 `src/` 目录下的代码
- 添加新命令：在 `package.json` 的 `contributes.commands` 中添加
- 修改UI：编辑 `src/providers/` 和 `src/panels/` 中的代码

## 💡 开发提示

### 热重载

修改代码后：
- 按 `Ctrl+R` 在扩展开发主机中重新加载窗口
- 或在命令面板运行 `Developer: Reload Window`

### 添加新功能

1. 在 `src/commands/` 中创建新命令文件
2. 在 `package.json` 中注册命令
3. 在 `src/extension.ts` 中注册命令处理器

### API调用

参考 `src/api/client.ts` 中的API客户端实现，添加新的API端点。

## 📚 相关资源

- [VS Code Extension API](https://code.visualstudio.com/api)
- [TypeScript for VS Code](https://code.visualstudio.com/api/language-extensions/language-server-extension-guide)
- [PromptVow Web Platform](https://promptvow.com)

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

---

开始开发吧！如有问题，请查看文档或联系我们。
