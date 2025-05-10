#!/bin/bash

# 删除以前的目录并重新开始
rm -rf website-files
mkdir -p website-files

# 下载首页
curl -L -o website-files/index.html https://www.ai-coloringpage.com/

# 分析HTML文件，提取资源文件
cd website-files

# 创建目录结构
mkdir -p _next/static/css
mkdir -p _next/static/chunks/pages
mkdir -p _next/static/chunks
mkdir -p _next/static/f88_4BiJqcvw8dDb2p9yR
mkdir -p ghibli-assets/backgrounds
mkdir -p ghibli-assets/icons
mkdir -p coloring
mkdir -p gallery

# 下载CSS
echo "下载CSS文件..."
curl -L -o _next/static/css/3c71a73806f022fe.css https://www.ai-coloringpage.com/_next/static/css/3c71a73806f022fe.css

# 下载JS文件
echo "下载JS文件..."
curl -L -o _next/static/chunks/webpack-cba78dcb9a47f8b8.js https://www.ai-coloringpage.com/_next/static/chunks/webpack-cba78dcb9a47f8b8.js
curl -L -o _next/static/chunks/framework-66d32731bdd20e83.js https://www.ai-coloringpage.com/_next/static/chunks/framework-66d32731bdd20e83.js
curl -L -o _next/static/chunks/main-bac2f07e2c919777.js https://www.ai-coloringpage.com/_next/static/chunks/main-bac2f07e2c919777.js
curl -L -o _next/static/chunks/pages/_app-86cd9acd6925d8f7.js https://www.ai-coloringpage.com/_next/static/chunks/pages/_app-86cd9acd6925d8f7.js
curl -L -o _next/static/chunks/275-1bd13e42813a754e.js https://www.ai-coloringpage.com/_next/static/chunks/275-1bd13e42813a754e.js
curl -L -o _next/static/chunks/675-cadafe4612252715.js https://www.ai-coloringpage.com/_next/static/chunks/675-cadafe4612252715.js
curl -L -o _next/static/chunks/490-d3860dbc2fac6ce4.js https://www.ai-coloringpage.com/_next/static/chunks/490-d3860dbc2fac6ce4.js
curl -L -o _next/static/chunks/pages/index-bb2fd6f5cee185e4.js https://www.ai-coloringpage.com/_next/static/chunks/pages/index-bb2fd6f5cee185e4.js

# 下载清单文件
echo "下载清单文件..."
curl -L -o _next/static/f88_4BiJqcvw8dDb2p9yR/_buildManifest.js https://www.ai-coloringpage.com/_next/static/f88_4BiJqcvw8dDb2p9yR/_buildManifest.js
curl -L -o _next/static/f88_4BiJqcvw8dDb2p9yR/_ssgManifest.js https://www.ai-coloringpage.com/_next/static/f88_4BiJqcvw8dDb2p9yR/_ssgManifest.js

# 下载图片资源
echo "下载图片资源..."
curl -L -o ghibli-assets/backgrounds/main-bg.jpeg https://www.ai-coloringpage.com/ghibli-assets/backgrounds/main-bg.jpeg
curl -L -o ghibli-assets/icons/magic-wand.svg https://www.ai-coloringpage.com/ghibli-assets/icons/magic-wand.svg
curl -L -o favicon.ico https://www.ai-coloringpage.com/favicon.ico

# 下载其他页面
echo "下载其他页面..."
curl -L -o coloring/index.html https://www.ai-coloringpage.com/coloring
curl -L -o gallery/index.html https://www.ai-coloringpage.com/gallery

echo "下载完成！网站文件保存在 website-files 目录中。" 