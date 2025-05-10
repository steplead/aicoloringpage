#!/bin/sh

# 自动部署工具安装脚本
echo "=========================================================="
echo "      Vercel自动部署工具安装脚本"
echo "=========================================================="

# 检查Node.js是否已安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未检测到Node.js，请先安装Node.js"
    exit 1
fi

# 检查npm是否已安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未检测到npm，请先安装npm"
    exit 1
fi

# 检查vercel CLI是否已安装
if ! command -v npx vercel --version &> /dev/null; then
    echo "⚠️ 警告: 未检测到Vercel CLI，将尝试使用npx运行"
fi

# 创建deploy-scripts目录
if [ ! -d "deploy-scripts" ]; then
    echo "创建deploy-scripts目录..."
    mkdir -p deploy-scripts
fi

# 检查deploy-scripts目录中的文件是否存在
REQUIRED_FILES=("auto-deploy.js" "manual-deploy.js" "setup.js" "package.json" "README.md")
MISSING_FILES=0

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "deploy-scripts/$file" ]; then
        echo "⚠️ 警告: 未找到 deploy-scripts/$file"
        MISSING_FILES=1
    fi
done

if [ $MISSING_FILES -eq 1 ]; then
    echo "有文件缺失，这可能导致安装失败。"
    read -p "是否继续? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "安装已取消"
        exit 1
    fi
fi

# 安装依赖
echo "安装依赖..."
cd deploy-scripts
npm install

# 设置可执行权限
chmod +x ../start-auto-deploy.sh

# 运行设置向导
echo "运行设置向导..."
node setup.js

echo "安装完成！"
echo "你可以使用以下命令启动自动部署服务:"
echo "npm run auto-deploy"
echo "或:"
echo "./start-auto-deploy.sh" 