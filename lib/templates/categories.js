// 模板分类系统数据结构
// 按照风格和主题进行组织

const categories = [
  {
    id: 'nature',
    name: 'Nature',
    icon: 'landscape',
    description: 'Beautiful landscapes from the natural world',
    subcategories: [
      { id: 'forest', name: 'Forest', count: 0 },
      { id: 'mountain', name: 'Mountain', count: 0 },
      { id: 'ocean', name: 'Ocean', count: 0 },
      { id: 'lake', name: 'Lake', count: 0 },
      { id: 'garden', name: 'Garden', count: 0 }
    ]
  },
  {
    id: 'animals',
    name: 'Animals',
    icon: 'paw',
    description: 'Various cute animal characters',
    subcategories: [
      { id: 'mammals', name: 'Mammals', count: 0 },
      { id: 'birds', name: 'Birds', count: 0 },
      { id: 'marine', name: 'Marine Life', count: 0 },
      { id: 'insects', name: 'Insects', count: 0 },
      { id: 'fantasy', name: 'Fantasy Animals', count: 0 }
    ]
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    icon: 'sparkles',
    description: 'World of magic and fantasy',
    subcategories: [
      { id: 'castle', name: 'Magic Castle', count: 0 },
      { id: 'dragon', name: 'Dragons', count: 0 },
      { id: 'fairy', name: 'Fairies', count: 0 },
      { id: 'wizard', name: 'Wizards', count: 0 },
      { id: 'myth', name: 'Mythology', count: 0 }
    ]
  },
  {
    id: 'people',
    name: 'People',
    icon: 'user',
    description: 'Various characters and professions',
    subcategories: [
      { id: 'children', name: 'Children', count: 0 },
      { id: 'heroes', name: 'Heroes', count: 0 },
      { id: 'professions', name: 'Professions', count: 0 },
      { id: 'portraits', name: 'Portraits', count: 0 },
      { id: 'activities', name: 'Activities', count: 0 }
    ]
  },
  {
    id: 'seasons',
    name: 'Seasons',
    icon: 'calendar',
    description: 'Seasonal changes and holidays',
    subcategories: [
      { id: 'spring', name: 'Spring', count: 0 },
      { id: 'summer', name: 'Summer', count: 0 },
      { id: 'autumn', name: 'Autumn', count: 0 },
      { id: 'winter', name: 'Winter', count: 0 },
      { id: 'holidays', name: 'Holidays', count: 0 }
    ]
  },
  {
    id: 'ghibli',
    name: 'Ghibli Style',
    icon: 'totoro',
    description: 'Studio Ghibli style scenes and characters',
    subcategories: [
      { id: 'characters', name: 'Characters', count: 0 },
      { id: 'landscapes', name: 'Landscapes', count: 0 },
      { id: 'spirits', name: 'Spirits', count: 0 },
      { id: 'vehicles', name: 'Vehicles', count: 0 },
      { id: 'buildings', name: 'Buildings', count: 0 }
    ]
  }
];

// 用于获取所有分类的平铺列表（用于筛选）
const getAllCategories = () => {
  const allCategories = [];
  
  categories.forEach(category => {
    // 添加主分类
    allCategories.push({
      id: category.id,
      name: category.name,
      isMain: true,
      parentId: null
    });
    
    // 添加子分类
    category.subcategories.forEach(sub => {
      allCategories.push({
        id: `${category.id}-${sub.id}`,
        name: sub.name,
        isMain: false,
        parentId: category.id
      });
    });
  });
  
  return allCategories;
};

export { categories, getAllCategories }; 