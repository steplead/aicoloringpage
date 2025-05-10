import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '../../components/layouts/main-layout';
import { createClient } from '@supabase/supabase-js';
import Head from 'next/head';

// 创建Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gteszljtjrnckefgxfzb.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0ZXN6bGp0anJuY2tlZmd4ZnpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MzgwMzEsImV4cCI6MjA2MTQxNDAzMX0.bd53xyQmQu69UvqvvdTM5lK4KZ9eMEhiGUiaNKar-bw';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Gallery() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 背景图片路径
  const backgroundImagePath = '/ghibli-assets/backgrounds/gallery-bg.jpeg';
  
  // 加载所有作品
  useEffect(() => {
    async function fetchArtworks() {
      try {
        setLoading(true);
        console.log('开始获取画廊作品...');
        
        // 首先尝试列出存储桶中的文件
        try {
          const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
          console.log('存储桶列表:', buckets, '错误:', bucketError);
          
          // 检查artworks存储桶是否存在
          if (buckets && Array.isArray(buckets)) {
            const artworksBucket = buckets.find(b => b.name === 'artworks');
            if (artworksBucket) {
              console.log('找到artworks存储桶');
            } else {
              console.log('未找到artworks存储桶');
            }
          }
        } catch (bucketErr) {
          console.error('检查存储桶时出错:', bucketErr);
        }
        
        // 尝试从Supabase数据库获取作品
        console.log('正在从数据库获取作品...');
        const { data, error } = await supabase
          .from('artworks')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('从数据库获取作品失败:', error);
          
          // 尝试直接从存储桶获取文件清单
          console.log('尝试直接从存储桶获取文件...');
          try {
            const { data: files, error: filesError } = await supabase
              .storage
              .from('artworks')
              .list('', {
                limit: 100,
                sortBy: { column: 'name', order: 'desc' },
              });
              
            if (filesError) {
              console.error('从存储桶获取文件列表失败:', filesError);
            } else if (files && files.length > 0) {
              console.log('从存储桶获取的文件:', files);
              
              // 从文件构建作品对象
              const storageArtworks = files
                .filter(file => !file.name.includes('_thumb') && file.name.endsWith('.png'))
                .map(file => {
                  const id = file.name.replace('.png', '');
                  const hasThumb = files.some(f => f.name === `${id}_thumb.png`);
                  
                  // 构建URL
                  const imageUrl = supabase.storage
                    .from('artworks')
                    .getPublicUrl(file.name).data.publicUrl;
                    
                  const thumbnailUrl = hasThumb 
                    ? supabase.storage
                        .from('artworks')
                        .getPublicUrl(`${id}_thumb.png`).data.publicUrl
                    : imageUrl;
                  
                  return {
                    id,
                    title: `作品 ${new Date(file.created_at || Date.now()).toLocaleString()}`,
                    description: '使用AI涂色工具创建的作品',
                    image_url: imageUrl,
                    thumbnail_url: thumbnailUrl,
                    created_at: file.created_at || new Date().toISOString(),
                    source: 'storage'
                  };
                });
                
              if (storageArtworks.length > 0) {
                console.log('从存储桶构建的作品:', storageArtworks);
                setArtworks(storageArtworks);
                setLoading(false);
                return;
              }
            }
          } catch (storageErr) {
            console.error('直接从存储桶获取文件失败:', storageErr);
          }
          
          // 尝试本地路径获取作品
          console.log('尝试从本地文件加载作品...');
          const localArtworks = await fetch('/api/gallery/local-artworks')
            .then(res => res.json())
            .catch(err => {
              console.error('获取本地作品失败:', err);
              return { artworks: [] };
            });
            
          if (localArtworks && localArtworks.artworks && localArtworks.artworks.length > 0) {
            console.log('从本地加载的作品:', localArtworks.artworks);
            setArtworks(localArtworks.artworks);
          } else {
            throw new Error('无法从任何来源获取作品');
          }
        } else if (data && data.length > 0) {
          console.log('从数据库获取的作品:', data);
          setArtworks(data);
        } else {
          console.log('数据库中没有作品，尝试从存储桶获取...');
          
          // 生成一些示例作品（如果没有从任何来源获取到作品）
          const demoArtworks = [
            {
              id: 'demo-artwork-1',
              title: '示例作品 1',
              description: '这是一个示例作品，用于演示画廊功能',
              image_url: '/ghibli-assets/templates/thumbnails/template-1.png',
              thumbnail_url: '/ghibli-assets/templates/thumbnails/template-1.png',
              created_at: new Date().toISOString()
            },
            {
              id: 'demo-artwork-2',
              title: '示例作品 2',
              description: '这是另一个示例作品',
              image_url: '/ghibli-assets/templates/thumbnails/template-2.png',
              thumbnail_url: '/ghibli-assets/templates/thumbnails/template-2.png',
              created_at: new Date(Date.now() - 86400000).toISOString()
            }
          ];
          
          setArtworks(demoArtworks);
          console.log('使用示例作品:', demoArtworks);
        }
      } catch (err) {
        console.error('获取画廊作品失败:', err);
        setError(err.message || '加载作品失败');
        
        // 设置一些示例作品以防所有数据源都失败
        const fallbackArtworks = [
          {
            id: 'fallback-artwork-1',
            title: '示例作品',
            description: '暂时无法加载真实作品，这是一个示例',
            image_url: '/ghibli-assets/templates/thumbnails/template-1.png',
            thumbnail_url: '/ghibli-assets/templates/thumbnails/template-1.png',
            created_at: new Date().toISOString()
          }
        ];
        
        setArtworks(fallbackArtworks);
        console.log('使用备用作品:', fallbackArtworks);
      } finally {
        setLoading(false);
      }
    }
    
    fetchArtworks();
  }, []);
  
  return (
    <MainLayout backgroundImage={backgroundImagePath}>
      <Head>
        <title>AI涂色画廊 | 探索创意作品</title>
        <meta name="description" content="浏览AI涂色工具创建的精彩作品，获取灵感并分享你的创意。" />
      </Head>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-ghibli-dark-brown mb-4">
            创意画廊
          </h1>
          <p className="text-lg text-ghibli-dark-brown/80 max-w-2xl mx-auto">
            探索使用我们的AI涂色工具创建的精彩作品。想要展示你的创意吗？使用我们的工具创建你自己的涂色作品！
          </p>
          
          <Link href="/" className="mt-6 inline-block">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-ghibli-primary hover:bg-ghibli-primary/90 text-white font-bold py-3 px-6 rounded-full shadow-lg"
            >
              创建新作品
            </motion.button>
          </Link>
        </motion.div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ghibli-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md">
            <p>加载作品时出错: {error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {artworks.length > 0 ? (
              artworks.map((artwork) => (
                <motion.div
                  key={artwork.id}
                  whileHover={{ y: -5, scale: 1.02 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href={`/gallery/${artwork.id}`}>
                    <div className="relative pb-[75%] overflow-hidden">
                      <Image
                        src={artwork.thumbnail_url || artwork.image_url}
                        alt={artwork.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-ghibli-dark-brown line-clamp-1">{artwork.title}</h3>
                      <p className="text-sm text-ghibli-dark-brown/70 mt-1 line-clamp-2">{artwork.description}</p>
                      <p className="text-xs text-ghibli-primary mt-2">
                        {new Date(artwork.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-xl text-ghibli-dark-brown/70">还没有作品。成为第一个创建作品的人吧！</p>
                <Link href="/" className="mt-4 inline-block">
                  <button className="bg-ghibli-primary hover:bg-ghibli-primary/90 text-white font-bold py-2 px-4 rounded-full">
                    创建作品
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
} 