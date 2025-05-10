import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import MainLayout from '../../components/layouts/main-layout';
import { createClient } from '@supabase/supabase-js';
import Head from 'next/head';

// 创建Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gteszljtjrnckefgxfzb.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0ZXN6bGp0anJuY2tlZmd4ZnpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MzgwMzEsImV4cCI6MjA2MTQxNDAzMX0.bd53xyQmQu69UvqvvdTM5lK4KZ9eMEhiGUiaNKar-bw';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ArtworkDetails() {
  const router = useRouter();
  const { id } = router.query;
  
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 背景图片路径
  const backgroundImagePath = '/ghibli-assets/backgrounds/artwork-bg.jpeg';
  
  // 获取作品详情
  useEffect(() => {
    async function fetchArtwork() {
      if (!id) return; // 等待ID参数加载
      
      try {
        setLoading(true);
        
        // 从Supabase获取作品
        const { data, error } = await supabase
          .from('artworks')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          console.log('从数据库获取作品失败，尝试从存储获取:', error);
          
          // 如果数据库获取失败，尝试从存储直接获取
          const imageUrl = supabase.storage
            .from('artworks')
            .getPublicUrl(`public/${id}/image.png`).data.publicUrl;
            
          const thumbnailUrl = supabase.storage
            .from('artworks')
            .getPublicUrl(`public/${id}/thumbnail.png`).data.publicUrl;
            
          // 创建一个基本的作品对象
          const storageArtwork = {
            id: id,
            title: `作品 ${new Date().toLocaleString()}`,
            description: '使用AI涂色工具创建的作品',
            image_url: imageUrl,
            thumbnail_url: thumbnailUrl,
            created_at: new Date().toISOString(),
          };
          
          setArtwork(storageArtwork);
        } else {
          setArtwork(data);
        }
      } catch (err) {
        console.error('获取作品详情失败:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchArtwork();
  }, [id]);
  
  // 下载图片
  const handleDownload = () => {
    if (!artwork) return;
    
    // 创建一个临时链接并模拟点击下载
    const link = document.createElement('a');
    link.href = artwork.image_url;
    link.download = `${artwork.title || '作品'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // 打印图片
  const handlePrint = () => {
    if (!artwork) return;
    
    // 创建一个新窗口并打印图片
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('请允许打开新窗口以便打印');
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>打印: ${artwork.title || '作品'}</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            img {
              max-width: 100%;
              max-height: 100vh;
            }
            @media print {
              body {
                height: auto;
              }
            }
          </style>
        </head>
        <body>
          <img src="${artwork.image_url}" alt="${artwork.title || '作品'}" />
          <script>
            // 自动打印后关闭窗口
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
  };
  
  return (
    <MainLayout backgroundImage={backgroundImagePath}>
      <Head>
        <title>{artwork ? `${artwork.title} | AI涂色画廊` : '作品详情 | AI涂色画廊'}</title>
        <meta name="description" content={artwork?.description || '查看AI涂色工具创建的精彩作品'} />
      </Head>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/gallery" className="inline-flex items-center text-ghibli-primary hover:text-ghibli-primary/80 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            返回画廊
          </Link>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ghibli-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md">
              <p>加载作品时出错: {error}</p>
            </div>
          ) : artwork ? (
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-7/12">
                    <div className="relative rounded-xl overflow-hidden shadow-md">
                      <Image
                        src={artwork.image_url}
                        alt={artwork.title}
                        width={800}
                        height={600}
                        style={{ width: '100%', height: 'auto' }}
                        className="object-contain bg-white"
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
                      />
                    </div>
                  </div>
                  
                  <div className="w-full md:w-5/12">
                    <h1 className="text-2xl md:text-3xl font-bold text-ghibli-dark-brown">
                      {artwork.title}
                    </h1>
                    
                    {artwork.description && (
                      <p className="mt-3 text-ghibli-dark-brown/80">
                        {artwork.description}
                      </p>
                    )}
                    
                    <div className="mt-4 text-sm text-ghibli-light-brown">
                      创建于: {new Date(artwork.created_at).toLocaleString()}
                    </div>
                    
                    <div className="mt-8 flex flex-col gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDownload}
                        className="bg-ghibli-primary hover:bg-ghibli-primary/90 text-white font-bold py-3 px-6 rounded-xl shadow-md flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        下载图片
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePrint}
                        className="bg-ghibli-light-brown hover:bg-ghibli-light-brown/90 text-white font-bold py-3 px-6 rounded-xl shadow-md flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                        </svg>
                        打印涂色页
                      </motion.button>
                      
                      <Link href={`/coloring?image=${encodeURIComponent(artwork.image_url)}`} className="w-full">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-ghibli-secondary hover:bg-ghibli-secondary/90 text-white font-bold py-3 px-6 rounded-xl shadow-md flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                          </svg>
                          编辑此涂色页
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-ghibli-dark-brown/70">找不到作品信息。</p>
              <Link href="/gallery" className="mt-4 inline-block">
                <button className="bg-ghibli-primary hover:bg-ghibli-primary/90 text-white font-bold py-2 px-4 rounded-full">
                  返回画廊
                </button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
} 