# GitHub Release 发布脚本
# 使用方法: .\scripts\publish-github-release.ps1

param(
    [string]$Version = "",
    [switch]$PreRelease = $false
)

# 设置控制台输出编码为 UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 获取版本号
if ($Version -eq "") {
    # 强制使用 UTF-8 编码读取 package.json
    $packageJsonContent = Get-Content "package.json" -Encoding UTF8 -Raw
    $packageJson = $packageJsonContent | ConvertFrom-Json
    $Version = $packageJson.version
}

Write-Host "📦 准备发布 GitHub Release v$Version" -ForegroundColor Cyan

# 检查是否有 .vsix 文件
$vsixFile = "promptvow-$Version.vsix"
if (-not (Test-Path $vsixFile)) {
    Write-Host "❌ 未找到 $vsixFile 文件" -ForegroundColor Red
    Write-Host "💡 请先运行: vsce package" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ 找到文件: $vsixFile" -ForegroundColor Green

# 检查是否安装了 GitHub CLI
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 未安装 GitHub CLI (gh)" -ForegroundColor Red
    Write-Host "💡 请访问: https://cli.github.com/ 安装" -ForegroundColor Yellow
    exit 1
}

# 检查是否已登录 GitHub
$ghStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 未登录 GitHub CLI" -ForegroundColor Red
    Write-Host "💡 请运行: gh auth login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ GitHub CLI 已就绪" -ForegroundColor Green

# 准备发布说明 - 使用 UTF-8 编码
$releaseNotes = "## PromptVow v$Version`n`n"
$releaseNotes += "### Installation Methods`n`n"
$releaseNotes += "#### Method 1: VS Code Marketplace (Recommended)`n"
$releaseNotes += "Search for 'PromptVow' in VS Code Extensions`n`n"
$releaseNotes += "#### Method 2: Manual Installation`n"
$releaseNotes += '```bash' + "`n"
$releaseNotes += "code --install-extension promptvow-$Version.vsix`n"
$releaseNotes += '```' + "`n`n"
$releaseNotes += "#### Method 3: VS Code GUI`n"
$releaseNotes += "1. Download the .vsix file below`n"
$releaseNotes += "2. Open VS Code`n"
$releaseNotes += "3. Press Ctrl+Shift+P (or Cmd+Shift+P)`n"
$releaseNotes += "4. Type 'Extensions: Install from VSIX...'`n"
$releaseNotes += "5. Select the downloaded file`n`n"
$releaseNotes += "### Links`n"
$releaseNotes += "- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=promptvow.promptvow)`n"
$releaseNotes += "- [Website](https://promptvow.com)`n"
$releaseNotes += "- [Documentation](https://github.com/LueYueqing/vscode-promptvow#readme)`n"
$releaseNotes += "- [Issues](https://github.com/LueYueqing/vscode-promptvow/issues)`n`n"
$releaseNotes += "### Changelog`n"
$releaseNotes += "See [CHANGELOG.md](https://github.com/LueYueqing/vscode-promptvow/blob/main/CHANGELOG.md)`n`n"
$releaseNotes += "---`n"
$releaseNotes += "**PromptVow** - Make promises happen instantly"

# 创建 Release
Write-Host "🚀 正在创建 GitHub Release..." -ForegroundColor Cyan

$releaseArgs = @(
    "release", "create", "v$Version",
    $vsixFile,
    "--title", "PromptVow v$Version",
    "--notes", $releaseNotes
)

if ($PreRelease) {
    $releaseArgs += "--prerelease"
    Write-Host "⚠️  这是一个预发布版本" -ForegroundColor Yellow
}

gh @releaseArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ GitHub Release 发布成功!" -ForegroundColor Green
    Write-Host "🔗 查看: https://github.com/LueYueqing/vscode-promptvow/releases/tag/v$Version" -ForegroundColor Cyan
} else {
    Write-Host "❌ 发布失败" -ForegroundColor Red
    exit 1
}
