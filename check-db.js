const { createClient } = require('@supabase/supabase-js');

// 使用提供的 URL 和 Key 创建一个 Supabase 客户端
const supabaseUrl = 'https://gteszljtjrnckefgxfzb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0ZXN6bGp0anJuY2tlZmd4ZnpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MzgwMzEsImV4cCI6MjA2MTQxNDAzMX0.bd53xyQmQu69UvqvvdTM5lK4KZ9eMEhiGUiaNKar-bw';

const supabase = createClient(supabaseUrl, supabaseKey);

// 测试连接：尝试获取当前时间
async function testConnection() {
  try {
    // 尝试执行一个简单的数据库查询
    const { data, error } = await supabase.from('_test').select('now()').limit(1);
    
    if (error) {
      console.error('数据库连接错误:', error.message);
      return false;
    }
    
    console.log('数据库连接成功!');
    console.log('数据库当前时间:', data);
    return true;
  } catch (err) {
    console.error('测试过程中发生异常:', err.message);
    return false;
  }
}

// 测试数据库结构
async function checkDatabaseStructure() {
  try {
    // 尝试列出所有表
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
    console.error('检查数据库结构时发生异常:', err.message);
  }
}

// 执行测试
(async () => {
  console.log('开始测试 Supabase 数据库连接...');
  const connectionOk = await testConnection();
  
  if (connectionOk) {
    await checkDatabaseStructure();
  }
  
  console.log('测试完成.');
})(); 