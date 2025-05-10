#!/bin/bash

# 创建目录结构
mkdir -p website-files/_next/static/css
mkdir -p website-files/_next/static/chunks
mkdir -p website-files/_next/static/chunks/pages
mkdir -p website-files/_next/static/f88_4BiJqcvw8dDb2p9yR
mkdir -p website-files/ghibli-assets/backgrounds
mkdir -p website-files/ghibli-assets/icons
mkdir -p website-files/coloring
mkdir -p website-files/gallery

# 下载CSS文件
curl -L -o website-files/_next/static/css/3c71a73806f022fe.css https://www.ai-coloringpage.com/_next/static/css/3c71a73806f022fe.css

# 下载JavaScript文件
curl -L -o website-files/_next/static/chunks/webpack-cba78dcb9a47f8b8.js https://www.ai-coloringpage.com/_next/static/chunks/webpack-cba78dcb9a47f8b8.js
curl -L -o website-files/_next/static/chunks/framework-66d32731bdd20e83.js https://www.ai-coloringpage.com/_next/static/chunks/framework-66d32731bdd20e83.js
curl -L -o website-files/_next/static/chunks/main-bac2f07e2c919777.js https://www.ai-coloringpage.com/_next/static/chunks/main-bac2f07e2c919777.js
curl -L -o website-files/_next/static/chunks/pages/_app-86cd9acd6925d8f7.js https://www.ai-coloringpage.com/_next/static/chunks/pages/_app-86cd9acd6925d8f7.js
curl -L -o website-files/_next/static/chunks/275-1bd13e42813a754e.js https://www.ai-coloringpage.com/_next/static/chunks/275-1bd13e42813a754e.js
curl -L -o website-files/_next/static/chunks/675-cadafe4612252715.js https://www.ai-coloringpage.com/_next/static/chunks/675-cadafe4612252715.js
curl -L -o website-files/_next/static/chunks/490-d3860dbc2fac6ce4.js https://www.ai-coloringpage.com/_next/static/chunks/490-d3860dbc2fac6ce4.js
curl -L -o website-files/_next/static/chunks/pages/index-bb2fd6f5cee185e4.js https://www.ai-coloringpage.com/_next/static/chunks/pages/index-bb2fd6f5cee185e4.js
curl -L -o website-files/_next/static/f88_4BiJqcvw8dDb2p9yR/_buildManifest.js https://www.ai-coloringpage.com/_next/static/f88_4BiJqcvw8dDb2p9yR/_buildManifest.js
curl -L -o website-files/_next/static/f88_4BiJqcvw8dDb2p9yR/_ssgManifest.js https://www.ai-coloringpage.com/_next/static/f88_4BiJqcvw8dDb2p9yR/_ssgManifest.js

# 下载图片和资源
curl -L -o website-files/ghibli-assets/backgrounds/main-bg.jpeg https://www.ai-coloringpage.com/ghibli-assets/backgrounds/main-bg.jpeg
curl -L -o website-files/ghibli-assets/icons/magic-wand.svg https://www.ai-coloringpage.com/ghibli-assets/icons/magic-wand.svg
curl -L -o website-files/favicon.ico https://www.ai-coloringpage.com/favicon.ico

# 下载其他页面
curl -L -o website-files/coloring/index.html https://www.ai-coloringpage.com/coloring
curl -L -o website-files/gallery/index.html https://www.ai-coloringpage.com/gallery

echo "基本资源下载完成！" 