import React from 'react';

// Template card component
// Used to display a single template in the template selector
// Supports grid view and list view modes
const TemplateCard = ({ template, onSelect, viewMode = 'grid' }) => {
  // Determine the color for difficulty label
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get difficulty text
  const getDifficultyText = (difficulty) => {
    const difficultyMap = {
      'easy': 'Easy',
      'medium': 'Medium',
      'hard': 'Hard'
    };
    return difficultyMap[difficulty] || difficulty;
  };
  
  // Determine the color for tag
  const getTagColor = (tagId) => {
    // Simple hash algorithm to assign colors to tags
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-yellow-100 text-yellow-800',
      'bg-orange-100 text-orange-800',
      'bg-teal-100 text-teal-800'
    ];
    
    // Fixed colors for special tags
    if (tagId === 'ghibli-style') return 'bg-blue-100 text-blue-800';
    if (tagId === 'cute') return 'bg-pink-100 text-pink-800';
    if (tagId === 'magic') return 'bg-purple-100 text-purple-800';
    if (tagId === 'forest') return 'bg-green-100 text-green-800';
    if (tagId === 'water') return 'bg-teal-100 text-teal-800';
    
    // Calculate hash value and select color
    let hash = 0;
    for (let i = 0; i < tagId.length; i++) {
      hash = (hash + tagId.charCodeAt(i)) % colors.length;
    }
    
    return colors[hash];
  };
  
  // Grid view
  if (viewMode === 'grid') {
    return (
      <div className="group cursor-pointer" onClick={onSelect}>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 transition-shadow group-hover:shadow-md">
          {/* Thumbnail */}
          <div className="relative aspect-square overflow-hidden">
            <img
              src={template.thumbnailUrl || template.imageUrl}
              alt={template.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            
            {/* Difficulty label */}
            <div className="absolute top-2 left-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(template.difficulty)}`}>
                {getDifficultyText(template.difficulty)}
              </span>
            </div>
            
            {/* Popularity indicator */}
            {template.popularity >= 90 && (
              <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full flex items-center text-xs text-amber-600">
                <svg className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 15.585l-7.071 3.536 1.415-8.236L0 6.171l7.071-1.026L10 0l2.929 5.145L20 6.171l-5.657 5.714 1.414 8.236z" clipRule="evenodd" />
                </svg>
                Popular
              </div>
            )}
          </div>
          
          {/* Title and tags */}
          <div className="p-3">
            <h3 className="font-semibold text-gray-800 mb-2">{template.title}</h3>
            
            {/* AI tags */}
            <div className="flex flex-wrap gap-1 mt-1">
              {template.tags.slice(0, 3).map(tag => (
                <span
                  key={tag.id}
                  className={`text-xs px-2 py-0.5 rounded-full ${getTagColor(tag.id)}`}
                >
                  {tag.name}
                </span>
              ))}
              {template.tags.length > 3 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  +{template.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // List view
  return (
    <div 
      className="group cursor-pointer bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-shadow group-hover:shadow-md"
      onClick={onSelect}
    >
      <div className="flex">
        {/* Thumbnail area */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 overflow-hidden">
          <img
            src={template.thumbnailUrl || template.imageUrl}
            alt={template.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        
        {/* Content area */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">{template.title}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{template.description}</p>
          </div>
          
          <div className="flex justify-between items-end mt-2">
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 2).map(tag => (
                <span
                  key={tag.id}
                  className={`text-xs px-2 py-0.5 rounded-full ${getTagColor(tag.id)}`}
                >
                  {tag.name}
                </span>
              ))}
              {template.tags.length > 2 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  +{template.tags.length - 2}
                </span>
              )}
            </div>
            
            {/* Difficulty and popularity */}
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(template.difficulty)}`}>
                {getDifficultyText(template.difficulty)}
              </span>
              
              {template.popularity >= 90 && (
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                  <svg className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 15.585l-7.071 3.536 1.415-8.236L0 6.171l7.071-1.026L10 0l2.929 5.145L20 6.171l-5.657 5.714 1.414 8.236z" clipRule="evenodd" />
                  </svg>
                  Popular
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard; 