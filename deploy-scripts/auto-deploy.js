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
  confirmBeforeDeploy: true,
  // 每次变动后是否总是部署到生产环境
  alwaysDeployToProd: false
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