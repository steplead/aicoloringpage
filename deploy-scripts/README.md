# Vercel 自动部署工具

这是一个为 Next.js 项目设计的自动部署工具，帮助你轻松地将本地更新自动部署到 Vercel 托管的 ai-coloringpage.com 域名。

## 功能特点

- **文件变更监控**：自动检测项目文件变更并触发部署
- **Git提交自动部署**：每次提交代码后自动部署到Vercel
- **手动部署命令**：提供简便的命令行工具进行手动部署
- **可配置性**：灵活的配置选项，满足不同部署需求
- **日志记录**：详细的部署日志，方便故障排查

## 安装步骤

### 1. 安装依赖

首先，进入deploy-scripts目录安装必要的依赖：

```bash
cd deploy-scripts
npm install
```

### 2. 运行设置向导

使用设置向导配置自动部署工具：

```bash
node setup.js
```

设置向导将引导你完成以下配置：
- 是否启用文件变更自动部署
- 是否需要部署前确认
- 是否始终部署到生产环境
- 是否启用Git钩子自动部署
- 文件监视模式和防抖延迟设置

### 3. 添加到项目

设置向导会自动更新项目的package.json，添加必要的脚本命令。

## 使用方法

### 手动部署

部署到预览环境：
```bash
npm run deploy
```

部署到生产环境：
```bash
npm run deploy:prod
```

### 自动部署

启动自动部署服务（监控文件变更）：
```bash
npm run auto-deploy
```

或者使用启动脚本：
```bash
./start-auto-deploy.sh
```

### 命令行选项

手动部署工具支持以下命令行选项：

| 选项 | 描述 |
|------|------|
| `--prod` | 部署到生产环境 |
| `--force` | 强制部署，跳过确认 |
| `--skip-build` | 跳过构建步骤 |
| `--copy-url` | 部署后自动复制URL到剪贴板 |
| `--verbose` | 显示详细日志 |

示例：
```bash
node deploy-scripts/manual-deploy.js --prod --force
```

## 配置文件

自动部署工具的配置保存在 `deploy-scripts/config/deploy-config.json` 文件中，你可以手动编辑该文件调整配置：

```json
{
  "autoDeploy": true,
  "confirmBeforeDeploy": true,
  "alwaysDeployToProd": false,
  "enableGitHooks": true,
  "watchMode": "changes",
  "debounceDelay": 3000
}
```

## Git钩子自动部署

如果你启用了Git钩子，每次提交代码后将自动触发部署。这通过在 `.git/hooks/post-commit` 中添加脚本实现。

## 日志文件

部署过程的日志记录在以下文件中：
- `deploy-scripts/deploy.log` - 手动部署日志
- `deploy-scripts/auto-deploy.log` - 自动部署日志

## 故障排除

1. **权限问题**：确保启动脚本有执行权限：
   ```bash
   chmod +x start-auto-deploy.sh
   ```

2. **依赖缺失**：如果遇到模块缺失错误，尝试重新安装依赖：
   ```bash
   cd deploy-scripts
   npm install
   ```

3. **部署失败**：检查日志文件了解详细错误信息

## 系统要求

- Node.js 14.0或更高版本
- npm 6.0或更高版本
- Git（用于Git钩子功能）

## 注意事项

1. 自动部署模块仅在你的本地开发环境运行，不会影响到Vercel上的构建流程
2. 确保Vercel CLI已正确安装和登录
3. 确保你有项目的部署权限
4. 建议在首次使用前进行备份

## 进阶用法

### 集成到CI/CD

如果你正在使用CI/CD系统，可以在CI配置中添加以下命令：

```yaml
deploy:
  script: node deploy-scripts/manual-deploy.js --prod --force --skip-build
```

### 监控特定文件

如果你只想监控特定文件或目录，可以修改`auto-deploy.js`中的`watchPaths`配置。

### 添加自定义钩子

你可以通过修改Git钩子脚本添加自定义功能，如发送部署通知：

```bash
#!/bin/sh
echo "正在执行自动部署..."
cd "${PROJECT_ROOT}"
node "${path.join(SCRIPTS_DIR, 'manual-deploy.js')}" ${config.alwaysDeployToProd ? '--prod' : ''} --force

# 添加部署通知
curl -X POST "https://api.example.com/notify" -d "message=已部署新版本"
``` 