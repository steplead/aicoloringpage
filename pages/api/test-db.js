import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    // 使用直接提供的URL和Key创建客户端
    const supabase = createClient(
      'https://gteszljtjrnckefgxfzb.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0ZXN6bGp0anJuY2tlZmd4ZnpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MzgwMzEsImV4cCI6MjA2MTQxNDAzMX0.bd53xyQmQu69UvqvvdTM5lK4KZ9eMEhiGUiaNKar-bw'
    );

    // 尝试连接到数据库并查询
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
      
    // 检查错误
    if (error) {
      return res.status(500).json({
        success: false,
        message: '数据库连接失败',
        error: error.message
      });
    }
    
    // 连接成功
    return res.status(200).json({
      success: true,
      message: '数据库连接成功',
      data
    });
  } catch (error) {
    console.error('数据库连接测试异常:', error);
    return res.status(500).json({
      success: false,
      message: '数据库连接测试异常',
      error: error.message
    });
  }
} 