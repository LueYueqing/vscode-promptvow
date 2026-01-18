# PromptVow VS Code Extension - 安装指南

## 📦 前置要求

- Node.js 18.0 或更高版本
- npm 9.0 或更高版本
- VS Code 1.75.0 或更高版本
- Git（可选，用于克隆项目）

## 🚀 安装步骤

### 方式一：从源码安装（开发模式）

#### 1. 安装依赖

```bash
cd extension/VSCode
npm install
```

#### 2. 编译TypeScript代码

```bash
npm run compile
```

#### 3. 在VS Code中运行扩展

1. 在VS Code中打开 `extension/VSCode` 目录
2. 按 `F5` 启动扩展开发主机
3. 在新打开的VS Code窗口中测试扩展功能

#### 4. 打包扩展（可选）

```bash
# 全局安装vsce工具
npm install -g vsce

# 打包为.vsix文件
vsce package
```

### 方式二：使用构建脚本（推荐）

#### 1. 运行安装脚本

在项目根目录运行：

```bash
# Windows
cd extension/VSCode
npm install

# Linux/Mac
cd extension/VSCode
npm install
```

#### 2. 编译项目

```bash
npm run compile
```

#### 3. 测试扩展

```bash
# 在VS Code中打开 extension/VSCode 目录
# 按 F5 启动扩展开发主机
```

## 🔧 配置

### 1. 设置API地址

在VS Code设置中添加以下配置：

```json
{
  "promptvow.apiUrl": "https://promptvow.com"
}
```

或者通过设置界面：
- 打开VS Code设置（Ctrl + ,）
- 搜索 "PromptVow"
- 设置 "Api Url" 为你的API地址

### 2. 获取API Token

1. 访问 PromptVow 网站：https://promptvow.com
2. 登录你的账户
3. 进入设置页面
4. 生成API Token
5. 复制Token

### 3. 在VS Code中认证

1. 打开命令面板（Ctrl + Shift + P）
2. 搜索并运行 "PromptVow: Authenticate with PromptVow"
3. 粘贴你的API Token
4. 点击确认

## 🎯 验证安装

### 检查扩展是否激活

1. 在扩展开发主机中打开输出面板（Ctrl + Shift + U）
2. 选择 "Extension Host" 频道
3. 查看是否有 "PromptVow extension is now active!" 消息

### 测试基本功能

1. **查看面板**
   - 查看左侧活动栏是否出现PromptVow图标
   - 点击图标应该显示PromptVow面板

2. **认证功能**
   - 运行认证命令
   - 输入Token并验证

3. **保存提示词**
   - 在编辑器中选中一些文本
   - 右键点击，选择 "Save Selection as Prompt"
   - 输入标题并保存

## 🐛 常见问题

### Q: npm install 失败

**解决方案：**
```bash
# 清除npm缓存
npm cache clean --force

# 删除node_modules
rm -rf node_modules
# Windows: rmdir /s /q node_modules

# 重新安装
npm install
```

### Q: TypeScript编译错误

**解决方案：**
```bash
# 重新安装@types/vscode
npm install --save-dev @types/vscode

# 重新编译
npm run compile
```

### Q: 扩展无法加载

**解决方案：**
1. 检查package.json中的engines.vscode版本是否匹配
2. 确认out目录已正确生成
3. 重新编译：`npm run compile`
4. 重启VS Code

### Q: API连接失败

**解决方案：**
1. 确认PromptVow后端服务正在运行
2. 检查API地址配置是否正确
3. 查看开发者工具的网络请求
4. 确认Token是否有效

### Q: 图标不显示

**解决方案：**
1. 确认assets/icons目录存在
2. 检查package.json中的图标路径是否正确
3. 重新加载窗口：Ctrl + R

## 📚 下一步

- 阅读 [README.md](./README.md) 了解完整功能
- 查看 [QUICKSTART.md](./QUICKSTART.md) 快速开始开发
- 查看 [开发文档](./README.md#开发) 了解如何扩展功能

## 🆘 获取帮助

如果遇到问题：

1. 查看VS Code输出面板的Extension Host日志
2. 检查浏览器开发者工具的控制台
3. 提交Issue到项目仓库
4. 联系支持：contact@promptvow.com

## 🔗 相关链接

- [VS Code Extension API](https://code.visualstudio.com/api)
- [vsce发布工具](https://github.com/microsoft/vscode-vsce)
- [PromptVow网站](https://promptvow.com)

---

祝你使用愉快！🚀
