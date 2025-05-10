import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// 优先使用环境变量，如果没有则使用硬编码值
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gteszljtjrnckefgxfzb.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0ZXN6bGp0anJuY2tlZmd4ZnpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MzgwMzEsImV4cCI6MjA2MTQxNDAzMX0.bd53xyQmQu69UvqvvdTM5lK4KZ9eMEhiGUiaNKar-bw';

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: { timeout: 30000 }
});

// 检查Supabase连接
async function checkSupabaseConnection() {
  try {
    console.log('检查Supabase连接...');
    const { data, error } = await supabase.from('artworks').select('count');
    
    if (error) {
      console.error('Supabase连接测试失败:', error);
      return false;
    }
    
    console.log('Supabase连接测试成功');
    return true;
  } catch (err) {
    console.error('Supabase连接检查出错:', err);
    return false;
  }
}

// 检查存储桶是否存在
async function checkBucketExists(bucketName) {
  try {
    console.log(`检查存储桶 ${bucketName} 是否存在...`);
    // 获取所有存储桶
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('获取存储桶列表失败:', error);
      return false;
    }
    
    console.log('存储桶列表:', buckets);
    
    // 检查指定名称的存储桶是否存在
    const exists = buckets && Array.isArray(buckets) && buckets.some(bucket => bucket.name === bucketName);
    console.log(`存储桶 ${bucketName} ${exists ? '存在' : '不存在'}`);
    return exists;
  } catch (err) {
    console.error('检查存储桶时出错:', err);
    return false;
  }
}

// 尝试直接列出存储桶内容
async function listBucketContents(bucketName) {
  try {
    console.log(`正在列出存储桶 ${bucketName} 内容...`);
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 10 });
      
    if (error) {
      console.error(`列出存储桶内容失败:`, error);
      return false;
    }
    
    console.log(`存储桶 ${bucketName} 内容:`, data);
    return true;
  } catch (err) {
    console.error('列出存储桶内容时出错:', err);
    return false;
  }
}

// 尝试创建存储桶（如果不存在）
async function createBucketIfNotExists(bucketName) {
  try {
    const exists = await checkBucketExists(bucketName);
    if (!exists) {
      console.log(`尝试创建存储桶 ${bucketName}...`);
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true
      });
      
      if (error) {
        console.error(`创建存储桶失败:`, error);
        return false;
      }
      
      console.log(`成功创建存储桶 ${bucketName}`);
      return true;
    }
    return true;
  } catch (err) {
    console.error('创建存储桶时出错:', err);
    return false;
  }
}

// 保存到本地文件系统（作为备份）
async function saveToLocalFileSystem(base64Data, filename) {
  try {
    // 确定保存路径
    const publicDir = path.join(process.cwd(), 'public');
    const artworksDir = path.join(publicDir, 'artworks');
    const fileDir = path.join(artworksDir, filename.split('/')[0]);
    
    // 确保目录存在
    if (!fs.existsSync(artworksDir)) {
      fs.mkdirSync(artworksDir, { recursive: true });
    }
    
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }
    
    // 移除Base64前缀并解码
    const cleanData = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanData, 'base64');
    
    // 保存文件
    const filePath = path.join(artworksDir, filename);
    fs.writeFileSync(filePath, buffer);
    
    // 返回文件的URL路径
    const urlPath = `/artworks/${filename}`;
    console.log(`成功保存到本地文件系统: ${urlPath}`);
    return urlPath;
  } catch (error) {
    console.error('保存到本地文件系统失败:', error);
    return null;
  }
}

// 带重试的上传函数
async function uploadWithRetry(bucket, filePath, fileBuffer, options, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    console.log(`上传尝试 ${attempt}/${retries}: ${filePath}`);
    try {
      // 直接上传到存储桶根目录下，不使用嵌套路径
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileBuffer, {
          contentType: options.contentType || 'image/png',
          upsert: options.upsert || true
        });
        
      if (error) {
        console.error(`上传失败 (尝试 ${attempt}/${retries}):`, error);
        if (attempt === retries) {
          return { error };
        }
        // 等待一小段时间再重试
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log(`上传成功: ${filePath}`);
        return { data };
      }
    } catch (err) {
      console.error(`上传异常 (尝试 ${attempt}/${retries}):`, err);
      if (attempt === retries) {
        return { error: err };
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return { error: new Error(`上传失败，已重试${retries}次`) };
}

export default async function handler(req, res) {
  // 仅允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' });
  }

  console.log('收到保存艺术作品请求');
  
  try {
    const { title, description, image_data, thumbnail } = req.body;
    
    if (!image_data) {
      console.error('请求中缺少图像数据');
      return res.status(400).json({ error: '图像数据是必需的' });
    }
    
    // 检查Supabase连接
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.log('无法连接到Supabase，将使用本地存储');
    }
    
    console.log(`处理艺术作品: "${title || '无标题'}"`);
    
    // 生成唯一ID
    const artworkId = uuidv4();
    console.log(`生成艺术作品ID: ${artworkId}`);
    
    // 准备图像数据
    const base64Data = image_data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    let imageUrl;
    let thumbnailUrl = null;
    let localImageUrl = null;
    let localThumbnailUrl = null;
    
    // 准备本地备份
    console.log('保存图像到本地文件系统作为备份...');
    localImageUrl = await saveToLocalFileSystem(image_data, `${artworkId}/image.png`);
    
    if (thumbnail) {
      localThumbnailUrl = await saveToLocalFileSystem(thumbnail, `${artworkId}/thumbnail.png`);
    }
    
    // 检查/创建存储桶
    let bucketExists = await checkBucketExists('artworks');
    if (!bucketExists && isConnected) {
      // 尝试创建存储桶
      const created = await createBucketIfNotExists('artworks');
      if (created) {
        bucketExists = true;
      }
    }
    
    // 如果存储桶存在，先尝试列出内容确认访问权限
    if (bucketExists && isConnected) {
      await listBucketContents('artworks');
    }
    
    if (bucketExists && isConnected) {
      // 上传图像到Supabase Storage
      // 简化路径：直接使用artworkId作为文件名而不是路径
      const imagePath = `${artworkId}.png`;
      console.log(`上传图像到Supabase路径: ${imagePath}`);
      
      const { data: imageData, error: imageError } = await uploadWithRetry(
        'artworks',
        imagePath,
        buffer,
        { contentType: 'image/png', upsert: true }
      );
        
      if (imageError) {
        console.error('上传图像到Supabase失败:', imageError);
        // 使用本地URL作为回退
        imageUrl = localImageUrl 
          ? `${process.env.NEXT_PUBLIC_APP_URL || ''}${localImageUrl}`
          : null;
      } else {
        // 获取公共URL
        try {
          const { data } = supabase.storage
            .from('artworks')
            .getPublicUrl(imagePath);
          
          imageUrl = data.publicUrl;
          console.log(`Supabase图像URL: ${imageUrl}`);
        } catch (urlError) {
          console.error('获取图像公共URL失败:', urlError);
          imageUrl = localImageUrl 
            ? `${process.env.NEXT_PUBLIC_APP_URL || ''}${localImageUrl}`
            : null;
        }
      }
      
      // 处理缩略图
      if (thumbnail) {
        const thumbnailData = thumbnail.replace(/^data:image\/\w+;base64,/, '');
        const thumbnailBuffer = Buffer.from(thumbnailData, 'base64');
        
        // 简化路径：使用相同ID但添加后缀
        const thumbnailPath = `${artworkId}_thumb.png`;
        console.log(`上传缩略图到Supabase路径: ${thumbnailPath}`);
        
        const { data: thumbData, error: thumbError } = await uploadWithRetry(
          'artworks',
          thumbnailPath,
          thumbnailBuffer,
          { contentType: 'image/png', upsert: true }
        );
          
        if (thumbError) {
          console.warn('上传缩略图到Supabase失败:', thumbError);
          // 使用本地缩略图URL作为回退
          thumbnailUrl = localThumbnailUrl 
            ? `${process.env.NEXT_PUBLIC_APP_URL || ''}${localThumbnailUrl}`
            : imageUrl;
        } else {
          try {
            const { data } = supabase.storage
              .from('artworks')
              .getPublicUrl(thumbnailPath);
              
            thumbnailUrl = data.publicUrl;
            console.log(`Supabase缩略图URL: ${thumbnailUrl}`);
          } catch (urlError) {
            console.error('获取缩略图公共URL失败:', urlError);
            thumbnailUrl = localThumbnailUrl 
              ? `${process.env.NEXT_PUBLIC_APP_URL || ''}${localThumbnailUrl}`
              : imageUrl;
          }
        }
      }
    } else {
      console.log('使用本地存储URL');
      // 使用本地URL
      imageUrl = localImageUrl 
        ? `${process.env.NEXT_PUBLIC_APP_URL || ''}${localImageUrl}`
        : null;
      
      thumbnailUrl = localThumbnailUrl 
        ? `${process.env.NEXT_PUBLIC_APP_URL || ''}${localThumbnailUrl}`
        : imageUrl;
    }
    
    if (!imageUrl) {
      return res.status(500).json({ 
        error: '保存图像失败，无法创建URL', 
      });
    }
    
    // 保存记录到artworks表
    const artwork = {
      id: artworkId,
      title: title || '无标题作品',
      description: description || '',
      image_url: imageUrl,
      thumbnail_url: thumbnailUrl || imageUrl,
      is_public: true,
      created_at: new Date().toISOString(),
      local_path: localImageUrl
    };
    
    // 尝试保存到数据库
    if (isConnected) {
      console.log('保存艺术作品记录到Supabase数据库');
      
      try {
        // 如果上传了文件但表不存在，尝试创建表
        try {
          await supabase.rpc('create_artworks_table_if_not_exists');
        } catch (tableError) {
          console.log('尝试创建artworks表:', tableError);
        }
        
        // 插入记录
        const { data, error } = await supabase
          .from('artworks')
          .insert([artwork])
          .select();
          
        if (error) {
          console.error('保存艺术作品记录到数据库失败:', error);
          // 即使数据库记录失败，也返回成功，因为图像已保存
          return res.status(200).json({ 
            success: true,
            warning: '图像已保存，但元数据保存失败', 
            details: error.message,
            artwork: { ...artwork, warning: true }
          });
        }
        
        console.log('艺术作品成功保存到数据库');
        // 返回成功消息和完整艺术作品对象（包括ID）
        return res.status(200).json({ 
          success: true, 
          artwork: data && data.length > 0 ? data[0] : artwork
        });
      } catch (dbError) {
        console.error('数据库操作失败:', dbError);
        // 表可能不存在，但图像已保存
        return res.status(200).json({ 
          success: true,
          warning: '图像已保存，但数据库操作失败', 
          details: dbError.message,
          artwork: { ...artwork, warning: true }
        });
      }
    } else {
      console.log('由于无法连接到Supabase，跳过数据库保存');
      return res.status(200).json({ 
        success: true, 
        artwork,
        local_backup: Boolean(localImageUrl),
        warning: '图像已保存到本地，但未连接到Supabase'
      });
    }
  } catch (error) {
    console.error('保存艺术作品过程中发生错误:', error);
    return res.status(500).json({ 
      error: '保存艺术作品失败', 
      details: error.message || '未知错误',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 