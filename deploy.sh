#!/bin/bash

# 颜色和格式
YELLOW='\033[1;33m'
GREEN='\033[1;32m'
RED='\033[1;31m'
BLUE='\033[1;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# 标题
echo -e "${BOLD}${BLUE}==============================================${NC}"
echo -e "${BOLD}${BLUE}        吉卜力涂色应用自动部署工具         ${NC}"
echo -e "${BOLD}${BLUE}==============================================${NC}"

# 记录日志
log() {
  local level=$1
  local message=$2
  local color=$NC
  
  case $level in
    "INFO") color=$BLUE ;;
    "SUCCESS") color=$GREEN ;;
    "WARNING") color=$YELLOW ;;
    "ERROR") color=$RED ;;
  esac
  
  echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${color}${level}${NC}: ${message}"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ${level}: ${message}" >> deploy.log
}

# 检查命令是否存在
check_command() {
  if ! command -v $1 &> /dev/null; then
    log "ERROR" "未找到命令: $1"
    return 1
  fi
  return 0
}

# 检查环境依赖
check_dependencies() {
  log "INFO" "检查环境依赖..."
  
  # 检查Node.js
  if ! check_command node; then
    log "ERROR" "请先安装Node.js: https://nodejs.org/"
    exit 1
  fi
  local node_version=$(node -v)
  log "INFO" "Node.js版本: ${node_version}"
  
  # 检查npm
  if ! check_command npm; then
    log "ERROR" "请先安装npm"
    exit 1
  fi
  local npm_version=$(npm -v)
  log "INFO" "npm版本: ${npm_version}"
  
  # 检查Git
  if ! check_command git; then
    log "WARNING" "未检测到Git，部分功能可能不可用"
  else
    local git_version=$(git --version)
    log "INFO" "Git版本: ${git_version}"
  fi
  
  log "SUCCESS" "环境依赖检查完成"
}

# 安装必要的包
install_packages() {
  log "INFO" "安装必要的包..."
  
  # 检查Vercel CLI
  if ! check_command vercel &> /dev/null && ! check_command npx vercel --version &> /dev/null; then
    log "INFO" "安装Vercel CLI..."
    npm install -g vercel
    if [ $? -ne 0 ]; then
      log "WARNING" "全局安装Vercel CLI失败，将使用npx运行"
    else
      log "SUCCESS" "Vercel CLI已安装"
    fi
  else
    log "INFO" "Vercel CLI已安装"
  fi
  
  # 安装deploy-scripts目录中的依赖
  if [ -d "deploy-scripts" ]; then
    log "INFO" "安装部署脚本依赖..."
    (cd deploy-scripts && npm install)
    if [ $? -ne 0 ]; then
      log "ERROR" "安装依赖失败"
      exit 1
    fi
    log "SUCCESS" "依赖安装完成"
  else
    log "INFO" "创建deploy-scripts目录..."
    mkdir -p deploy-scripts
    
    # 复制基本配置文件
    if [ ! -f "deploy-scripts/package.json" ]; then
      cat > deploy-scripts/package.json << EOF
{
  "name": "deploy-scripts",
  "version": "1.0.0",
  "description": "Vercel自动部署工具",
  "main": "auto-deploy.js",
  "scripts": {
    "auto-deploy": "node auto-deploy.js",
    "manual-deploy": "node manual-deploy.js"
  },
  "dependencies": {
    "chalk": "^4.1.2",
    "chokidar": "^3.5.3",
    "commander": "^9.4.0",
    "inquirer": "^8.2.4",
    "lodash.debounce": "^4.0.8"
  }
}
EOF
    fi
    
    log "INFO" "安装部署脚本依赖..."
    (cd deploy-scripts && npm install)
    if [ $? -ne 0 ]; then
      log "ERROR" "安装依赖失败"
      exit 1
    fi
    log "SUCCESS" "部署脚本依赖安装完成"
    
    # 需要创建基本的脚本文件
    log "INFO" "创建必要的脚本文件..."
    setup_script_files
  fi
}

# 设置脚本文件
setup_script_files() {
  # 创建auto-deploy.js文件
  if [ ! -f "deploy-scripts/auto-deploy.js" ]; then
    log "INFO" "创建auto-deploy.js..."
    cat > deploy-scripts/auto-deploy.js << 'EOF'
const { exec } = require('child_process');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const debounce = require('lodash.debounce');

// 配置
const config = {
  // 要监视的目录和文件
  watchPaths: [
    'components/**',
    'pages/**',
    'styles/**',
    'public/**',
    'lib/**',
    'contexts/**',
    'next.config.js',
    'package.json',
    'tailwind.config.js',
    'postcss.config.js'
  ],
  // 忽略的目录和文件
  ignorePaths: [
    'node_modules/**',
    '.git/**',
    '.next/**',
    '.vercel/**',
    'deploy-scripts/**'
  ],
  // 部署命令选项
  deployCommand: 'npx vercel --prod',
  // 预览部署命令（不推向生产环境）
  previewCommand: 'npx vercel',
  // 防抖延迟 (毫秒)
  debounceDelay: 3000,
  // 部署之前要执行的命令（例如构建、测试等）
  preDeploy: 'npm run build',
  // 是否自动部署
  autoDeploy: true,
  // 是否每次部署前请求确认
  confirmBeforeDeploy: false,
  // 每次变动后是否总是部署到生产环境
  alwaysDeployToProd: true
};

// 状态
let isDeploying = false;

// 记录日志的函数
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  
  // 也可以记录到文件
  fs.appendFileSync(
    path.join(__dirname, 'auto-deploy.log'),
    `[${timestamp}] ${message}\n`
  );
}

// 执行命令的函数
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    log(`执行命令: ${command}`);
    
    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        log(`命令执行失败: ${error.message}`);
        return reject(error);
      }
      
      if (stderr) {
        log(`命令警告: ${stderr}`);
      }
      
      log(`命令输出: ${stdout}`);
      resolve(stdout);
    });
  });
}

// 部署函数
async function deploy(isProd = false) {
  if (isDeploying) {
    log('已有部署正在进行中，跳过此次部署');
    return;
  }
  
  try {
    isDeploying = true;
    log('开始部署流程...');
    
    // 运行部署前命令
    if (config.preDeploy) {
      log('执行部署前命令...');
      await executeCommand(config.preDeploy);
    }
    
    // 确定部署命令
    const deployCmd = isProd ? config.deployCommand : config.previewCommand;
    
    // 执行部署
    log(`执行${isProd ? '生产环境' : '预览环境'}部署...`);
    const deployResult = await executeCommand(deployCmd);
    
    // 提取部署URL
    const deployUrlMatch = deployResult.match(/https:\/\/[^\s]+/);
    const deployUrl = deployUrlMatch ? deployUrlMatch[0] : '未找到部署URL';
    
    log(`部署完成! 部署地址: ${deployUrl}`);
  } catch (error) {
    log(`部署过程中出错: ${error.message}`);
  } finally {
    isDeploying = false;
  }
}

// 防抖处理的部署函数
const debouncedDeploy = debounce(async (isProd) => {
  if (config.confirmBeforeDeploy) {
    // 在实际使用中，这里可以是一个命令行交互或自动确认机制
    // 此处简化为自动确认
    log('需要确认部署...');
    log('自动确认部署');
  }
  
  await deploy(isProd || config.alwaysDeployToProd);
}, config.debounceDelay);

// 启动文件监视
function startWatcher() {
  const watcher = chokidar.watch(config.watchPaths, {
    ignored: config.ignorePaths,
    persistent: true,
    ignoreInitial: true
  });
  
  log('启动文件监视器，等待文件变化...');
  
  // 监听文件变化事件
  watcher
    .on('add', path => {
      log(`文件添加: ${path}`);
      if (config.autoDeploy) debouncedDeploy(false);
    })
    .on('change', path => {
      log(`文件变化: ${path}`);
      if (config.autoDeploy) debouncedDeploy(false);
    })
    .on('unlink', path => {
      log(`文件删除: ${path}`);
      if (config.autoDeploy) debouncedDeploy(false);
    });
  
  log('文件监视器已启动，自动部署服务激活');
}

// 主函数
function main() {
  log('自动部署服务启动');
  
  // 创建必要的目录
  if (!fs.existsSync(__dirname)) {
    fs.mkdirSync(__dirname, { recursive: true });
  }
  
  // 启动监视器
  startWatcher();
  
  // 处理进程结束
  process.on('SIGINT', () => {
    log('自动部署服务关闭');
    process.exit(0);
  });
}

// 运行主函数
main();
EOF
  fi

  # 创建manual-deploy.js文件
  if [ ! -f "deploy-scripts/manual-deploy.js" ]; then
    log "INFO" "创建manual-deploy.js..."
    cat > deploy-scripts/manual-deploy.js << 'EOF'
#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// 设置版本和描述
console.log(chalk.blue('=== Vercel项目手动部署工具 ==='));

// 日志函数
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  let coloredMessage;
  
  switch(type) {
    case 'error':
      coloredMessage = chalk.red(message);
      break;
    case 'success':
      coloredMessage = chalk.green(message);
      break;
    case 'warning':
      coloredMessage = chalk.yellow(message);
      break;
    case 'info':
    default:
      coloredMessage = chalk.blue(message);
  }
  
  console.log(`[${timestamp}] ${coloredMessage}`);
  
  // 记录到日志文件
  fs.appendFileSync(
    path.join(__dirname, 'deploy.log'),
    `[${timestamp}] [${type.toUpperCase()}] ${message}\n`
  );
}

// 执行命令的函数
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    log(`执行命令: ${command}`, 'info');
    
    const childProcess = exec(command, { maxBuffer: 1024 * 1024 * 10 });
    
    childProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    childProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
    
    childProcess.on('close', (code) => {
      if (code !== 0) {
        log(`命令执行失败，退出代码: ${code}`, 'error');
        return reject(new Error(`命令执行失败，退出代码: ${code}`));
      }
      
      resolve();
    });
  });
}

// 部署函数
async function deploy() {
  try {
    log('开始部署过程...', 'info');
    
    // 1. 构建步骤
    log('正在构建项目...', 'info');
    await executeCommand('npm run build');
    log('项目构建完成', 'success');
    
    // 2. 执行部署命令
    const deployCommand = 'npx vercel --prod';
    log(`开始部署到生产环境...`, 'info');
    
    // 捕获命令输出以提取URL
    let deployOutput = '';
    const childProcess = exec(deployCommand);
    
    childProcess.stdout.on('data', (data) => {
      deployOutput += data;
      process.stdout.write(data);
    });
    
    childProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
    
    await new Promise((resolve, reject) => {
      childProcess.on('close', (code) => {
        if (code !== 0) {
          log(`部署失败，退出代码: ${code}`, 'error');
          reject(new Error(`部署失败，退出代码: ${code}`));
        } else {
          resolve();
        }
      });
    });
    
    // 3. 提取部署URL
    const urlMatch = deployOutput.match(/https:\/\/[^\s]+/);
    const deployUrl = urlMatch ? urlMatch[0] : '未找到部署URL';
    
    log(`部署成功! 部署地址: ${deployUrl}`, 'success');
    
  } catch (error) {
    log(`部署过程中出错: ${error.message}`, 'error');
    process.exit(1);
  }
}

// 主函数
async function main() {
  // 确保我们在项目根目录
  const currentDir = process.cwd();
  const deployScriptsDir = path.join(currentDir, 'deploy-scripts');
  
  if (currentDir.endsWith('deploy-scripts')) {
    // 如果在deploy-scripts目录中，则上移一级
    process.chdir('..');
    log('已检测到在deploy-scripts目录中，已移至项目根目录', 'info');
  } else if (!fs.existsSync(deployScriptsDir)) {
    log('错误: 未找到deploy-scripts目录，请确保在正确的项目目录中运行此脚本', 'error');
    process.exit(1);
  }
  
  await deploy();
}

// 运行主函数
main();
EOF
  fi

  # 创建start-auto-deploy.sh文件
  if [ ! -f "start-auto-deploy.sh" ]; then
    log "INFO" "创建start-auto-deploy.sh..."
    cat > start-auto-deploy.sh << EOF
#!/bin/sh
cd "$(pwd)/deploy-scripts"
node auto-deploy.js
EOF
    chmod +x start-auto-deploy.sh
  fi
}

# 检查Vercel登录状态
check_vercel_login() {
  log "INFO" "检查Vercel登录状态..."
  
  # 检查Vercel Token
  npx vercel whoami &> /dev/null
  if [ $? -ne 0 ]; then
    log "WARNING" "未登录Vercel，请使用GitHub账号登录"
    log "INFO" "账号: aquamo@gmail.com"
    npx vercel login
    
    # 再次检查登录状态
    npx vercel whoami &> /dev/null
    if [ $? -ne 0 ]; then
      log "ERROR" "登录Vercel失败，请手动登录后重试"
      log "INFO" "可以尝试使用: npx vercel login"
      exit 1
    fi
    log "SUCCESS" "已成功登录Vercel"
  else
    log "SUCCESS" "已登录Vercel"
  fi
}

# 检查项目链接
check_project_link() {
  log "INFO" "检查项目链接..."
  
  # 检查.vercel目录
  if [ ! -d ".vercel" ]; then
    log "WARNING" "项目未链接到Vercel，尝试链接..."
    npx vercel link
    if [ $? -ne 0 ]; then
      log "ERROR" "项目链接失败，请手动链接后重试"
      exit 1
    fi
    log "SUCCESS" "项目已成功链接到Vercel"
  else
    log "SUCCESS" "项目已链接到Vercel"
  fi
}

# 执行一次性部署
run_single_deploy() {
  log "INFO" "执行一次性部署..."
  
  # 构建项目
  log "INFO" "构建项目..."
  npm run build
  if [ $? -ne 0 ]; then
    log "ERROR" "项目构建失败"
    exit 1
  fi
  log "SUCCESS" "项目构建成功"
  
  # 执行部署
  log "INFO" "部署到Vercel生产环境..."
  npx vercel --prod
  if [ $? -ne 0 ]; then
    log "ERROR" "部署失败"
    exit 1
  fi
  log "SUCCESS" "项目部署成功"
}

# 启动自动部署服务
start_auto_deploy() {
  log "INFO" "启动自动部署服务..."
  
  # 确保start-auto-deploy.sh存在且可执行
  if [ ! -f "start-auto-deploy.sh" ]; then
    log "ERROR" "未找到start-auto-deploy.sh"
    exit 1
  fi
  
  chmod +x start-auto-deploy.sh
  ./start-auto-deploy.sh
}

# 显示菜单
show_menu() {
  echo ""
  echo -e "${BOLD}请选择操作:${NC}"
  echo -e "  ${BOLD}1.${NC} 执行一次性部署"
  echo -e "  ${BOLD}2.${NC} 启动自动部署服务 (监听文件变化)"
  echo -e "  ${BOLD}3.${NC} 退出"
  echo ""
  
  read -p "请输入选项 [1-3]: " choice
  
  case $choice in
    1)
      run_single_deploy
      ;;
    2)
      start_auto_deploy
      ;;
    3)
      log "INFO" "退出部署工具"
      exit 0
      ;;
    *)
      log "WARNING" "无效选项，请重新选择"
      show_menu
      ;;
  esac
}

# 主函数
main() {
  # 检查环境依赖
  check_dependencies
  
  # 安装必要的包
  install_packages
  
  # 检查Vercel登录状态
  check_vercel_login
  
  # 检查项目链接
  check_project_link
  
  # 显示菜单
  show_menu
}

# 执行主函数
main 