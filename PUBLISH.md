# PromptVow VSCode 插件发布指南

本文档为 PromptVow 插件的快速发布手册。主要流程已集成到 `package.json` 的脚本中。

## 1. 环境准备 (初次使用)

确保全局安装了发布工具：
```powershell
npm install -g @vscode/vsce ovsx
```

## 2. 检查凭据

确保根目录（`../../.env.local`）中包含以下有效 Token：
```env
VISUAL_STUDIO_TOKEN=您的_VS_MARKETPLACE_TOKEN
OVSXAT=您的_OPEN_VSX_TOKEN
```

## 3. 标准发布流程 (仅需两步)

### 第一步：升级版本号
该命令会自动将版本号的最后一位加 1 (例如 0.1.17 -> 0.1.18)。
```powershell
npm run version:patch
```

### 第二步：一键发布到所有平台
该命令会自动完成：提取环境变量 -> 运行 `vscode:prepublish` (编译) -> 上传到 VS Marketplace 和 Open VSX。
```powershell
npm run publish:all
```

---

## 4. 常用高级命令

| 任务 | 命令 | 说明 |
| :--- | :--- | :--- |
| **仅发布到微软** | `npm run publish:vsce` | 仅发布到 VS Code Marketplace |
| **仅发布到 Eclipse** | `npm run publish:ovsx` | 仅发布到 Open VSX Registry |
| **强制重新编译** | `npm run compile` | 手动验证编译是否通过 |
| **跳过验证发布** | `vsce publish --noVerify` | 当提示 git 状态或 README 时使用 |

## 5. 注意事项 (AI/开发人员重读)

1. **自动编译**：不需要手动执行 `npm run compile`。`vsce` 和 `ovsx` 在发布前会自动运行 `vscode:prepublish` 脚本。
2. **Git 状态**：`vsce` 默认要求工作区是干净的（没有未提交的改动）。如果在脚本中添加了 `--noVerify`，是为了允许在有改动时强制发布。
3. **Token 路径**：发布脚本使用 `Select-String` 动态从根目录的 `.env.local` 提取 Token，避免了在环境中手动设置。
4. **版本一致性**：发布后记得将生成的 `package.json` 版本变更提交到 Git。

---
*上次更新时间：2026-01-19*
