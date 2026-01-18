# PromptVow VSCode扩展 - 发布检查清单

## ✅ 已完成的准备工作

### 1. 更新package.json
- [x] 更新repository为公开GitHub仓库: `https://github.com/LueYueqing/vscode-promptvow.git`
- [x] 确认所有必需字段已填写
- [x] 版本号: 0.1.3
- [x] 发布者名称: promptvow

### 2. 更新README.md
- [x] 更新GitHub仓库链接
- [x] 更新问题反馈链接到GitHub Issues
- [x] 完善使用说明和安装指南
- [x] 添加功能特性说明

### 3. 许可证文件
- [x] LICENSE文件已存在（MIT License）

### 4. 图标资源
- [x] assets/icons/prompt.png 存在
- [x] assets/icons/prompt.svg 存在

### 5. 辅助工具和文档
- [x] publish-to-github.sh - Linux/Mac推送脚本
- [x] publish-to-github.bat - Windows推送脚本
- [x] MARKETPLACE_PUBLISH_GUIDE.md - Marketplace发布指南
- [x] PUBLISH_CHECKLIST.md - 发布检查清单（本文件）

---

## 📋 待完成的步骤

### 步骤1: 推送代码到GitHub

#### Windows用户:
```cmd
cd extension/VSCode
publish-to-github.bat
git push -u origin master
```

#### Linux/Mac用户:
```bash
cd extension/VSCode
bash publish-to-github.sh
git push -u origin main
```

#### 手动推送:
```bash
cd extension/VSCode
git init
git add .
git commit -m "Initial commit for PromptVow VSCode extension"
git remote add origin https://github.com/LueYueqing/vscode-promptvow.git
git push -u origin master  # 或 main
```

### 步骤2: 安装vsce工具
```bash
npm install -g @vscode/vsce
```

### 步骤3: 创建Azure DevOps账户和PAT
1. 访问 https://dev.azure.com/ 注册账户
2. 创建个人访问令牌(PAT):
   - 点击右上角头像 -> User settings -> Personal access tokens
   - 点击"New Token"
   - 命名为"VSCode Marketplace"
   - 选择"Marketplace"范围
   - 复制生成的令牌（妥善保存）

### 步骤4: 创建发布者账户
```bash
vsce create-publisher promptvow
```
按照提示填写发布者信息。

### 步骤5: 编译和打包
```bash
cd extension/VSCode
npm run compile
vsce package
```
这将生成 `promptvow-0.1.3.vsix` 文件。

### 步骤6: 测试扩展（可选但推荐）
1. 在VS Code中按 `Ctrl+Shift+X` 打开扩展面板
2. 点击右上角 "..." 菜单
3. 选择 "Install from VSIX..."
4. 选择刚生成的 `.vsix` 文件
5. 测试基本功能是否正常

### 步骤7: 发布到Marketplace
```bash
vsce publish
```
系统会提示输入Azure DevOps PAT。

### 步骤8: 验证发布
1. 访问 https://marketplace.visualstudio.com/items?itemName=promptvow.promptvow
2. 检查扩展信息
3. 测试搜索和安装

---

## 🔍 发布后验证清单

### Marketplace检查
- [ ] 扩展可以通过搜索"PromptVow"找到
- [ ] 扩展名称、描述、图标显示正确
- [ ] README.md正确渲染
- [ ] 版本号显示为0.1.3
- [ ] 发布者显示为"promptvow"
- [ ] 链接到GitHub仓库有效

### 功能测试
- [ ] 可以成功安装扩展
- [ ] 扩展激活正常
- [ ] 侧边栏图标显示
- [ ] 命令面板中可以看到PromptVow命令
- [ ] 快捷键(Ctrl+Shift+P, Ctrl+Shift+I)正常工作
- [ ] API配置功能正常
- [ ] 项目和提示词显示正常

### GitHub检查
- [ ] 代码已推送到 https://github.com/LueYueqing/vscode-promptvow
- [ ] README.md在GitHub中显示正常
- [ ] LICENSE文件存在
- [ ] 仓库设置为公开

---

## 📚 相关文档

- **README.md** - 用户使用文档
- **MARKETPLACE_PUBLISH_GUIDE.md** - 详细发布指南
- **INSTALL.md** - 安装说明
- **QUICKSTART.md** - 快速开始指南
- **USER_GUIDE.md** - 用户手册
- **PUBLISH.md** - 发布相关说明

---

## 🎯 版本管理

### 当前版本: 0.1.3

### 未来版本计划:
- **0.2.0** - 添加新功能（如：离线模式、模板库）
- **0.3.0** - 性能优化和UI改进
- **1.0.0** - 第一个稳定版本

### 版本更新流程:
1. 在package.json中更新版本号
2. 更新CHANGELOG.md
3. 运行 `vsce publish`
4. 在GitHub创建Release标签

---

## 📞 联系和支持

- **项目主页**: https://promptvow.com
- **GitHub仓库**: https://github.com/LueYueqing/vscode-promptvow
- **问题反馈**: https://github.com/LueYueqing/vscode-promptvow/issues
- **邮箱**: contact@promptvow.com

---

## 🚀 发布成功后的推广建议

1. **在主项目网站添加扩展下载链接**
2. **在社交媒体分享发布消息**
3. **在VSCode扩展相关社区推广**
4. **在AI编程相关论坛分享**
5. **收集用户反馈并持续改进**

---

**祝您发布顺利！如有问题请参考 MARKETPLACE_PUBLISH_GUIDE.md**
