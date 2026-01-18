# PromptVow VS Code Extension - 发布指南

## 📦 发布到 Visual Studio Marketplace

### 前置要求

1. **Visual Studio Marketplace 账户**
   - 访问：https://marketplace.visualstudio.com/
   - 使用Microsoft账户登录或注册

2. **vsce 发布工具**
   - 全局安装 vsce 工具

## 🚀 发布步骤

### 步骤1: 安装 vsce 工具

```bash
npm install -g vsce
```

验证安装：
```bash
vsce --version
```

### 步骤2: 创建 Publisher

**注意：** `vsce create-publisher` 命令已不再可用，必须通过网站创建。

通过网站创建 Publisher：

1. 访问：https://marketplace.visualstudio.com/manage
2. 点击 "Create Publisher"
3. 填写发布者信息
   - **Name**: 发布者名称（唯一标识符）
   - **Display Name**: 显示名称
   - **Email**: 联系邮箱
   - **Description**: 发布者描述

### 步骤3: 配置 package.json

确保 `package.json` 包含以下信息：

```json
{
  "name": "promptvow",
  "displayName": "PromptVow - AI Prompt Manager",
  "description": "智能管理AI编程提示词，提升编程效率",
  "version": "0.1.0",
  "publisher": "your-publisher-name",
  "repository": {
    "type": "git",
    "url": "https://gitee.com/dongguan_mengyi_87371/promptvow.git"
  },
  "bugs": {
    "url": "https://gitee.com/dongguan_mengyi_87371/promptvow/issues"
  },
  "license": "MIT",
  "engines": {
    "vscode": "^1.75.0"
  }
}
```

**重要字段说明：**
- `publisher`: 必须与你在Marketplace创建的发布者名称完全一致
- `version`: 遵循语义化版本规范 (major.minor.patch)
- `engines.vscode`: 最低支持的VS Code版本

### 步骤4: 准备图标资源

创建以下尺寸的图标（可选，但推荐）：

```
assets/icons/
├── prompt.png           # PNG格式图标（活动栏图标）
├── icon128.png         # 128x128像素
├── icon48.png          # 48x48像素
└── icon16.png          # 16x16像素
```

**图标要求：**
- PNG格式，背景透明
- 适合深色和浅色主题
- 文件大小合理

### 步骤5: 编译项目

```bash
cd extension/VSCode
npm run compile
```

确保 `out/` 目录已正确生成。

### 步骤6: 验证扩展

在发布前，先在本地测试：

```bash
# 启动扩展开发主机
# 在VS Code中按 F5
```

测试所有功能确保正常工作。

### 步骤7: 打包扩展

```bash
vsce package
```

这将生成 `.vsix` 文件，例如：`promptvow-0.1.0.vsix`

### 步骤8: 发布扩展

#### 方式一：发布到Marketplace（推荐）

```bash
vsce publish
```

vsce会要求你：
1. 输入个人访问令牌（Personal Access Token）
2. 确认发布信息

**获取Personal Access Token：**
1. 访问：https://dev.azure.com/_usersSettings/tokens
2. 或访问：https://marketplace.visualstudio.com/manage/publishers
3. 点击 "Create new token"
4. 选择 "Organization": All accessible organizations
5. 选择 "Scopes": Marketplace → Manage
6. 创建并复制token

#### 方式二：发布特定版本

```bash
vsce publish patch   # 0.1.0 -> 0.1.1
vsce publish minor   # 0.1.0 -> 0.2.0
vsce publish major   # 0.1.0 -> 1.0.0
```

这会自动更新版本号并发布。

#### 方式三：发布预览版本

```bash
vsce publish --pre-release
```

预览版本不会显示在搜索结果中，只能通过链接访问。

### 步骤9: 验证发布

1. 访问：https://marketplace.visualstudio.com/items?itemName=promptvow.promptvow
2. 检查扩展信息是否正确
3. 下载并测试扩展

## 🔄 更新扩展

### 发布新版本

1. 更新 `package.json` 中的版本号
2. 更新 `CHANGELOG.md`（推荐）
3. 重新编译：`npm run compile`
4. 发布：`vsce publish`

### 自动化版本管理

```bash
# 更新补丁版本（修复bug）
vsce publish patch

# 更新次版本（新增功能）
vsce publish minor

# 更新主版本（破坏性变更）
vsce publish major
```

## 📋 发布检查清单

### 必需项目
- [ ] package.json 配置完整
- [ ] publisher 名称正确
- [ ] 版本号符合语义化规范
- [ ] 扩展可以正常编译
- [ ] 所有功能测试通过
- [ ] README.md 包含详细说明
- [ ] 图标资源准备完毕

### 推荐项目
- [ ] CHANGELOG.md 更新
- [ ] 截图或演示视频
- [ ] 详细的安装说明
- [ ] 许可证文件
- [ ] 问题追踪链接
- [ ] 演示链接

### 法律和合规
- [ ] 确认不违反Marketplace政策
- [ ] 检查是否有版权问题
- [ ] 确认第三方许可证合规

## 🐛 常见问题

### Q: 发布失败，提示 "Publisher not found"

**解决方案：**
```bash
# 检查publisher名称
vsce show-publisher

# 如果不存在，创建新的
vsce create-publisher your-publisher-name
```

### Q: Token 验证失败

**解决方案：**
1. 确认token有Marketplace权限
2. 重新生成token
3. 确认token没有过期

### Q: 版本冲突

**解决方案：**
```bash
# 更新版本号
vsce publish patch

# 或手动修改 package.json 中的版本号
```

### Q: 图标不显示

**解决方案：**
1. 确认图标文件存在
2. 检查文件路径
3. 确认图标格式正确（PNG或SVG）
4. 重新打包：`vsce package`

### Q: 扩展无法安装

**解决方案：**
1. 检查 engines.vscode 版本
2. 确认打包文件完整
3. 下载并测试.vsix文件
4. 查看错误日志

## 📊 发布后优化

### 提高曝光率

1. **优化搜索排名**
   - 选择合适的关键词
   - 编写清晰的描述
   - 添加详细的分类

2. **收集评价**
   - 鼓励用户评分
   - 回复用户评论
   - 及时修复问题

3. **添加截图**
   - 展示核心功能
   - 介绍使用场景
   - 提供安装说明

### 数据分析

访问Marketplace管理后台查看：
- 安装数量
- 下载统计
- 评分情况
- 用户反馈

## 🎯 最佳实践

### 版本管理

```bash
# 开发版本：0.1.0-beta.1
npm version 0.1.0-beta.1

# 正式版本：0.1.0
npm version 0.1.0
```

### 持续集成

创建 `.github/workflows/publish.yml`：

```yaml
name: Publish Extension

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run compile
      - run: npm install -g vsce
      - run: vsce publish -p ${{ secrets.VSCE_TOKEN }}
```

## 📚 相关资源

- [Visual Studio Marketplace](https://marketplace.visualstudio.com/)
- [vsce 文档](https://github.com/microsoft/vscode-vsce)
- [VS Code 扩展 API](https://code.visualstudio.com/api)
- [发布最佳实践](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

## 🆘 获取帮助

- [Marketplace 支持](https://marketplace.visualstudio.com/support)
- [VS Code 扩展论坛](https://github.com/microsoft/vscode/discussions)
- 联系：contact@promptvow.com

---

祝你发布顺利！🚀
