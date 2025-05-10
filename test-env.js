// 设置环境变量
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://gteszljtjrnckefgxfzb.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0ZXN6bGp0anJuY2tlZmd4ZnpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MzgwMzEsImV4cCI6MjA2MTQxNDAzMX0.bd53xyQmQu69UvqvvdTM5lK4KZ9eMEhiGUiaNKar-bw';

// 导入 Supabase 客户端
const { createClient } = require('@supabase/supabase-js');

// 创建客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 测试连接
async function testConnection() {
  try {
    console.log('正在连接到:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    // 尝试执行一个简单的查询
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('数据库连接错误:', error.message);
      return;
    }
    
    console.log('数据库连接成功!');
    console.log('查询结果:', data);
    
    // 尝试获取表列表
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('无法获取表列表:', tablesError.message);
      return;
    }
    
    console.log('数据库中的公共表:');
    if (tables && tables.length > 0) {
      tables.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    } else {
      console.log('没有找到公共表');
    }
  } catch (err) {
    console.error('测试过程中发生异常:', err.message);
  }
}

// 执行测试
testConnection(); 