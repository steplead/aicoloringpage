import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '只支持GET请求' });
  }
  
  try {
    // 本地艺术作品目录
    const artworksDir = path.join(process.cwd(), 'public', 'artworks');
    
    // 检查目录是否存在
    if (!fs.existsSync(artworksDir)) {
      console.log('作品目录不存在，创建演示作品');
      // 返回一些示例作品
      return res.status(200).json({
        artworks: getSampleArtworks()
      });
    }
    
    // 获取所有作品文件夹
    const directories = fs.readdirSync(artworksDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log('在本地找到的作品目录:', directories);
    
    // 将目录转换为艺术作品对象
    const artworks = directories.map(dirName => {
      // 检查图像文件是否存在
      const imagePath = path.join(artworksDir, dirName, 'image.png');
      const thumbnailPath = path.join(artworksDir, dirName, 'thumbnail.png');
      
      const hasImage = fs.existsSync(imagePath);
      const hasThumbnail = fs.existsSync(thumbnailPath);
      
      // 获取目录的创建时间
      const stats = fs.statSync(path.join(artworksDir, dirName));
      const createdAt = stats.birthtime || stats.ctime;
      
      return {
        id: dirName,
        title: `作品 ${new Date(createdAt).toLocaleString()}`,
        description: '使用AI涂色工具创建的作品',
        image_url: hasImage ? `/artworks/${dirName}/image.png` : '/ghibli-assets/templates/thumbnails/template-1.png',
        thumbnail_url: hasThumbnail ? `/artworks/${dirName}/thumbnail.png` : (hasImage ? `/artworks/${dirName}/image.png` : '/ghibli-assets/templates/thumbnails/template-1.png'),
        created_at: createdAt.toISOString(),
        source: 'local'
      };
    });
    
    // 按创建时间排序（最新的在前面）
    const sortedArtworks = artworks.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return res.status(200).json({
      artworks: sortedArtworks.length > 0 ? sortedArtworks : getSampleArtworks()
    });
    
  } catch (error) {
    console.error('获取本地作品失败:', error);
    // 出错时也返回一些示例作品
    return res.status(200).json({
      artworks: getSampleArtworks(),
      error: {
        message: error.message,
        fallback: true
      }
    });
  }
}

// 获取示例作品
function getSampleArtworks() {
  return [
    {
      id: 'sample-artwork-1',
      title: '示例作品 1',
      description: '这是一个示例作品，用于演示画廊功能',
      image_url: '/ghibli-assets/templates/thumbnails/template-1.png',
      thumbnail_url: '/ghibli-assets/templates/thumbnails/template-1.png',
      created_at: new Date().toISOString(),
      source: 'sample'
    },
    {
      id: 'sample-artwork-2',
      title: '示例作品 2',
      description: '这是另一个示例作品',
      image_url: '/ghibli-assets/templates/thumbnails/template-2.png',
      thumbnail_url: '/ghibli-assets/templates/thumbnails/template-2.png',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      source: 'sample'
    }
  ];
} 