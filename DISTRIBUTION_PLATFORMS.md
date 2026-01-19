# PromptVow VS Code 插件发布平台指南

本文档列出了 PromptVow VS Code 插件可以发布和推广的所有平台。

## 📦 已配置的发布平台

### 1. Visual Studio Marketplace (官方市场) ✅
- **状态**: 已配置
- **网址**: https://marketplace.visualstudio.com/
- **发布命令**: `npm run publish:vsce`
- **优势**:
  - VS Code 官方市场，用户量最大
  - 内置于 VS Code，用户可直接搜索安装
  - 提供详细的下载统计和评分系统
  - 自动更新支持
- **要求**:
  - 需要 Microsoft 账号
  - 需要 Azure DevOps 个人访问令牌 (PAT)
- **当前链接**: https://marketplace.visualstudio.com/items?itemName=promptvow.promptvow

### 2. Open VSX Registry (开源市场) ✅
- **状态**: 已配置
- **网址**: https://open-vsx.org/
- **发布命令**: `npm run publish:ovsx`
- **优势**:
  - Eclipse 基金会维护的开源替代方案
  - VSCodium 和其他开源 VS Code 分支的默认市场
  - 支持开源社区
  - 无需 Microsoft 账号
  - 超过 4000 万次下载量
- **要求**:
  - 需要 Open VSX 账号
  - 需要个人访问令牌
- **适用于**: VSCodium, Code - OSS, Theia IDE, Gitpod 等

---

## 🚀 推荐的额外发布平台

### 3. GitHub Releases (强烈推荐) ⭐
- **网址**: https://github.com/LueYueqing/vscode-promptvow/releases
- **发布方式**: 
  ```bash
  # 创建 GitHub Release 并上传 .vsix 文件
  gh release create v0.1.18 ./promptvow-0.1.18.vsix --title "Release v0.1.18" --notes "发布说明"
  ```
- **支持的 IDE/编辑器**:
  - ✅ **Visual Studio Code** (官方版本) - 主要目标
  - ✅ **VSCodium** - 开源版本，无遥测
  - ✅ **Code - OSS** - 开源构建版
  - ✅ **Cursor** - AI 增强编辑器 (基于 VS Code)
  - ✅ **Windsurf** - Codeium 的 AI 编辑器
  - ✅ **Eclipse Theia** - 云端/桌面 IDE
  - ✅ **Gitpod** - 云端开发环境
  - ✅ **GitHub Codespaces** - GitHub 云端 IDE
  
- **安装方式**:
  ```bash
  # 命令行安装
  code --install-extension promptvow-0.1.18.vsix
  
  # 或在 VS Code 中: Ctrl+Shift+P → "Extensions: Install from VSIX..."
  ```

- **优势**:
  - 提供直接下载链接
  - 版本历史清晰
  - 可以附带详细的发布说明
  - 支持所有 VS Code 兼容编辑器
  - 便于企业内网环境使用
  - 支持离线安装
  - 可用于 CI/CD 自动化
  
- **适用场景**:
  - 🏢 **企业内网环境** - 防火墙阻止访问 Marketplace
  - 💾 **离线安装** - 无网络连接的开发环境
  - 🧪 **测试版本分发** - Pre-release 版本给测试用户
  - ⏮️ **版本回退** - 用户需要使用旧版本
  - 🤖 **CI/CD 集成** - 自动化部署和测试
  - 📦 **备份和归档** - 长期保存所有版本

### 4. npm Registry (推荐) ⭐
- **网址**: https://www.npmjs.com/
- **发布方式**:
  ```bash
  # 将 .vsix 文件作为 npm 包发布
  npm publish
  ```
- **优势**:
  - 开发者熟悉的平台
  - 可以通过 npm 安装
  - 便于 CI/CD 集成
  - 支持私有包（付费）
- **使用方式**:
  ```bash
  npm install -g promptvow
  code --install-extension promptvow
  ```

### 5. 自建私有市场 (企业推荐)
- **工具**: `code-marketplace` by Coder
- **网址**: https://github.com/coder/code-marketplace
- **优势**:
  - 完全控制
  - 适合企业内网环境
  - 支持离线环境
  - 安全性高
- **适用场景**:
  - 企业内部分发
  - 安全要求高的环境
  - 需要审核流程的组织

---

## 🌏 中国市场推广渠道

### 6. Gitee (码云) 推荐 ⭐
- **网址**: https://gitee.com/
- **推广方式**:
  1. 在 Gitee 创建镜像仓库
  2. 在 README 中提供安装说明
  3. 上传 .vsix 文件到 Releases
  4. 利用 Gitee Pages 创建项目主页
- **优势**:
  - 中国开发者使用广泛
  - 访问速度快
  - 社区活跃
  - 支持中文搜索

### 7. CSDN / 掘金 / 博客园 (技术博客平台)
- **推广方式**:
  - 撰写插件介绍文章
  - 发布使用教程
  - 分享开发经验
- **平台列表**:
  - CSDN: https://blog.csdn.net/
  - 掘金: https://juejin.cn/
  - 博客园: https://www.cnblogs.com/
  - 思否 (SegmentFault): https://segmentfault.com/
  - 开源中国: https://www.oschina.net/

### 8. 微信公众号 / 知乎
- **推广方式**:
  - 发布功能介绍
  - 使用案例分享
  - 技术解析文章
- **优势**:
  - 触达广泛的开发者群体
  - 便于传播和分享
  - 可以建立用户社区

---

## 📱 社交媒体和社区

### 9. Reddit
- **相关 Subreddits**:
  - r/vscode
  - r/programming
  - r/webdev
  - r/javascript
- **推广方式**: 发布插件介绍帖，参与讨论

### 10. Twitter / X
- **推广方式**:
  - 使用标签: #VSCode #Extension #AI #Productivity
  - @VSCode 官方账号
  - 分享功能演示视频

### 11. Product Hunt
- **网址**: https://www.producthunt.com/
- **推广方式**: 作为新产品发布
- **优势**:
  - 科技产品发现平台
  - 可以获得大量曝光
  - 用户反馈质量高

### 12. Hacker News
- **网址**: https://news.ycombinator.com/
- **推广方式**: Show HN 帖子
- **优势**: 技术社区影响力大

---

## 🎯 专业开发者平台

### 13. Dev.to
- **网址**: https://dev.to/
- **推广方式**: 撰写技术文章和教程
- **优势**: 开发者社区活跃

### 14. Hashnode
- **网址**: https://hashnode.com/
- **推广方式**: 发布博客文章
- **优势**: 技术博客平台，SEO 友好

### 15. Medium
- **网址**: https://medium.com/
- **推广方式**: 发布深度文章
- **优势**: 读者群体广泛

---

## 📺 视频平台

### 16. YouTube
- **推广方式**:
  - 功能演示视频
  - 使用教程
  - 开发日志
- **优势**: 全球最大视频平台

### 17. 哔哩哔哩 (Bilibili)
- **网址**: https://www.bilibili.com/
- **推广方式**:
  - 中文教程视频
  - 功能演示
  - 开发分享
- **优势**: 中国最大的技术视频平台

---

## 🏢 企业和团队渠道

### 18. Slack / Discord 社区
- **推广方式**:
  - 加入相关开发者社区
  - 分享插件信息
  - 提供技术支持

### 19. VS Code 官方社区
- **GitHub Discussions**: https://github.com/microsoft/vscode/discussions
- **推广方式**: 参与讨论，分享插件

---

## 📊 发布优先级建议

### 高优先级 (立即执行)
1. ✅ Visual Studio Marketplace (已完成)
2. ✅ Open VSX Registry (已完成)
3. ⭐ GitHub Releases
4. ⭐ Gitee 镜像仓库

### 中优先级 (1-2周内)
5. npm Registry
6. CSDN / 掘金技术文章
7. 微信公众号文章
8. YouTube / Bilibili 演示视频

### 低优先级 (长期运营)
9. Product Hunt
10. Reddit / Hacker News
11. Dev.to / Medium 博客
12. 社区和论坛持续运营

---

## 🛠️ 自动化发布脚本

### 当前脚本 (package.json)
```json
{
  "scripts": {
    "publish:vsce": "powershell -Command \"$env:VSCE_PAT=(Select-String -Path '../../.env.local' -Pattern 'VISUAL_STUDIO_TOKEN=(.*)' | ForEach-Object { $_.Matches.Groups[1].Value }).Trim(); vsce publish --noVerify\"",
    "publish:ovsx": "powershell -Command \"$env:OVSX_PAT=(Select-String -Path '../../.env.local' -Pattern 'OVSXAT=(.*)' | ForEach-Object { $_.Matches.Groups[1].Value }).Trim(); ovsx publish\"",
    "publish:all": "npm run publish:vsce && npm run publish:ovsx"
  }
}
```

### 建议新增脚本
```json
{
  "scripts": {
    "publish:github": "gh release create v$npm_package_version ./*.vsix --title \"Release v$npm_package_version\" --notes-file CHANGELOG.md",
    "publish:npm": "npm publish",
    "publish:everywhere": "npm run publish:all && npm run publish:github && npm run publish:npm"
  }
}
```

---

## 📝 发布检查清单

发布前确保：
- [ ] 版本号已更新
- [ ] CHANGELOG.md 已更新
- [ ] README.md 信息准确
- [ ] 所有功能已测试
- [ ] 截图和演示 GIF 已准备
- [ ] 环境变量已配置 (VSCE_PAT, OVSX_PAT)
- [ ] 编译无错误 (`npm run compile`)
- [ ] 代码检查通过 (`npm run lint`)

---

## 🔗 相关链接

- **项目主页**: https://promptvow.com
- **GitHub 仓库**: https://github.com/LueYueqing/vscode-promptvow
- **VS Code Marketplace**: https://marketplace.visualstudio.com/items?itemName=promptvow.promptvow
- **Open VSX**: https://open-vsx.org/extension/promptvow/promptvow
- **问题反馈**: https://github.com/LueYueqing/vscode-promptvow/issues

---

**更新日期**: 2026-01-19
**维护者**: PromptVow Team
