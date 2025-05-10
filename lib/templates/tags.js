// AI标签系统
// 支持模板内容的自动标记、查询和推荐

// 预定义标签集合（基础标签库）
const predefinedTags = {
  // 视觉风格标签
  styles: [
    { id: 'cartoon', name: 'Cartoon', weight: 1.0 },
    { id: 'realistic', name: 'Realistic', weight: 1.0 },
    { id: 'anime', name: 'Anime', weight: 1.0 },
    { id: 'watercolor', name: 'Watercolor', weight: 1.0 },
    { id: 'line-art', name: 'Line Art', weight: 1.0 },
    { id: 'pixel-art', name: 'Pixel Art', weight: 1.0 },
    { id: 'ghibli-style', name: 'Ghibli Style', weight: 1.2 }
  ],
  
  // 难度标签（用于推荐合适年龄段的内容）
  difficulty: [
    { id: 'easy', name: 'Easy', weight: 1.0 },
    { id: 'medium', name: 'Medium', weight: 1.0 },
    { id: 'hard', name: 'Hard', weight: 1.0 }
  ],
  
  // 情感标签（用于匹配用户情绪）
  emotions: [
    { id: 'happy', name: 'Happy', weight: 1.0 },
    { id: 'calm', name: 'Calm', weight: 1.0 },
    { id: 'exciting', name: 'Exciting', weight: 1.0 },
    { id: 'mysterious', name: 'Mysterious', weight: 1.0 },
    { id: 'cute', name: 'Cute', weight: 1.1 }
  ],
  
  // 场景元素标签
  elements: [
    { id: 'water', name: 'Water', weight: 1.0 },
    { id: 'forest', name: 'Forest', weight: 1.0 },
    { id: 'mountain', name: 'Mountain', weight: 1.0 },
    { id: 'animals', name: 'Animals', weight: 1.0 },
    { id: 'flowers', name: 'Flowers', weight: 1.0 },
    { id: 'buildings', name: 'Buildings', weight: 1.0 },
    { id: 'people', name: 'People', weight: 1.0 },
    { id: 'magic', name: 'Magic', weight: 1.0 }
  ]
};

// 获取所有标签（扁平化）
const getAllTags = () => {
  return Object.values(predefinedTags).flat();
};

// 基于描述或内容自动生成标签
const generateTagsFromDescription = (description) => {
  const description_lower = description.toLowerCase();
  const tags = [];
  
  // 遍历所有标签，检查描述中是否包含相关关键词
  getAllTags().forEach(tag => {
    // 检查描述中是否包含标签名称或ID（简单实现）
    if (description_lower.includes(tag.id) || 
        description_lower.includes(tag.name.toLowerCase())) {
      tags.push({
        id: tag.id,
        name: tag.name,
        confidence: 0.9, // 基于文本匹配的高置信度
        source: 'text-match'
      });
    }
  });
  
  // 在实际实现中，这里可以调用AI服务来分析内容并返回更准确的标签
  // 以下是模拟的一些规则
  
  // 风格检测
  if (description_lower.includes('卡通') || description_lower.includes('cartoon')) {
    tags.push({ id: 'cartoon', name: 'Cartoon', confidence: 0.85, source: 'rule-based' });
  }
  
  if (description_lower.includes('水彩') || description_lower.includes('watercolor')) {
    tags.push({ id: 'watercolor', name: 'Watercolor', confidence: 0.85, source: 'rule-based' });
  }
  
  if (description_lower.includes('吉卜力') || description_lower.includes('宫崎骏') || 
      description_lower.includes('龙猫') || description_lower.includes('totoro')) {
    tags.push({ id: 'ghibli-style', name: 'Ghibli Style', confidence: 0.95, source: 'rule-based' });
  }
  
  // 情感检测
  if (description_lower.includes('可爱') || description_lower.includes('萌') || 
      description_lower.includes('cute')) {
    tags.push({ id: 'cute', name: 'Cute', confidence: 0.8, source: 'rule-based' });
  }
  
  if (description_lower.includes('平静') || description_lower.includes('宁静') || 
      description_lower.includes('calm') || description_lower.includes('peaceful')) {
    tags.push({ id: 'calm', name: 'Calm', confidence: 0.8, source: 'rule-based' });
  }
  
  // 难度评估（基于复杂度关键词）
  if (description_lower.includes('简单') || description_lower.includes('easy') || 
      description_lower.includes('基础')) {
    tags.push({ id: 'easy', name: 'Easy', confidence: 0.8, source: 'rule-based' });
  } else if (description_lower.includes('复杂') || description_lower.includes('difficult') || 
            description_lower.includes('高级')) {
    tags.push({ id: 'hard', name: 'Hard', confidence: 0.8, source: 'rule-based' });
  } else {
    // 默认为中等难度
    tags.push({ id: 'medium', name: 'Medium', confidence: 0.7, source: 'default' });
  }
  
  // 去重（可能通过不同规则多次添加相同标签）
  const uniqueTags = tags.filter((tag, index, self) =>
    index === self.findIndex(t => t.id === tag.id)
  );
  
  return uniqueTags;
};

// 根据用户历史和偏好推荐标签
const getRecommendedTags = (userHistory = []) => {
  // 在实际实现中，这应该基于用户的历史记录和偏好进行个性化推荐
  // 简化实现：返回一些流行标签
  return [
    { id: 'ghibli-style', name: 'Ghibli Style', weight: 1.2 },
    { id: 'cute', name: 'Cute', weight: 1.1 },
    { id: 'easy', name: 'Easy', weight: 1.0 },
    { id: 'cartoon', name: 'Cartoon', weight: 1.0 },
    { id: 'animals', name: 'Animals', weight: 1.0 }
  ];
};

// 根据标签查找相关模板
const findTemplatesByTags = (templates, tagIds, limit = 10) => {
  if (!templates || !tagIds || tagIds.length === 0) {
    return [];
  }
  
  // 计算每个模板与所需标签的匹配度
  const scoredTemplates = templates.map(template => {
    let score = 0;
    const templateTagIds = (template.tags || []).map(tag => tag.id);
    
    // 计算匹配的标签数量和权重总和
    tagIds.forEach(tagId => {
      if (templateTagIds.includes(tagId)) {
        // 找到标签的权重
        const allTags = getAllTags();
        const tagObj = allTags.find(t => t.id === tagId);
        const weight = tagObj ? tagObj.weight : 1.0;
        
        score += weight;
      }
    });
    
    return {
      template,
      score
    };
  });
  
  // 按分数排序并返回前N个
  return scoredTemplates
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.template);
};

export { 
  predefinedTags, 
  getAllTags, 
  generateTagsFromDescription, 
  getRecommendedTags,
  findTemplatesByTags
}; 