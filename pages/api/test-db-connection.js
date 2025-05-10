import { supabase } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    // 使用给定的URL和Key创建一个新的客户端
    const customSupabase = createClient(
      'https://gteszljtjrnckefgxfzb.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0ZXN6bGp0anJuY2tlZmd4ZnpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MzgwMzEsImV4cCI6MjA2MTQxNDAzMX0.bd53xyQmQu69UvqvvdTM5lK4KZ9eMEhiGUiaNKar-bw'
    );

    // 测试现有supabase客户端连接
    const { data: existingTest, error: existingError } = await supabase.from('profiles').select('count').limit(1);
    
    // 测试使用提供的凭据的自定义客户端连接
    const { data: customTest, error: customError } = await customSupabase.from('profiles').select('count').limit(1);

    // 检查系统环境变量
    const envSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const envSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 返回结果
    res.status(200).json({
      success: true,
      existingConnection: {
        success: !existingError,
        error: existingError ? existingError.message : null,
        data: existingTest
      },
      customConnection: {
        success: !customError,
        error: customError ? customError.message : null,
        data: customTest
      },
      environmentVariables: {
        url: envSupabaseUrl ? '已设置' : '未设置',
        key: envSupabaseKey ? '已设置' : '未设置'
      }
    });
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    res.status(500).json({
      success: false,
      message: '数据库连接测试失败',
      error: error.message
    });
  }
} 