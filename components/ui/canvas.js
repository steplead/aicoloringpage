import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Canvas Engine Component
 * Provides drawing functionality with enhanced AI brush support
 */
const Canvas = ({ 
  width = 800, 
  height = 800, 
  backgroundImage = null,
  onDraw = () => {},
  className = '',
  brushSize = 5,
  brushColor = '#000000',
  mode = 'draw', // draw, erase, fill
  aiBrush = { type: 'standard', intensity: 0.7 }, // AI brush settings
  canvasRef = null,
}) => {
  const innerCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const tempCanvasRef = useRef(null); // For AI brush effects
  
  // Use provided ref or internal ref
  const actualCanvasRef = canvasRef || innerCanvasRef;
  
  // Initialize canvas
  useEffect(() => {
    const canvas = actualCanvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Initialize temp canvas for AI effects
    if (!tempCanvasRef.current) {
      tempCanvasRef.current = document.createElement('canvas');
      tempCanvasRef.current.width = width;
      tempCanvasRef.current.height = height;
    }
    
    // Load background image if provided
    if (backgroundImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.onerror = (error) => {
        console.error('Background image failed to load:', error);
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
      };
      img.src = backgroundImage;
    }
  }, [width, height, backgroundImage, actualCanvasRef]);
  
  // Update brush properties when they change
  useEffect(() => {
    const canvas = actualCanvasRef.current;
    const context = canvas.getContext('2d');
    
    context.lineWidth = brushSize;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.strokeStyle = brushColor;
  }, [brushSize, brushColor, actualCanvasRef]);
  
  // Drawing functions
  const startDrawing = (e) => {
    const { offsetX, offsetY } = getCoordinates(e);
    setIsDrawing(true);
    setLastPosition({ x: offsetX, y: offsetY });
  };
  
  const draw = (e) => {
    if (!isDrawing) return;
    
    const { offsetX, offsetY } = getCoordinates(e);
    const canvas = actualCanvasRef.current;
    const context = canvas.getContext('2d');
    
    context.beginPath();
    
    if (mode === 'draw') {
      // Apply the appropriate drawing method based on AI brush type
      if (aiBrush.type === 'standard') {
        // Standard brush - regular drawing
        context.globalCompositeOperation = 'source-over';
        context.moveTo(lastPosition.x, lastPosition.y);
        context.lineTo(offsetX, offsetY);
        context.stroke();
      } else {
        // AI-enhanced brushes
        applyAIBrushEffect(context, lastPosition, { x: offsetX, y: offsetY });
      }
    } else if (mode === 'erase') {
      context.globalCompositeOperation = 'destination-out';
      context.moveTo(lastPosition.x, lastPosition.y);
      context.lineTo(offsetX, offsetY);
      context.stroke();
    }
    
    setLastPosition({ x: offsetX, y: offsetY });
    onDraw(canvas);
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  // Apply AI brush effects
  const applyAIBrushEffect = (context, start, end) => {
    context.globalCompositeOperation = 'source-over';
    
    switch (aiBrush.type) {
      case 'smart-color':
        // Smart color adjusts based on surrounding colors
        applySmartColorBrush(context, start, end);
        break;
        
      case 'texture':
        // Texture brush adds patterns
        applyTextureBrush(context, start, end);
        break;
        
      case 'blend':
        // Blend brush for smooth transitions
        applyBlendBrush(context, start, end);
        break;
        
      case 'shade':
        // Smart shade for automatic shading
        applyShaderBrush(context, start, end);
        break;
        
      case 'pattern':
        // Pattern brush fills with patterns
        applyPatternBrush(context, start, end);
        break;
        
      case 'smart-adjust':
        // Smart adjust for dynamic color adjustments
        applySmartAdjustBrush(context, start, end);
        break;
        
      case 'guided-coloring':
        // Guided coloring with boundary detection
        applyGuidedColoringBrush(context, start, end);
        break;
        
      default:
        // Default to standard brush
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.stroke();
    }
  };
  
  // Smart color brush implementation
  const applySmartColorBrush = (context, start, end) => {
    // Base stroke
    context.save();
    context.shadowColor = brushColor;
    context.shadowBlur = brushSize * aiBrush.intensity * 2;
    
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    
    context.restore();
  };
  
  // Texture brush implementation
  const applyTextureBrush = (context, start, end) => {
    const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    
    const steps = Math.max(Math.floor(distance), 1);
    const stepSize = distance / steps;
    
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const x = start.x + (end.x - start.x) * t;
      const y = start.y + (end.y - start.y) * t;
      
      // Draw texture dots with varying sizes
      const dotSize = (Math.random() * 0.5 + 0.5) * brushSize * aiBrush.intensity;
      
      context.beginPath();
      context.arc(x, y, dotSize, 0, Math.PI * 2);
      context.fillStyle = brushColor;
      context.fill();
      
      // Add some noise/variation for texture
      for (let j = 0; j < 3; j++) {
        const noiseX = x + (Math.random() * 2 - 1) * brushSize;
        const noiseY = y + (Math.random() * 2 - 1) * brushSize;
        const noiseSize = Math.random() * brushSize * 0.5 * aiBrush.intensity;
        
        context.beginPath();
        context.arc(noiseX, noiseY, noiseSize, 0, Math.PI * 2);
        
        // Slight variation in color
        const r = parseInt(brushColor.slice(1, 3), 16);
        const g = parseInt(brushColor.slice(3, 5), 16);
        const b = parseInt(brushColor.slice(5, 7), 16);
        
        const variation = 15;
        const newR = Math.min(255, Math.max(0, r + (Math.random() * variation * 2 - variation)));
        const newG = Math.min(255, Math.max(0, g + (Math.random() * variation * 2 - variation)));
        const newB = Math.min(255, Math.max(0, b + (Math.random() * variation * 2 - variation)));
        
        context.fillStyle = `rgb(${newR}, ${newG}, ${newB})`;
        context.fill();
      }
    }
  };
  
  // Blend brush implementation
  const applyBlendBrush = (context, start, end) => {
    context.save();
    context.globalAlpha = 0.4 * aiBrush.intensity;  // Lower opacity for blending
    
    // Main stroke
    context.beginPath();
    context.lineWidth = brushSize;
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    
    // Add softer, wider strokes for blending effect
    context.globalAlpha = 0.2 * aiBrush.intensity;
    context.lineWidth = brushSize * 1.5;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    
    context.globalAlpha = 0.1 * aiBrush.intensity;
    context.lineWidth = brushSize * 2.5;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    
    context.restore();
  };
  
  // Shader brush implementation
  const applyShaderBrush = (context, start, end) => {
    const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const perpAngle = angle + Math.PI / 2;
    
    // Main color
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.lineWidth = brushSize;
    context.stroke();
    
    // Add shading lines
    context.save();
    context.globalAlpha = 0.3 * aiBrush.intensity;
    
    // Darken the brush color for shading
    const r = parseInt(brushColor.slice(1, 3), 16);
    const g = parseInt(brushColor.slice(3, 5), 16);
    const b = parseInt(brushColor.slice(5, 7), 16);
    
    // Darken by 30%
    const darkenFactor = 0.7;
    const shadeColor = `rgb(${Math.floor(r*darkenFactor)}, ${Math.floor(g*darkenFactor)}, ${Math.floor(b*darkenFactor)})`;
    
    context.strokeStyle = shadeColor;
    context.lineWidth = brushSize * 0.7;
    
    const shadeLength = brushSize * 1.5 * aiBrush.intensity;
    const startOffsetX = Math.cos(perpAngle) * brushSize * 0.5;
    const startOffsetY = Math.sin(perpAngle) * brushSize * 0.5;
    
    context.beginPath();
    context.moveTo(start.x + startOffsetX, start.y + startOffsetY);
    context.lineTo(end.x + startOffsetX, end.y + startOffsetY);
    context.stroke();
    
    context.restore();
  };
  
  // Pattern brush implementation
  const applyPatternBrush = (context, start, end) => {
    const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    
    const steps = Math.max(Math.floor(distance), 1);
    const stepSize = distance / steps;
    
    // Choose pattern based on intensity
    const patternType = Math.floor(aiBrush.intensity * 3); // 0-2 pattern types
    
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const x = start.x + (end.x - start.x) * t;
      const y = start.y + (end.y - start.y) * t;
      
      switch(patternType) {
        case 0: // Dots pattern
          if (i % 2 === 0) {
            context.beginPath();
            context.arc(x, y, brushSize * 0.6, 0, Math.PI * 2);
            context.fillStyle = brushColor;
            context.fill();
          }
          break;
          
        case 1: // Cross-hatch pattern
          if (i % 3 === 0) {
            context.beginPath();
            context.moveTo(x - brushSize * 0.5, y - brushSize * 0.5);
            context.lineTo(x + brushSize * 0.5, y + brushSize * 0.5);
            context.moveTo(x + brushSize * 0.5, y - brushSize * 0.5);
            context.lineTo(x - brushSize * 0.5, y + brushSize * 0.5);
            context.strokeStyle = brushColor;
            context.lineWidth = brushSize * 0.3;
            context.stroke();
          }
          break;
          
        case 2: // Zigzag pattern
          context.beginPath();
          if (i % 2 === 0) {
            context.moveTo(x, y - brushSize * 0.5);
            context.lineTo(x, y + brushSize * 0.5);
          } else {
            context.moveTo(x - brushSize * 0.5, y);
            context.lineTo(x + brushSize * 0.5, y);
          }
          context.strokeStyle = brushColor;
          context.lineWidth = brushSize * 0.4;
          context.stroke();
          break;
      }
    }
  };
  
  // Smart Adjust brush implementation - NEW
  const applySmartAdjustBrush = (context, start, end) => {
    // Base color from user selection
    const baseColor = brushColor;
    
    // Get HSL values from RGB color to make adjustments easier
    const getHSL = (hexColor) => {
      // Convert hex to RGB
      let r = parseInt(hexColor.slice(1, 3), 16) / 255;
      let g = parseInt(hexColor.slice(3, 5), 16) / 255;
      let b = parseInt(hexColor.slice(5, 7), 16) / 255;
      
      // Find greatest and smallest color channels
      let max = Math.max(r, g, b);
      let min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0; // achromatic
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      
      return { h: h * 360, s: s * 100, l: l * 100 };
    };
    
    // Convert HSL to hex color
    const hslToHex = (h, s, l) => {
      h /= 360;
      s /= 100;
      l /= 100;
      
      let r, g, b;
      
      if (s === 0) {
        r = g = b = l; // achromatic
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      
      const toHex = (x) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };
    
    // Get base HSL values
    const hsl = getHSL(baseColor);
    
    // Calculate distance and angle between points
    const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    const steps = Math.max(Math.floor(distance), 1);
    
    // Draw the stroke with dynamic color adjustment
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const x = start.x + (end.x - start.x) * t;
      const y = start.y + (end.y - start.y) * t;
      
      // Adjust hue, saturation, and lightness based on position
      // This creates a dynamic color effect that varies across the stroke
      const hueShift = Math.sin(t * Math.PI * 2) * 15 * aiBrush.intensity;
      const satShift = Math.cos(t * Math.PI) * 10 * aiBrush.intensity;
      const lightShift = (Math.sin(t * Math.PI * 3) * 10 * aiBrush.intensity) - (5 * aiBrush.intensity);
      
      // Create adjusted color
      const adjustedColor = hslToHex(
        (hsl.h + hueShift) % 360,
        Math.max(0, Math.min(100, hsl.s + satShift)),
        Math.max(0, Math.min(100, hsl.l + lightShift))
      );
      
      // Draw a dot with the adjusted color
      context.beginPath();
      context.arc(x, y, brushSize * 0.8, 0, Math.PI * 2);
      context.fillStyle = adjustedColor;
      context.fill();
      
      // Add highlight/shadow dots for more dimension
      if (Math.random() < 0.3 * aiBrush.intensity) {
        const highlightSize = brushSize * 0.4 * Math.random() * aiBrush.intensity;
        const offsetX = (Math.random() * 2 - 1) * brushSize * 0.3;
        const offsetY = (Math.random() * 2 - 1) * brushSize * 0.3;
        
        // Highlight dot (lighter)
        context.beginPath();
        context.arc(x + offsetX, y + offsetY, highlightSize, 0, Math.PI * 2);
        context.fillStyle = hslToHex(hsl.h, Math.max(0, hsl.s - 20), Math.min(100, hsl.l + 20));
        context.fill();
      }
    }
    
    // Final stroke to connect everything smoothly
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.strokeStyle = baseColor;
    context.globalAlpha = 0.3;
    context.stroke();
    context.globalAlpha = 1.0;
  };
  
  // Guided Coloring brush implementation - NEW
  const applyGuidedColoringBrush = (context, start, end) => {
    const canvas = actualCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Line detection parameters
    const detectLineThreshold = 50; // RGB difference threshold for detecting lines
    const guidanceRadius = brushSize * 3 * aiBrush.intensity; // Area to scan for boundaries
    
    // Draw basic line first
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    
    // Calculate step positions along the line
    const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    const steps = Math.max(Math.floor(distance * 2), 2); // Ensure enough samples along the line
    
    // Initialize boundary detection flags
    let nearBoundary = false;
    let boundaryDirection = { x: 0, y: 0 };
    
    // Find boundaries and adjust drawing
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.round(start.x + (end.x - start.x) * t);
      const y = Math.round(start.y + (end.y - start.y) * t);
      
      // Sample in a small circle around the point to detect boundaries
      nearBoundary = false;
      
      // Check pixels in a circle around the current point
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
        for (let rad = guidanceRadius * 0.5; rad <= guidanceRadius; rad += guidanceRadius * 0.25) {
          const checkX = Math.round(x + Math.cos(angle) * rad);
          const checkY = Math.round(y + Math.sin(angle) * rad);
          
          // Skip if out of bounds
          if (checkX < 0 || checkY < 0 || checkX >= canvas.width || checkY >= canvas.height) {
            continue;
          }
          
          // Get pixel data at check position
          const imageData = ctx.getImageData(checkX, checkY, 1, 1).data;
          const r = imageData[0];
          const g = imageData[1];
          const b = imageData[2];
          
          // Calculate brightness (simplified)
          const brightness = (r + g + b) / 3;
          
          // If we detect a dark pixel (likely a line), adjust our boundary detection
          if (brightness < detectLineThreshold) {
            nearBoundary = true;
            
            // Calculate direction from current point to boundary
            boundaryDirection = {
              x: checkX - x,
              y: checkY - y
            };
            
            // Normalize direction
            const magnitude = Math.sqrt(boundaryDirection.x * boundaryDirection.x + boundaryDirection.y * boundaryDirection.y);
            if (magnitude > 0) {
              boundaryDirection.x /= magnitude;
              boundaryDirection.y /= magnitude;
            }
            
            break;
          }
        }
        if (nearBoundary) break;
      }
      
      // Adjust drawing based on boundary detection
      let adjustedBrushSize = brushSize;
      
      if (nearBoundary) {
        // Reduce brush size near boundaries
        adjustedBrushSize = brushSize * 0.6;
        
        // Add visual feedback for guidance
        context.save();
        context.beginPath();
        context.arc(x, y, adjustedBrushSize * 1.5, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255, 255, 255, 0.3)';
        context.fill();
        context.restore();
      }
      
      // Draw the color dot
      context.beginPath();
      context.arc(x, y, adjustedBrushSize, 0, Math.PI * 2);
      context.fillStyle = brushColor;
      context.fill();
      
      // Add subtle guidance for the user when near boundaries
      if (nearBoundary && i % 3 === 0) {
        // Draw a subtle guidance circle
        const oppositeX = x - boundaryDirection.x * adjustedBrushSize * 2;
        const oppositeY = y - boundaryDirection.y * adjustedBrushSize * 2;
        
        context.beginPath();
        context.arc(oppositeX, oppositeY, adjustedBrushSize * 0.8, 0, Math.PI * 2);
        context.fillStyle = `rgba(${parseInt(brushColor.slice(1, 3), 16)}, ${parseInt(brushColor.slice(3, 5), 16)}, ${parseInt(brushColor.slice(5, 7), 16)}, 0.3)`;
        context.fill();
      }
    }
    
    // Connect all points with a thin line for continuity
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.strokeStyle = brushColor;
    context.globalAlpha = 0.2;
    context.stroke();
    context.globalAlpha = 1.0;
  };
  
  // Calculate coordinates for both mouse and touch events
  const getCoordinates = (e) => {
    if (e.nativeEvent.offsetX !== undefined) {
      return { offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY };
    }
    
    // For touch events
    const touch = e.touches[0] || e.changedTouches[0];
    const rect = e.target.getBoundingClientRect();
    return {
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top
    };
  };
  
  // Fill function
  const handleFill = (e) => {
    if (mode !== 'fill') return;
    
    const { offsetX, offsetY } = getCoordinates(e);
    const canvas = actualCanvasRef.current;
    const context = canvas.getContext('2d');
    
    // Fill with patterns based on AI brush settings
    if (aiBrush.type === 'pattern' && aiBrush.intensity > 0.3) {
      applyPatternFill(context, offsetX, offsetY, brushColor);
    } else {
      // Standard flood fill
      floodFill(context, offsetX, offsetY, brushColor);
    }
    onDraw(canvas);
  };
  
  // Pattern fill implementation
  const applyPatternFill = (context, x, y, fillColor) => {
    // For demonstration, fill a circle with the pattern
    const patternSize = brushSize * 2 * aiBrush.intensity;
    
    context.fillStyle = fillColor;
    context.beginPath();
    context.arc(x, y, patternSize * 4, 0, Math.PI * 2);
    context.fill();
    
    // Add pattern overlay
    const patternType = Math.floor(aiBrush.intensity * 3); // 0-2 pattern types
    
    context.save();
    context.globalCompositeOperation = 'source-atop';
    
    // Create pattern based on type
    switch(patternType) {
      case 0: // Dots
        for (let i = -patternSize*4; i <= patternSize*4; i += patternSize) {
          for (let j = -patternSize*4; j <= patternSize*4; j += patternSize) {
            if (Math.sqrt(i*i + j*j) <= patternSize*4) {
              context.beginPath();
              context.arc(x + i, y + j, patternSize * 0.3, 0, Math.PI * 2);
              context.fillStyle = '#ffffff';
              context.globalAlpha = 0.2;
              context.fill();
            }
          }
        }
        break;
        
      case 1: // Stripes
        context.strokeStyle = '#ffffff';
        context.globalAlpha = 0.15;
        context.lineWidth = patternSize * 0.2;
        
        for (let i = -patternSize*4; i <= patternSize*4; i += patternSize) {
          context.beginPath();
          context.moveTo(x - patternSize*4, y + i);
          context.lineTo(x + patternSize*4, y + i);
          context.stroke();
        }
        break;
        
      case 2: // Radial
        const gradient = context.createRadialGradient(x, y, 0, x, y, patternSize*4);
        gradient.addColorStop(0, fillColor);
        gradient.addColorStop(0.7, fillColor);
        gradient.addColorStop(1, '#ffffff');
        
        context.globalAlpha = 0.9;
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(x, y, patternSize*4, 0, Math.PI * 2);
        context.fill();
        break;
    }
    
    context.restore();
  };
  
  // Simplified flood fill implementation
  const floodFill = (context, x, y, fillColor) => {
    // This is a placeholder for a more sophisticated flood fill algorithm
    // A production app would use a more efficient algorithm
    const targetColor = context.getImageData(x, y, 1, 1).data;
    
    // For now, just fill a small circle as a demonstration
    context.fillStyle = fillColor;
    context.beginPath();
    context.arc(x, y, brushSize * 2, 0, Math.PI * 2);
    context.fill();
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative overflow-hidden rounded-xl border-2 border-ghibli-light-brown/30 ${className}`}
    >
      <canvas
        ref={actualCanvasRef}
        width={width}
        height={height}
        className="touch-none cursor-crosshair max-w-full"
        style={{ background: '#ffffff' }}
        onMouseDown={mode === 'fill' ? handleFill : startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={mode === 'fill' ? handleFill : startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </motion.div>
  );
};

export default Canvas; 