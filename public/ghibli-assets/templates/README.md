# 模板系统使用指南

## 模板目录结构

模板图片应放在以下目录结构中：

```
public/artworks/{uuid}/image.png          # 原始图片
public/artworks/{uuid}/thumbnails/thumbnail.png  # 缩略图
```

## 要求

1. 所有模板图片必须是英文命名
2. 图片应为清晰的线稿，适合涂色
3. 缩略图建议尺寸：300x300像素
4. 原始图片建议尺寸：至少1000x1000像素

## 添加新模板

### 1. 创建唯一ID

为每个新模板创建唯一的UUID目录

### 2. 添加模板图片

将原始图片和缩略图分别保存到相应目录：
- `public/artworks/{uuid}/image.png`
- `public/artworks/{uuid}/thumbnails/thumbnail.png`

### 3. 更新模板数据

在`lib/templates/templateManager.js`文件中更新模板数据：

```javascript
{
  id: 'template-xx',
  title: 'English Title',  // 英文标题
  description: 'English description...',  // 英文描述
  imageUrl: '/artworks/{uuid}/image.png',  // 图片路径
  thumbnailUrl: '/artworks/{uuid}/thumbnails/thumbnail.png',  // 缩略图路径
  category: 'category-id',  // 分类ID
  subcategory: 'subcategory-id',  // 子分类ID
  difficulty: 'easy|medium|hard',  // 难度级别
  popularity: 85,  // 人气度0-100
  createdAt: '2024-09-30',  // 创建日期
  tags: [  // 相关标签
    { id: 'tag-id', name: 'Tag Name' },
    // 更多标签...
  ]
}
```

## 注意事项

1. 所有新增模板需符合系统定义的分类和标签系统
2. 确保模板图片是高质量的线稿，无版权问题
3. 标签需要使用预定义的标签ID，可在`lib/templates/tags.js`中查看
4. 分类和子分类需要使用预定义的ID，可在`lib/templates/categories.js`中查看 