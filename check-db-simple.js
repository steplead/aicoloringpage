const https = require('https');

// 使用提供的 URL 和 Key
const supabaseUrl = 'https://gteszljtjrnckefgxfzb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0ZXN6bGp0anJuY2tlZmd4ZnpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MzgwMzEsImV4cCI6MjA2MTQxNDAzMX0.bd53xyQmQu69UvqvvdTM5lK4KZ9eMEhiGUiaNKar-bw';

// 去掉 URL 中的协议
const baseUrl = supabaseUrl.replace(/^https?:\/\//, '');

// 创建一个简单的 HTTP 请求选项
const options = {
  hostname: baseUrl,
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  }
};

console.log(`正在尝试连接到: ${baseUrl}`);

// 发送请求
const req = https.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  
  if (res.statusCode === 200) {
    console.log('连接成功!');
  } else {
    console.log('连接失败，HTTP 状态码不是 200');
  }
  
  res.on('data', (d) => {
    console.log('响应数据:');
    console.log(d.toString());
  });
});

req.on('error', (e) => {
  console.error(`请求错误: ${e.message}`);
});

req.end(); 