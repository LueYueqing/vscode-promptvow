# VSCode扩展视图UI改进

## 改进概述
优化了左侧插件视图的用户体验，将操作按钮直接集成到视图中，用户无需通过顶部命令面板即可完成常用操作。

## 改进内容

### 1. 视图结构优化

#### 未选中项目时
- 显示明显的"📋 选择项目"按钮
- 点击按钮直接打开项目选择对话框
- 使用数据库图标 (database) 提示用户

#### 选中项目后
视图顶部显示：
- **📁 当前项目: [项目ID]** - 显示当前选中的项目，点击可切换项目
- **➕ 新增提示词** - 快速添加新提示词的按钮

#### 提示词列表
- 显示所有 IN_PROGRESS 状态的提示词
- 每个提示词显示前60个字符作为标题
- 双击提示词自动复制内容到剪贴板

#### 空状态处理
当项目没有提示词时，显示：
- 项目信息项
- "➕ 新增提示词"按钮
- "📝 此项目暂无'新录入'状态的提示词"提示信息

#### 列表底部
- 始终显示"➕ 新增提示词"按钮，方便随时添加新提示词

### 2. 操作按钮特性

#### 点击行为
所有操作按钮都配置了自动执行命令：
- `promptvow.selectProject` - 选择项目
- `promptvow.addPrompt` - 新增提示词

#### 图标设计
- 选择项目：数据库图标 (database)
- 新增提示词：添加图标 (add)
- 其他操作：刷新图标 (refresh)

### 3. 保留的功能

#### 顶部工具栏
- 选择项目按钮 (保留)
- 新增提示词按钮 (保留)
- 刷新按钮 (保留)
- 显示面板按钮 (保留)

#### 右键菜单
- Copy Prompt - 复制提示词
- Complete Task - 完成任务
- Set as Default Project - 设为默认项目

#### 双击功能
- 双击提示词自动复制内容到剪贴板

## 用户体验提升

### 之前的问题
1. 用户需要通过顶部工具栏或命令面板 (Ctrl+Shift+P) 来选择项目
2. 新增提示词也需要通过顶部工具栏
3. 操作入口不够明显，用户需要探索才能找到

### 改进后的优势
1. **直观可见**：所有操作按钮直接显示在视图中
2. **操作便捷**：点击按钮即可执行，无需记住快捷键或命令
3. **流程清晰**：选择项目 → 查看提示词 → 新增/操作，流程一目了然
4. **多入口支持**：既可以通过视图按钮操作，也可以通过顶部工具栏，满足不同用户习惯

## 技术实现

### ProjectProvider 改进
```typescript
// 未选中项目时显示选择按钮
if (!this.selectedProjectId) {
  return [
    new ProjectTreeItem({
      id: 'select-project',
      title: '📋 选择项目',
      content: '点击此处选择要查看的项目',
      isActionItem: true,
      command: 'promptvow.selectProject'
    }, false, undefined, undefined)
  ];
}

// 选中项目后显示项目信息和提示词列表
const projectInfoItem = new ProjectTreeItem({
  id: 'project-info',
  title: `📁 当前项目: ${this.selectedProjectId}`,
  content: '点击切换到其他项目',
  isActionItem: true,
  command: 'promptvow.selectProject'
}, false, this.selectedProjectId, undefined);

// 列表底部添加新增按钮
const addPromptButton = new ProjectTreeItem({
  id: 'add-prompt',
  title: '➕ 新增提示词',
  content: '点击添加新的提示词',
  isActionItem: true,
  command: 'promptvow.addPrompt'
}, false, this.selectedProjectId, undefined);
```

### ProjectTreeItem 命令绑定
```typescript
// 设置点击时执行的命令
if (prompt.command) {
  this.command = {
    command: prompt.command,
    title: prompt.title
  };
}
```

## 视觉设计

### 图标使用
- 📋 选择项目：database 图标
- 📁 项目信息：database 图标
- ➕ 新增提示词：add 图标
- 📝 提示词：file 图标
- ❌ 错误：error 图标

### 提示信息
- 每个按钮都有清晰的 tooltip 和 description
- 空状态有友好的提示信息
- 错误状态有详细的错误说明

## 未来优化建议

1. **项目名称显示**
   - 当前显示项目ID，可以改为显示项目名称
   - 需要修改 API 调用以获取项目详细信息

2. **状态筛选**
   - 可以添加状态筛选按钮
   - 允许用户查看不同状态的提示词

3. **搜索功能**
   - 在视图中添加搜索框
   - 快速搜索提示词内容

4. **快捷键**
   - 为常用操作添加快捷键
   - 如：Ctrl+N 新增提示词

## 总结
通过将操作按钮直接集成到视图中，大大提升了用户体验，用户可以更直观、更便捷地完成常用操作。同时保留了顶部工具栏和命令面板的入口，满足不同用户的使用习惯。
