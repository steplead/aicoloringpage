// 模板管理器
// 负责加载、分类、标记和过滤模板

import { categories, getAllCategories } from './categories';
import { 
  generateTagsFromDescription, 
  getRecommendedTags, 
  findTemplatesByTags 
} from './tags';

// 模板示例数据 (在实际实现中，这些会从API或服务器获取)
// 每个模板包含基本信息、分类信息和标签信息
const templates = [
  {
    id: 'template-1',
    title: 'Totoro Forest',
    description: 'Studio Ghibli style forest scene with Totoro and children playing under a large tree',
    imageUrl: '/artworks/7027ba3a-10cd-42ed-b8ed-13a19ec3b3b3/image.png',
    thumbnailUrl: '/artworks/7027ba3a-10cd-42ed-b8ed-13a19ec3b3b3/thumbnails/thumbnail.png',
    category: 'ghibli',
    subcategory: 'characters',
    difficulty: 'medium',
    popularity: 98,
    createdAt: '2024-05-01',
    tags: [
      { id: 'ghibli-style', name: 'Ghibli Style' },
      { id: 'forest', name: 'Forest' },
      { id: 'cute', name: 'Cute' },
      { id: 'medium', name: 'Medium' }
    ]
  },
  {
    id: 'template-2',
    title: 'Magic Castle',
    description: 'Floating magical castle in the clouds with dragons flying around',
    imageUrl: '/artworks/1b44256c-3cfb-4adb-af94-693acfe61351/image.png',
    thumbnailUrl: '/artworks/1b44256c-3cfb-4adb-af94-693acfe61351/thumbnails/thumbnail.png',
    category: 'fantasy',
    subcategory: 'castle',
    difficulty: 'hard',
    popularity: 85,
    createdAt: '2024-05-15',
    tags: [
      { id: 'cartoon', name: 'Cartoon' },
      { id: 'magic', name: 'Magic' },
      { id: 'buildings', name: 'Buildings' },
      { id: 'hard', name: 'Hard' }
    ]
  },
  {
    id: 'template-3',
    title: 'Forest Deer',
    description: 'Cute cartoon deer standing in a flower-filled forest scene',
    imageUrl: '/artworks/3cdfcd7f-77cc-4532-b58a-7cb3088ceff6/image.png',
    thumbnailUrl: '/artworks/3cdfcd7f-77cc-4532-b58a-7cb3088ceff6/thumbnails/thumbnail.png',
    category: 'animals',
    subcategory: 'mammals',
    difficulty: 'easy',
    popularity: 92,
    createdAt: '2024-06-01',
    tags: [
      { id: 'cartoon', name: 'Cartoon' },
      { id: 'forest', name: 'Forest' },
      { id: 'animals', name: 'Animals' },
      { id: 'cute', name: 'Cute' },
      { id: 'easy', name: 'Easy' }
    ]
  },
  {
    id: 'template-4',
    title: 'Seaside Lighthouse',
    description: 'Calm sea with a white lighthouse on a cliff, small house, with watercolor style',
    imageUrl: '/artworks/b912b91f-51a1-4282-91d8-62f8a1c03759/image.png',
    thumbnailUrl: '/artworks/b912b91f-51a1-4282-91d8-62f8a1c03759/thumbnails/thumbnail.png',
    category: 'nature',
    subcategory: 'ocean',
    difficulty: 'medium',
    popularity: 78,
    createdAt: '2024-06-10',
    tags: [
      { id: 'watercolor', name: 'Watercolor' },
      { id: 'water', name: 'Water' },
      { id: 'buildings', name: 'Buildings' },
      { id: 'calm', name: 'Calm' },
      { id: 'medium', name: 'Medium' }
    ]
  },
  {
    id: 'template-5',
    title: 'Cherry Blossom',
    description: 'Spring garden scene with cherry blossom trees in full bloom, path leading to distance',
    imageUrl: '/artworks/479ca9f8-6913-4d08-b6e9-7f160c0ad06c/image.png',
    thumbnailUrl: '/artworks/479ca9f8-6913-4d08-b6e9-7f160c0ad06c/thumbnails/thumbnail.png',
    category: 'seasons',
    subcategory: 'spring',
    difficulty: 'medium',
    popularity: 88,
    createdAt: '2024-07-01',
    tags: [
      { id: 'watercolor', name: 'Watercolor' },
      { id: 'flowers', name: 'Flowers' },
      { id: 'happy', name: 'Happy' },
      { id: 'medium', name: 'Medium' }
    ]
  }
];

// 添加更多模板示例
const extendedTemplates = [
  ...templates,
  {
    id: 'template-6',
    title: 'Winter Cabin',
    description: 'Winter snow mountain with a cozy wooden cabin, smoke rising from chimney',
    imageUrl: '/artworks/f72756b7-d25c-400c-9e09-562fb3b36f58/image.png',
    thumbnailUrl: '/artworks/f72756b7-d25c-400c-9e09-562fb3b36f58/thumbnails/thumbnail.png',
    category: 'seasons',
    subcategory: 'winter',
    difficulty: 'medium',
    popularity: 82,
    createdAt: '2024-07-15',
    tags: [
      { id: 'cartoon', name: 'Cartoon' },
      { id: 'mountain', name: 'Mountain' },
      { id: 'buildings', name: 'Buildings' },
      { id: 'calm', name: 'Calm' },
      { id: 'medium', name: 'Medium' }
    ]
  },
  {
    id: 'template-7',
    title: 'Castle in the Sky',
    description: 'Ghibli style castle in the sky with airships around it',
    imageUrl: '/artworks/d5887f16-db18-4d18-b745-3c4a63be9214/image.png',
    thumbnailUrl: '/artworks/d5887f16-db18-4d18-b745-3c4a63be9214/thumbnails/thumbnail.png',
    category: 'ghibli',
    subcategory: 'buildings',
    difficulty: 'hard',
    popularity: 95,
    createdAt: '2024-08-01',
    tags: [
      { id: 'ghibli-style', name: 'Ghibli Style' },
      { id: 'buildings', name: 'Buildings' },
      { id: 'magic', name: 'Magic' },
      { id: 'hard', name: 'Hard' }
    ]
  },
  {
    id: 'template-8',
    title: 'Ocean Life',
    description: 'Cute underwater world with fish, turtles and coral',
    imageUrl: '/artworks/54819825-f94e-4248-b5b3-62e70122f2db/image.png',
    thumbnailUrl: '/artworks/54819825-f94e-4248-b5b3-62e70122f2db/thumbnails/thumbnail.png',
    category: 'animals',
    subcategory: 'marine',
    difficulty: 'easy',
    popularity: 90,
    createdAt: '2024-08-15',
    tags: [
      { id: 'cartoon', name: 'Cartoon' },
      { id: 'water', name: 'Water' },
      { id: 'animals', name: 'Animals' },
      { id: 'cute', name: 'Cute' },
      { id: 'easy', name: 'Easy' }
    ]
  },
  {
    id: 'template-9',
    title: 'Kids in the Park',
    description: 'Cartoon style children playing in the park scene',
    imageUrl: '/artworks/13ea0da5-a71f-4e94-96c5-de1c103fe6b3/image.png',
    thumbnailUrl: '/artworks/13ea0da5-a71f-4e94-96c5-de1c103fe6b3/thumbnails/thumbnail.png',
    category: 'people',
    subcategory: 'children',
    difficulty: 'medium',
    popularity: 85,
    createdAt: '2024-09-01',
    tags: [
      { id: 'cartoon', name: 'Cartoon' },
      { id: 'people', name: 'People' },
      { id: 'happy', name: 'Happy' },
      { id: 'easy', name: 'Easy' }
    ]
  },
  {
    id: 'template-10',
    title: 'Forest Spirits',
    description: 'Mysterious forest with little spirits and glowing mushrooms',
    imageUrl: '/artworks/be8f58e8-5422-45d8-9ee6-c02c051bd5c7/image.png',
    thumbnailUrl: '/artworks/be8f58e8-5422-45d8-9ee6-c02c051bd5c7/thumbnails/thumbnail.png',
    category: 'fantasy',
    subcategory: 'fairy',
    difficulty: 'medium',
    popularity: 88,
    createdAt: '2024-09-15',
    tags: [
      { id: 'cartoon', name: 'Cartoon' },
      { id: 'forest', name: 'Forest' },
      { id: 'magic', name: 'Magic' },
      { id: 'mysterious', name: 'Mysterious' },
      { id: 'medium', name: 'Medium' }
    ]
  }
];

// 模板管理类
class TemplateManager {
  constructor() {
    this.templates = extendedTemplates; // 使用扩展的模板集合
    this.categories = categories;
    this.popularTags = getRecommendedTags();
    this.loadTemplates();
  }
  
  // 加载所有模板（在实际实现中，这会从API获取）
  async loadTemplates() {
    // 可以在这里添加API调用逻辑
    // 现在使用预定义的模板数据
    
    // 更新每个分类的计数
    this.updateCategoryCounts();
    
    return this.templates;
  }
  
  // 获取所有模板
  getAllTemplates() {
    return this.templates;
  }
  
  // 获取热门模板（按流行度排序）
  getPopularTemplates(limit = 6) {
    return [...this.templates]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }
  
  // 获取最新模板（按创建日期排序）
  getLatestTemplates(limit = 6) {
    return [...this.templates]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }
  
  // 根据分类获取模板
  getTemplatesByCategory(categoryId, subcategoryId = null) {
    if (!categoryId) return this.templates;
    
    return this.templates.filter(template => {
      if (subcategoryId) {
        return template.category === categoryId && template.subcategory === subcategoryId;
      }
      return template.category === categoryId;
    });
  }
  
  // 根据标签获取模板
  getTemplatesByTags(tagIds, limit = 10) {
    return findTemplatesByTags(this.templates, tagIds, limit);
  }
  
  // 根据难度级别获取模板
  getTemplatesByDifficulty(difficulty) {
    return this.templates.filter(template => template.difficulty === difficulty);
  }
  
  // 搜索模板
  searchTemplates(query) {
    if (!query || query.trim() === '') return this.templates;
    
    const normalizedQuery = query.toLowerCase().trim();
    
    return this.templates.filter(template => {
      return (
        template.title.toLowerCase().includes(normalizedQuery) ||
        template.description.toLowerCase().includes(normalizedQuery) ||
        template.tags.some(tag => tag.name.toLowerCase().includes(normalizedQuery))
      );
    });
  }
  
  // 根据模板描述生成标签
  generateTagsForTemplate(description) {
    return generateTagsFromDescription(description);
  }
  
  // 获取模板分类
  getCategories() {
    return this.categories;
  }
  
  // 获取扁平化的所有分类
  getFlatCategories() {
    return getAllCategories();
  }
  
  // 获取热门标签
  getPopularTags() {
    return this.popularTags;
  }
  
  // 根据ID获取模板
  getTemplateById(id) {
    return this.templates.find(template => template.id === id);
  }
  
  // 获取相似模板
  getSimilarTemplates(templateId, limit = 4) {
    const template = this.getTemplateById(templateId);
    if (!template) return [];
    
    // 提取当前模板的标签ID
    const tagIds = template.tags.map(tag => tag.id);
    
    // 基于标签查找相似模板
    const similarTemplates = this.getTemplatesByTags(tagIds, limit + 1);
    
    // 排除当前模板自身
    return similarTemplates.filter(t => t.id !== templateId).slice(0, limit);
  }
  
  // 更新分类计数
  updateCategoryCounts() {
    // 重置计数
    this.categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        subcategory.count = 0;
      });
    });
    
    // 计算每个分类和子分类下的模板数量
    this.templates.forEach(template => {
      const category = this.categories.find(c => c.id === template.category);
      if (category) {
        const subcategory = category.subcategories.find(sc => sc.id === template.subcategory);
        if (subcategory) {
          subcategory.count += 1;
        }
      }
    });
  }
  
  // 添加新模板（在实际实现中，这会发送到API）
  addTemplate(template) {
    // 生成唯一ID
    const newId = `template-${this.templates.length + 1}`;
    
    // 添加创建日期
    const now = new Date().toISOString().split('T')[0];
    
    // 如果没有标签，基于描述生成标签
    let tags = template.tags || [];
    if (tags.length === 0 && template.description) {
      tags = this.generateTagsForTemplate(template.description);
    }
    
    // 创建新模板
    const newTemplate = {
      id: newId,
      createdAt: now,
      popularity: 50, // 默认初始人气值
      ...template,
      tags
    };
    
    // 添加到模板集合
    this.templates.push(newTemplate);
    
    // 更新分类计数
    this.updateCategoryCounts();
    
    return newTemplate;
  }
}

// 导出单例实例
const templateManager = new TemplateManager();
export default templateManager; 