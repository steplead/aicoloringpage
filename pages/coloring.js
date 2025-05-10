import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '../components/layouts/main-layout';
import Canvas from '../components/ui/canvas';
import Toolbar from '../components/ui/toolbar';
import AITools from '../components/ui/ai-tools';
import AIBrushTools from '../components/ui/ai-brush-tools';
import TemplateSelector from '../components/ui/template-selector';
import ColorSuggestions from '../components/ui/color-suggestions';
import HistoryManager from '../components/ui/history-manager';
import SaveArtworkModal from '../components/ui/save-artwork-modal';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/auth-context';
import Head from 'next/head';

export default function ColoringPage() {
  // Get router and authentication status
  const router = useRouter();
  const { user } = useAuth();
  
  // Background image
  const backgroundImagePath = '/ghibli-assets/backgrounds/default-bg.jpeg';
  
  // States
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [mode, setMode] = useState('draw');
  const [canvasImage, setCanvasImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showColorSuggestions, setShowColorSuggestions] = useState(false);
  const [colorSuggestions, setColorSuggestions] = useState(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showAIBrushTools, setShowAIBrushTools] = useState(false);
  const [activeBrush, setActiveBrush] = useState('standard');
  const [aiBrush, setAIBrush] = useState({ type: 'standard', intensity: 0.7 });
  
  // Refs
  const canvasRef = useRef(null);
  const historyManagerRef = useRef(new HistoryManager());
  
  // Get image from URL parameter and load it
  useEffect(() => {
    if (router.query.image && canvasRef.current) {
      setIsProcessing(true);
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      const img = new Image();
      // Set cross-origin attribute
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        // Clear Canvas
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Fit image to canvas
        const scale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        );
        
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        
        context.drawImage(img, x, y, img.width * scale, img.height * scale);
        
        // Update history
        historyManagerRef.current.clear();
        historyManagerRef.current.addToHistory(canvas);
        updateHistoryState();
        
        setIsProcessing(false);
      };
      
      img.onerror = () => {
        console.error('Failed to load image from URL parameter');
        setIsProcessing(false);
      };
      
      // Add timestamp or random parameter to avoid caching issues
      const imageUrl = router.query.image;
      img.src = imageUrl.includes('?') 
        ? `${imageUrl}&nocache=${new Date().getTime()}` 
        : `${imageUrl}?nocache=${new Date().getTime()}`;
    }
  }, [router.query.image, canvasRef.current]);
  
  // Update history state
  const updateHistoryState = () => {
    const historyManager = historyManagerRef.current;
    setCanUndo(historyManager.canUndo());
    setCanRedo(historyManager.canRedo());
  };
  
  // Handle drawing
  const handleDraw = (canvas) => {
    // Update history
    historyManagerRef.current.addToHistory(canvas);
    updateHistoryState();
  };
  
  // Clear canvas
  const handleClear = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update history
    historyManagerRef.current.addToHistory(canvas);
    updateHistoryState();
  };
  
  // Save image to local
  const handleSave = () => {
    if (!canvasRef.current) return;
    
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `ai-coloring-page-${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Unable to save image:', error);
      alert('Unable to save image. This may be due to security restrictions from cross-origin images.');
    }
  };
  
  // Open save to account modal
  const handleSaveToAccount = async () => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Get Canvas image data
      let imageData;
      try {
        imageData = canvasRef.current.toDataURL('image/png');
      } catch (error) {
        console.error('Unable to export Canvas data:', error);
        throw new Error('Unable to get canvas data. This may be due to security restrictions from cross-origin images.');
      }

      // Create thumbnail
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = async () => {
        // Scale drawing
        const scale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        );
        
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        
        let thumbnailData;
        try {
          thumbnailData = canvas.toDataURL('image/png');
        } catch (error) {
          console.error('Unable to create thumbnail:', error);
          thumbnailData = null; // Thumbnail creation failed, use null
        }
        
        // Send to API to save to public gallery
        try {
          const title = `AI Coloring Page ${new Date().toLocaleString()}`; // Default title
          
          const response = await fetch('/api/gallery', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: title,
              description: 'Artwork created with AI Coloring Page tool',
              image_data: imageData,
              thumbnail: thumbnailData,
            }),
          });
          
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to save artwork');
          }
          
          setIsSaving(false);
          
          // Prompt save success
          alert('Artwork has been successfully saved to the public gallery!');
          
          // Redirect to gallery page after save
          setTimeout(() => {
            router.push('/gallery');
          }, 1000);
        } catch (error) {
          console.error('API call failed:', error);
          setSaveError(error.message || 'Failed to save artwork');
          setIsSaving(false);
        }
      };
      
      img.onerror = () => {
        console.error('Unable to load image data');
        setSaveError('Failed to process image data');
        setIsSaving(false);
      };
      
      img.src = imageData;
      
    } catch (error) {
      console.error('Failed to save artwork:', error);
      setSaveError(error.message || 'Failed to save artwork');
      setIsSaving(false);
    }
  };
  
  // Undo operation
  const handleUndo = () => {
    if (historyManagerRef.current.undo(canvasRef.current)) {
      updateHistoryState();
    }
  };
  
  // Redo operation
  const handleRedo = () => {
    if (historyManagerRef.current.redo(canvasRef.current)) {
      updateHistoryState();
    }
  };
  
  // Load template
  const handleSelectTemplate = async (template) => {
    try {
      setIsProcessing(true);
      setShowTemplates(false);
      
      // Load image to Canvas
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      const img = new Image();
      // Add cross-origin support
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        // Clear Canvas
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Fit image to canvas
        const scale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        );
        
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        
        context.drawImage(img, x, y, img.width * scale, img.height * scale);
        
        // Update history
        historyManagerRef.current.clear();
        historyManagerRef.current.addToHistory(canvas);
        updateHistoryState();
        
        setIsProcessing(false);
      };
      
      img.onerror = () => {
        console.error('Failed to load template image');
        setIsProcessing(false);
      };
      
      // Use actual template URL and add cache control
      const templateUrl = template.thumbnailUrl;
      img.src = templateUrl.includes('?') 
        ? `${templateUrl}&nocache=${new Date().getTime()}` 
        : `${templateUrl}?nocache=${new Date().getTime()}`;
      
    } catch (error) {
      console.error('Error loading template:', error);
      setIsProcessing(false);
    }
  };
  
  // Apply AI effect
  const handleApplyAIEffect = async (effectParams) => {
    try {
      setIsProcessing(true);
      
      const canvas = canvasRef.current;
      let imageData;
      
      try {
        imageData = canvas.toDataURL('image/png');
      } catch (error) {
        console.error('Unable to export Canvas data:', error);
        setIsProcessing(false);
        return;
      }
      
      const response = await fetch('/api/ai-effects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'apply-effect',
          imageData,
          effect: effectParams.effect,
          intensity: effectParams.intensity,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply AI effect');
      }
      
      // Apply processed image to Canvas
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        const context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Update history
        historyManagerRef.current.addToHistory(canvas);
        updateHistoryState();
        
        setIsProcessing(false);
      };
      
      img.src = data.imageData;
      
    } catch (error) {
      console.error('Error applying AI effect:', error);
      setIsProcessing(false);
    }
  };
  
  // Request color suggestions
  const handleRequestColorSuggestion = async () => {
    try {
      setShowColorSuggestions(true);
      setIsProcessing(true);
      
      const canvas = canvasRef.current;
      let imageData;
      
      try {
        imageData = canvas.toDataURL('image/png');
      } catch (error) {
        console.error('Unable to export Canvas data:', error);
        setIsProcessing(false);
        setShowColorSuggestions(false);
        alert('Unable to get color suggestions. This may be due to security restrictions from cross-origin images.');
        return;
      }
      
      const response = await fetch('/api/ai-effects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'suggest-colors',
          imageData,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get color suggestions');
      }
      
      setColorSuggestions(data.suggestions);
      
    } catch (error) {
      console.error('Error getting color suggestions:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Apply auto coloring
  const handleApplyAutoColoring = async () => {
    try {
      setIsProcessing(true);
      
      const canvas = canvasRef.current;
      let imageData;
      
      try {
        imageData = canvas.toDataURL('image/png');
      } catch (error) {
        console.error('Unable to export Canvas data:', error);
        setIsProcessing(false);
        alert('Unable to apply auto-coloring. This may be due to security restrictions from cross-origin images.');
        return;
      }
      
      const response = await fetch('/api/ai-effects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'auto-color',
          imageData,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to auto-color image');
      }
      
      // 检查是否有自动上色标记
      let processedImageData = data.imageData;
      const hasAutoColorMark = processedImageData.includes('#autoColored');
      
      if (hasAutoColorMark) {
        // 移除标记
        processedImageData = processedImageData.replace('#autoColored', '');
        
        // 使用前端处理：应用预设的彩色效果
        applyFrontendAutoColorEffect(canvas);
      } else {
        // 正常应用处理后的图像
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        const context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Update history
        historyManagerRef.current.addToHistory(canvas);
        updateHistoryState();
        
        setIsProcessing(false);
      };
      
        img.src = processedImageData;
      }
      
    } catch (error) {
      console.error('Error auto-coloring image:', error);
      setIsProcessing(false);
    }
  };
  
  // 在前端应用自动上色效果（当后端返回标记时使用）
  const applyFrontendAutoColorEffect = (canvas) => {
    const context = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // 获取当前画布内容
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // 吉卜力风格的颜色调色板
    const ghibliColors = [
      [74, 143, 221],   // 天空蓝
      [140, 193, 82],   // 龙猫绿
      [252, 187, 66],   // 魔女黄
      [248, 244, 227],  // 暖白
      [228, 238, 251],  // 淡蓝
      [210, 180, 140],  // 浅棕
      [115, 85, 58],    // 深棕
      [237, 85, 101],   // 红色
      [252, 110, 81],   // 橙色
      [150, 122, 220]   // 紫色
    ];
    
    // 创建一个访问标记数组，避免重复处理像素
    const visited = new Array(width * height).fill(false);
    
    // 定义封闭区域的最小尺寸（小于此尺寸的区域不会被填充）
    const minRegionSize = 100;
    
    // 智能区域检测和填充函数
    const detectAndFillRegions = () => {
      // 用于标识不同的区域
      let regionId = 0;
      // 存储所有区域及其像素
      const regions = [];
      
      // 使用种子填充算法(flood fill)识别封闭区域
      for (let y = 0; y < height; y += 5) {  // 每隔5个像素取样，提高性能
        for (let x = 0; x < width; x += 5) {
          const index = (y * width + x) * 4;
          
          // 如果是白色区域且未被访问过
          if (!visited[y * width + x] && isWhitePixel(data, index)) {
            // 开始新区域
            const region = [];
            // 使用广度优先搜索(BFS)填充区域
            floodFill(x, y, region);
            
            // 如果区域足够大，保存它
            if (region.length > minRegionSize) {
              regions.push({
                id: regionId++,
                pixels: region,
                color: selectColorForRegion(region, regionId),
              });
            }
          }
        }
      }
      
      // 按区域大小排序，先填充大区域，再填充小区域
      regions.sort((a, b) => b.pixels.length - a.pixels.length);
      
      // 填充所有区域
      regions.forEach(region => {
        fillRegionWithColor(region.pixels, region.color);
      });
    };
    
    // 广度优先搜索，寻找连通的白色区域
    const floodFill = (startX, startY, region) => {
      const queue = [{x: startX, y: startY}];
      const maxQueueSize = 10000; // 限制队列大小，防止栈溢出
      
      // 方向数组：上、右、下、左、左上、右上、左下、右下
      const directions = [
        {dx: 0, dy: -1}, {dx: 1, dy: 0}, 
        {dx: 0, dy: 1}, {dx: -1, dy: 0},
        {dx: -1, dy: -1}, {dx: 1, dy: -1},
        {dx: -1, dy: 1}, {dx: 1, dy: 1}
      ];
      
      // 标记起始点为已访问
      visited[startY * width + startX] = true;
      region.push({x: startX, y: startY});
      
      // BFS遍历
      while (queue.length > 0 && queue.length < maxQueueSize) {
        const current = queue.shift();
        const {x, y} = current;
        
        // 检查所有方向
        for (const dir of directions) {
          const newX = x + dir.dx;
          const newY = y + dir.dy;
          
          // 确保新位置在画布内
          if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
            const newIndex = (newY * width + newX);
            const dataIndex = newIndex * 4;
            
            // 如果是白色且未访问过
            if (!visited[newIndex] && isWhitePixel(data, dataIndex)) {
              visited[newIndex] = true;
              queue.push({x: newX, y: newY});
              region.push({x: newX, y: newY});
            }
          }
        }
      }
    };
    
    // 检查是否为白色（或接近白色）像素
    const isWhitePixel = (data, index) => {
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      // 判断是否为白色区域（避开黑色线条）
      return r > 200 && g > 200 && b > 200;
    };
    
    // 为区域选择合适的颜色
    const selectColorForRegion = (region, regionId) => {
      // 使用区域ID来选择颜色，确保相邻区域的颜色差异
      // 同时引入一些随机性避免重复
      const baseColorIndex = (regionId * 3) % ghibliColors.length;
      const colorIndex = (baseColorIndex + Math.floor(Math.random() * 3)) % ghibliColors.length;
      return ghibliColors[colorIndex];
    };
    
    // 填充区域
    const fillRegionWithColor = (pixels, color) => {
      pixels.forEach(pixel => {
        const idx = (pixel.y * width + pixel.x) * 4;
        
        // 如果像素仍然是白色，填充颜色（确保没有被其他操作改变）
        if (isWhitePixel(data, idx)) {
          // 添加一些随机变化，使颜色看起来更自然
          const jitter = 15; // 颜色抖动程度
          data[idx] = Math.min(255, color[0] + Math.random() * jitter * 2 - jitter);
          data[idx + 1] = Math.min(255, color[1] + Math.random() * jitter * 2 - jitter);
          data[idx + 2] = Math.min(255, color[2] + Math.random() * jitter * 2 - jitter);
          
          // 处理边缘区域，让颜色更自然地与线条过渡
          const isNearBlackLine = checkNearBlackLine(pixel.x, pixel.y);
          if (isNearBlackLine) {
            // 边缘附近稍微变暗，增强边界效果
            data[idx] = Math.max(0, data[idx] - 20);
            data[idx + 1] = Math.max(0, data[idx + 1] - 20);
            data[idx + 2] = Math.max(0, data[idx + 2] - 20);
          }
        }
      });
    };
    
    // 检查像素是否靠近黑色线条
    const checkNearBlackLine = (x, y) => {
      const searchDist = 2; // 搜索距离
      for (let dy = -searchDist; dy <= searchDist; dy++) {
        for (let dx = -searchDist; dx <= searchDist; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          
          // 确保新位置在画布内
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = (ny * width + nx) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
            // 检测是否为黑色或深色（线条）
            if (r < 100 && g < 100 && b < 100) {
              return true;
            }
          }
        }
      }
      return false;
    };
    
    // 执行区域检测和填充
    detectAndFillRegions();
    
    // 应用平滑滤镜，减少像素化效果
    smoothImage(data, width, height);
    
    // 将处理后的图像数据放回canvas
    context.putImageData(imageData, 0, 0);
    
    // 更新历史
    historyManagerRef.current.addToHistory(canvas);
    updateHistoryState();
    
    setIsProcessing(false);
  };
  
  // 图像平滑函数 - 简单的均值滤波
  const smoothImage = (data, width, height) => {
    // 创建一个临时数组存储平滑后的像素
    const tempData = new Uint8ClampedArray(data.length);
    
    // 复制原始数据到临时数组
    for (let i = 0; i < data.length; i++) {
      tempData[i] = data[i];
    }
    
    // 仅在非线条区域应用平滑
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // 检查是否为非线条区域
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        if (!(r < 100 && g < 100 && b < 100)) {
          // 计算3x3区域的平均值
          let sumR = 0, sumG = 0, sumB = 0, count = 0;
          
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              const nidx = (ny * width + nx) * 4;
              
              // 确保新位置在画布内并且不是线条
              const nr = tempData[nidx];
              const ng = tempData[nidx + 1];
              const nb = tempData[nidx + 2];
              
              if (!(nr < 100 && ng < 100 && nb < 100)) {
                sumR += nr;
                sumG += ng;
                sumB += nb;
                count++;
              }
            }
          }
          
          if (count > 0) {
            data[idx] = Math.round(sumR / count);
            data[idx + 1] = Math.round(sumG / count);
            data[idx + 2] = Math.round(sumB / count);
          }
        }
      }
    }
  };
  
  // Handle color selection
  const handleColorSelect = (colorOrPalette) => {
    if (typeof colorOrPalette === 'string') {
      // Single color
      setBrushColor(colorOrPalette);
    } else {
      // Color palette
      setBrushColor(colorOrPalette.colors[0]);
    }
    
    setShowColorSuggestions(false);
  };
  
  // Handle AI brush selection
  const handleSelectAIBrush = (brushSettings) => {
    setAIBrush(brushSettings);
    setActiveBrush(brushSettings.type);
  };
  
  return (
    <MainLayout
      title="Magic Coloring Studio | Ghibli Style Coloring Tool"
      backgroundImage={backgroundImagePath}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md text-gradient-primary">
            Magic Coloring Studio
          </h1>
          <div className="ml-auto mr-4 flex items-center">
            <button
              onClick={handleSaveToAccount}
              className="mr-4 ghibli-button-accent flex items-center px-6 py-2"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save to Gallery
                </span>
              )}
            </button>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="ghibli-button flex items-center px-6 py-2"
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {showTemplates ? 'Close Template' : 'Browse Templates'}
              </span>
            </button>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left toolbar */}
          <div className="lg:col-span-3 space-y-4">
            <Toolbar
              brushSize={brushSize}
              onBrushSizeChange={setBrushSize}
              brushColor={brushColor}
              onBrushColorChange={setBrushColor}
              mode={mode}
              onModeChange={setMode}
              onSave={handleSave}
              onClear={handleClear}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              onToggleAIBrushTools={() => setShowAIBrushTools(!showAIBrushTools)}
            />
            
            <div className="ghibli-card-gradient">
              {showAIBrushTools ? (
                <AIBrushTools
                  onSelectBrush={handleSelectAIBrush}
                  activeBrush={activeBrush}
                  isProcessing={isProcessing}
                />
              ) : (
                <AITools
                  onApplyAIEffect={handleApplyAIEffect}
                  onRequestColorSuggestion={handleRequestColorSuggestion}
                  onApplyAutoColoring={handleApplyAutoColoring}
                  isProcessing={isProcessing}
                />
              )}
            </div>
          </div>
          
          {/* Central canvas area */}
          <div className="lg:col-span-9 relative">
            <Canvas
              width={800}
              height={800}
              brushSize={brushSize}
              brushColor={brushColor}
              mode={mode}
              aiBrush={aiBrush}
              onDraw={handleDraw}
              canvasRef={canvasRef}
              className="w-full shadow-ghibli-lg bg-white mx-auto rounded-xl border-4 border-white"
            />
            
            {isProcessing && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-xl">
                <div className="bg-white p-6 rounded-xl shadow-ghibli-lg text-center">
                  <svg className="animate-spin h-12 w-12 text-ghibli-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gradient-primary font-bold text-xl mb-2">AI Magic in Progress</p>
                  <p className="text-ghibli-dark-brown/70">Creating something wonderful...</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Template selector */}
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 ghibli-card-gradient p-4 rounded-xl"
          >
            <TemplateSelector onSelectTemplate={handleSelectTemplate} />
          </motion.div>
        )}
        
        {/* Color suggestions modal */}
        <ColorSuggestions
          isVisible={showColorSuggestions}
          onClose={() => setShowColorSuggestions(false)}
          onSelect={handleColorSelect}
          isLoading={isProcessing}
          suggestions={colorSuggestions}
        />
        
        {/* Save artwork modal */}
        <SaveArtworkModal 
          isVisible={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveToAccount}
          imageData={canvasRef.current ? canvasRef.current.toDataURL('image/png') : null}
          isProcessing={isSaving}
        />
      </div>
    </MainLayout>
  );
} 