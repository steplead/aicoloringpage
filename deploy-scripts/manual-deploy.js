#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');

// 设置版本和描述
program
  .version('1.0.0')
  .description('Vercel项目手动部署工具');

// 命令行选项
program
  .option('-p, --prod', '部署到生产环境')
  .option('-f, --force', '强制部署，跳过确认')
  .option('-s, --skip-build', '跳过构建步骤')
  .option('-c, --copy-url', '部署后复制URL到剪贴板')
  .option('-v, --verbose', '显示详细日志');

program.parse(process.argv);
const options = program.opts();

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
    if (!options.skipBuild) {
      log('正在构建项目...', 'info');
      await executeCommand('npm run build');
      log('项目构建完成', 'success');
    } else {
      log('跳过构建步骤', 'warning');
    }
    
    // 2. 确定部署环境
    const deployEnvironment = options.prod ? '生产环境' : '预览环境';
    log(`准备部署到${deployEnvironment}`, 'info');
    
    // 3. 确认部署
    if (!options.force) {
      const { confirmDeploy } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmDeploy',
          message: `确认部署到${deployEnvironment}?`,
          default: false
        }
      ]);
      
      if (!confirmDeploy) {
        log('部署已取消', 'warning');
        return;
      }
    }
    
    // 4. 执行部署命令
    const deployCommand = options.prod ? 'npx vercel --prod' : 'npx vercel';
    log(`开始部署...`, 'info');
    
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
    
    // 5. 提取部署URL
    const urlMatch = deployOutput.match(/https:\/\/[^\s]+/);
    const deployUrl = urlMatch ? urlMatch[0] : '未找到部署URL';
    
    log(`部署成功! 部署地址: ${deployUrl}`, 'success');
    
    // 6. 复制URL到剪贴板（如果指定了选项）
    if (options.copyUrl && deployUrl !== '未找到部署URL') {
      try {
        // 在Mac上使用pbcopy
        if (process.platform === 'darwin') {
          const pbcopy = exec('pbcopy');
          pbcopy.stdin.write(deployUrl);
          pbcopy.stdin.end();
          log('部署URL已复制到剪贴板', 'success');
        } 
        // 在Windows上使用clip
        else if (process.platform === 'win32') {
          exec(`echo ${deployUrl} | clip`);
          log('部署URL已复制到剪贴板', 'success');
        }
        // 在Linux上使用xclip（如果安装了）
        else if (process.platform === 'linux') {
          exec(`echo "${deployUrl}" | xclip -selection clipboard`);
          log('部署URL已复制到剪贴板 (需要xclip)', 'success');
        }
      } catch (error) {
        log(`无法复制到剪贴板: ${error.message}`, 'warning');
      }
    }
    
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