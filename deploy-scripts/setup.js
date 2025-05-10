#!/usr/bin/env node

const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');

// 常量
const SCRIPTS_DIR = __dirname;
const PROJECT_ROOT = path.resolve(__dirname, '..');
const GIT_HOOKS_DIR = path.join(PROJECT_ROOT, '.git', 'hooks');

console.log(chalk.blue('================================================='));
console.log(chalk.blue('       Vercel 自动部署设置向导'));
console.log(chalk.blue('================================================='));

// 主函数
async function main() {
  try {
    await ensureDirectory();
    await installDependencies();
    const config = await configureSettings();
    await setupGitHooks(config);
    await setupStartupOptions(config);
    
    console.log(chalk.green('\n✅ 设置完成！'));
    displayInstructions();
  } catch (error) {
    console.error(chalk.red(`\n❌ 设置过程中出错: ${error.message}`));
    process.exit(1);
  }
}

// 确保目录存在
function ensureDirectory() {
  console.log(chalk.cyan('\n检查目录结构...'));
  
  if (!fs.existsSync(SCRIPTS_DIR)) {
    fs.mkdirSync(SCRIPTS_DIR, { recursive: true });
    console.log(chalk.green('✓ 已创建脚本目录'));
  }
  
  if (!fs.existsSync(path.join(SCRIPTS_DIR, 'config'))) {
    fs.mkdirSync(path.join(SCRIPTS_DIR, 'config'), { recursive: true });
    console.log(chalk.green('✓ 已创建配置目录'));
  }
  
  return Promise.resolve();
}

// 安装依赖
async function installDependencies() {
  console.log(chalk.cyan('\n安装必要的依赖...'));
  
  const packageJsonPath = path.join(SCRIPTS_DIR, 'package.json');
  
  // 检查是否需要安装
  if (!fs.existsSync(packageJsonPath)) {
    console.log(chalk.yellow('未找到package.json，将创建默认版本'));
    const defaultPackageJson = {
      name: "auto-deploy-scripts",
      version: "1.0.0",
      description: "自动部署脚本，将项目更新部署到Vercel",
      main: "auto-deploy.js",
      scripts: {
        start: "node auto-deploy.js",
        deploy: "node manual-deploy.js",
        "deploy:prod": "node manual-deploy.js --prod",
        setup: "node setup.js"
      },
      dependencies: {
        chokidar: "^3.5.3",
        "lodash.debounce": "^4.0.8",
        inquirer: "^8.2.5",
        chalk: "^4.1.2",
        commander: "^10.0.0"
      }
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(defaultPackageJson, null, 2));
    console.log(chalk.green('✓ 已创建package.json'));
  }
  
  try {
    console.log('正在安装依赖，这可能需要一些时间...');
    await executeCommand('npm install', { cwd: SCRIPTS_DIR });
    console.log(chalk.green('✓ 依赖安装完成'));
  } catch (error) {
    console.error(chalk.red(`依赖安装失败: ${error.message}`));
    throw error;
  }
  
  return Promise.resolve();
}

// 配置设置
async function configureSettings() {
  console.log(chalk.cyan('\n配置部署设置...'));
  
  const defaults = {
    autoDeploy: true,
    confirmBeforeDeploy: true,
    alwaysDeployToProd: false,
    enableGitHooks: true,
    watchMode: 'changes',
    debounceDelay: 3000
  };
  
  // 提问
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'autoDeploy',
      message: '是否启用文件变更自动部署?',
      default: defaults.autoDeploy
    },
    {
      type: 'confirm',
      name: 'confirmBeforeDeploy',
      message: '每次部署前是否需要确认?',
      default: defaults.confirmBeforeDeploy,
      when: (answers) => answers.autoDeploy
    },
    {
      type: 'confirm',
      name: 'alwaysDeployToProd',
      message: '是否始终部署到生产环境 (而不是预览环境)?',
      default: defaults.alwaysDeployToProd
    },
    {
      type: 'confirm',
      name: 'enableGitHooks',
      message: '是否设置Git钩子在提交后自动部署?',
      default: defaults.enableGitHooks
    },
    {
      type: 'list',
      name: 'watchMode',
      message: '文件监视模式:',
      choices: [
        { name: '仅监视文件变更', value: 'changes' },
        { name: '监视文件变更和添加', value: 'all' }
      ],
      default: defaults.watchMode,
      when: (answers) => answers.autoDeploy
    },
    {
      type: 'input',
      name: 'debounceDelay',
      message: '部署防抖延迟 (毫秒):',
      default: defaults.debounceDelay.toString(),
      validate: (input) => {
        const num = parseInt(input);
        return !isNaN(num) && num > 0 ? true : '请输入有效的数字';
      },
      filter: (input) => parseInt(input),
      when: (answers) => answers.autoDeploy
    }
  ]);
  
  // 合并设置
  const config = { ...defaults, ...answers };
  
  // 保存配置
  const configPath = path.join(SCRIPTS_DIR, 'config', 'deploy-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(chalk.green('✓ 配置已保存'));
  
  return config;
}

// 设置Git钩子
async function setupGitHooks(config) {
  if (!config.enableGitHooks) {
    console.log(chalk.yellow('已跳过Git钩子设置'));
    return Promise.resolve();
  }
  
  console.log(chalk.cyan('\n设置Git钩子...'));
  
  // 检查是否有.git目录
  if (!fs.existsSync(path.join(PROJECT_ROOT, '.git'))) {
    console.log(chalk.yellow('未找到.git目录，跳过Git钩子设置'));
    return Promise.resolve();
  }
  
  // 创建hooks目录
  if (!fs.existsSync(GIT_HOOKS_DIR)) {
    fs.mkdirSync(GIT_HOOKS_DIR, { recursive: true });
  }
  
  // 创建post-commit钩子
  const postCommitPath = path.join(GIT_HOOKS_DIR, 'post-commit');
  const hookContent = `#!/bin/sh
echo "正在执行自动部署..."
cd "${PROJECT_ROOT}"
node "${path.join(SCRIPTS_DIR, 'manual-deploy.js')}" ${config.alwaysDeployToProd ? '--prod' : ''} --force
`;
  
  fs.writeFileSync(postCommitPath, hookContent);
  fs.chmodSync(postCommitPath, '755'); // 设置可执行权限
  console.log(chalk.green('✓ Git post-commit钩子已设置'));
  
  return Promise.resolve();
}

// 设置启动选项
async function setupStartupOptions(config) {
  console.log(chalk.cyan('\n配置启动选项...'));
  
  // 创建启动脚本
  if (config.autoDeploy) {
    const startScriptPath = path.join(PROJECT_ROOT, 'start-auto-deploy.sh');
    const startScriptContent = `#!/bin/sh
cd "${SCRIPTS_DIR}"
node auto-deploy.js
`;
    
    fs.writeFileSync(startScriptPath, startScriptContent);
    fs.chmodSync(startScriptPath, '755'); // 设置可执行权限
    console.log(chalk.green('✓ 已创建启动脚本: start-auto-deploy.sh'));
  }
  
  // 更新根目录package.json
  try {
    const rootPackageJsonPath = path.join(PROJECT_ROOT, 'package.json');
    if (fs.existsSync(rootPackageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));
      
      // 添加部署脚本
      if (!packageJson.scripts) packageJson.scripts = {};
      packageJson.scripts['deploy'] = `node ${path.join('deploy-scripts', 'manual-deploy.js')}`;
      packageJson.scripts['deploy:prod'] = `node ${path.join('deploy-scripts', 'manual-deploy.js')} --prod`;
      
      if (config.autoDeploy) {
        packageJson.scripts['auto-deploy'] = `node ${path.join('deploy-scripts', 'auto-deploy.js')}`;
      }
      
      fs.writeFileSync(rootPackageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(chalk.green('✓ 已更新项目package.json'));
    }
  } catch (error) {
    console.error(chalk.yellow(`无法更新项目package.json: ${error.message}`));
  }
  
  return Promise.resolve();
}

// 显示使用说明
function displayInstructions() {
  console.log(chalk.cyan('\n=== 使用说明 ==='));
  console.log(chalk.white('\n手动部署:'));
  console.log('  npm run deploy       # 部署到预览环境');
  console.log('  npm run deploy:prod  # 部署到生产环境');
  
  console.log(chalk.white('\n自动部署:'));
  console.log('  npm run auto-deploy  # 启动自动部署服务');
  console.log('  或使用: ./start-auto-deploy.sh');
  
  console.log(chalk.white('\n命令行选项 (手动部署):'));
  console.log('  --prod         # 部署到生产环境');
  console.log('  --force        # 强制部署，跳过确认');
  console.log('  --skip-build   # 跳过构建步骤');
  console.log('  --copy-url     # 部署后复制URL到剪贴板');
  console.log('  --verbose      # 显示详细日志');
  
  console.log(chalk.white('\n示例:'));
  console.log('  node deploy-scripts/manual-deploy.js --prod --force');
  
  console.log(chalk.cyan('\n如果遇到任何问题，请检查deploy-scripts目录下的日志文件。'));
}

// 执行命令的函数
function executeCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    const childProcess = exec(command, options);
    
    childProcess.stdout.on('data', (data) => {
      if (options.verbose) {
        process.stdout.write(data);
      }
    });
    
    childProcess.stderr.on('data', (data) => {
      if (options.verbose) {
        process.stderr.write(data);
      }
    });
    
    childProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`命令执行失败，退出代码: ${code}`));
      } else {
        resolve();
      }
    });
  });
}

// 运行主函数
main(); 