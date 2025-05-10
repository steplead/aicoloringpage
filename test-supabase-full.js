const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Supabase配置
const supabaseUrl = 'https://gteszljtjrnckefgxfzb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0ZXN6bGp0anJuY2tlZmd4ZnpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MzgwMzEsImV4cCI6MjA2MTQxNDAzMX0.bd53xyQmQu69UvqvvdTM5lK4KZ9eMEhiGUiaNKar-bw';

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: { timeout: 30000 }
});

async function runTests() {
  console.log('===== Supabase 全面测试 =====');
  try {
    // 测试1: 连接测试
    console.log('\n1. 测试数据库连接');
    const { data: dbData, error: dbError } = await supabase.from('artworks').select('count');
    if (dbError) {
      console.error('  [失败] 数据库连接测试:', dbError);
    } else {
      console.log('  [成功] 数据库连接测试, 结果:', dbData);
    }

    // 测试2: 检查存储桶
    console.log('\n2. 检查存储桶');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('  [失败] 获取存储桶列表:', bucketsError);
    } else {
      console.log('  [成功] 获取到存储桶列表:', buckets);
      
      // 检查artworks存储桶是否存在
      const artworksBucket = buckets.find(b => b.name === 'artworks');
      if (artworksBucket) {
        console.log('  [信息] artworks存储桶已存在');
      } else {
        console.log('  [信息] artworks存储桶不存在，尝试创建');
        
        // 创建存储桶
        const { data: createData, error: createError } = await supabase.storage.createBucket('artworks', {
          public: true
        });
        
        if (createError) {
          console.error('  [失败] 创建artworks存储桶:', createError);
        } else {
          console.log('  [成功] 创建artworks存储桶');
        }
      }
    }

    // 测试3: 上传测试文件
    console.log('\n3. 测试文件上传');
    
    // 创建测试图像内容 (1x1像素的PNG)
    const testBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    
    // 尝试上传
    const testFilePath = 'test/test-image.png';
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('artworks')
      .upload(testFilePath, testBuffer, {
        contentType: 'image/png',
        upsert: true
      });
      
    if (uploadError) {
      console.error('  [失败] 上传测试文件:', uploadError);
    } else {
      console.log('  [成功] 上传测试文件:', uploadData);
      
      // 生成公共URL
      const { data: { publicUrl } } = supabase.storage
        .from('artworks')
        .getPublicUrl(testFilePath);
        
      console.log('  [信息] 文件公共URL:', publicUrl);
      
      // 尝试删除测试文件
      console.log('\n4. 清理测试文件');
      const { data: removeData, error: removeError } = await supabase.storage
        .from('artworks')
        .remove([testFilePath]);
        
      if (removeError) {
        console.error('  [失败] 删除测试文件:', removeError);
      } else {
        console.log('  [成功] 删除测试文件');
      }
    }
    
    // 测试4: 插入数据库记录
    console.log('\n5. 测试数据库插入');
    const testRecord = {
      id: uuidv4(),
      title: '测试作品',
      description: '这是一个测试记录',
      image_url: 'https://example.com/test.png',
      thumbnail_url: 'https://example.com/test-thumb.png',
      is_public: true,
      created_at: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('artworks')
      .insert([testRecord]);
      
    if (insertError) {
      console.error('  [失败] 插入测试记录:', insertError);
    } else {
      console.log('  [成功] 插入测试记录');
      
      // 尝试删除测试记录
      const { error: deleteError } = await supabase
        .from('artworks')
        .delete()
        .eq('id', testRecord.id);
        
      if (deleteError) {
        console.error('  [失败] 删除测试记录:', deleteError);
      } else {
        console.log('  [成功] 删除测试记录');
      }
    }

  } catch (error) {
    console.error('测试过程中出现错误:', error);
  } finally {
    console.log('\n===== 测试完成 =====');
  }
}

// 运行测试
runTests(); 