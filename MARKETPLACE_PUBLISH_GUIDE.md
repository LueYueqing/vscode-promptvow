# VSCode Marketplace 发布指南

本指南将帮助您将PromptVow VSCode扩展发布到VSCode Marketplace。

## 前置条件

1. **Azure DevOps账户**
   - 访问 https://dev.azure.com/ 注册
   - 创建个人访问令牌(PAT)

2. **安装vsce工具**
   ```bash
   npm install -g @vscode/vsce
   ```

3. **发布者账户**
   - 在 https://marketplace.visualstudio.com/manage 创建发布者账户
   - 记录发布者名称（当前package.json中为"promptvow"）

## 准备工作

### 1. 更新版本号
检查`package.json`中的版本号：
```json
"version": "0.1.3"
```

### 2. 准备图标
确保以下图标文件存在且符合要求：
- `assets/icons/prompt.png` (128x128像素)
- `assets/icons/prompt.svg`

### 3. 检查必需字段
确认`package.json`包含所有必需字段：
- name: "promptvow"
- displayName: "PromptVow - AI Prompt Manager"
- description: "智能管理AI编程提示词，提升编程效率"
- version: "0.1.3"
- publisher: "promptvow"
- repository: 已设置为GitHub仓库
- license: "MIT"

## 发布步骤

### 步骤1: 编译项目
```bash
npm run compile
```

### 步骤2: 打包扩展
```bash
vsce package
```
这将生成一个`.vsix`文件，例如`promptvow-0.1.3.vsix`

### 步骤3: 测试扩展（可选）
在VS Code中安装并测试打包好的文件：
1. 按`Ctrl+Shift+X`打开扩展面板
2. 点击右上角的"..."菜单
3. 选择"Install from VSIX..."
4. 选择生成的`.vsix`文件

### 步骤4: 发布到Marketplace
```bash
# 首次发布需要创建发布者
vsce create-publisher promptvow

# 发布扩展
vsce publish
```

系统会提示您输入Azure DevOps个人访问令牌。

### 步骤5: 验证发布
1. 访问 https://marketplace.visualstudio.com/items?itemName=promptvow.promptvow
2. 检查扩展信息是否正确显示
3. 测试安装和基本功能

## 常见问题

### Q: 发布失败，提示"Publisher not found"
A: 需要先创建发布者账户：
```bash
vsce create-publisher promptvow
```

### Q: 个人访问令牌如何获取？
A: 
1. 访问 https://dev.azure.com/
2. 点击右上角头像 -> User settings -> Personal access tokens
3. 创建新令牌，选择"Marketplace"范围

### Q: 如何更新扩展？
A:
1. 在`package.json`中更新版本号
2. 运行`vsce publish`
3. vsce会自动检测版本变化并发布新版本

### Q: 发布后需要多长时间才能在Marketplace看到？
A: 通常几分钟到1小时内，最长时间可能需要24小时

## 发布后检查清单

- [ ] 扩展可以在Marketplace搜索到
- [ ] 扩展信息显示正确
- [ ] 图标显示正常
- [ ] 可以成功安装扩展
- [ ] 基本功能正常工作
- [ ] README.md在Marketplace中正确显示
- [ ] 快捷键可以正常使用

## 版本管理建议

- 遵循语义化版本规范 (Semantic Versioning)
- 主版本号(MAJOR): 不兼容的API修改
- 次版本号(MINOR): 向下兼容的功能性新增
- 修订号(PATCH): 向下兼容的问题修正

示例版本历史：
- 0.1.0: 初始版本
- 0.1.1: 修复bug
- 0.2.0: 添加新功能
- 1.0.0: 第一个稳定版本

## 推广建议

1. **在GitHub README中添加Marketplace徽章**
   ```markdown
   [![VSCode Marketplace](https://img.shields.io/visual-studio-marketplace/v/promptvow.promptvow)](https://marketplace.visualstudio.com/items?itemName=promptvow.promptvow)
   ```

2. **在项目文档中提及扩展**

3. **在社交媒体分享**

4. **在相关社区推广**（如AI编程、VSCode用户群）

## 维护

### 定期检查
- 每月检查扩展下载量和评分
- 关注用户反馈和问题报告
- 定期更新依赖包

### 持续改进
- 根据用户反馈优化功能
- 添加新功能
- 修复bug
- 改进用户体验

## 联系支持

如果遇到发布问题：
- VSCode Marketplace文档: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- Azure DevOps支持: https://developercommunity.visualstudio.com/

---

祝您发布顺利！🚀
