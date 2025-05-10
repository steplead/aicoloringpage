-- 启用存储服务的RLS
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 创建存储桶的策略
CREATE POLICY "启用公共访问artworks存储桶" ON storage.buckets
FOR SELECT USING (name = 'artworks');

-- 允许匿名用户上传到artworks存储桶
CREATE POLICY "允许匿名用户上传" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'artworks');

-- 允许匿名用户查看artworks存储桶中的文件
CREATE POLICY "允许公共读取artworks文件" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'artworks');

-- 允许匿名用户更新artworks存储桶中的自己上传的文件
CREATE POLICY "允许匿名用户更新" ON storage.objects
FOR UPDATE TO anon, authenticated
USING (bucket_id = 'artworks');

-- 允许匿名用户删除artworks存储桶中的自己上传的文件
CREATE POLICY "允许匿名用户删除" ON storage.objects
FOR DELETE TO anon, authenticated
USING (bucket_id = 'artworks'); 