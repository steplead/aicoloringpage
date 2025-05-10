import React, { useState, useEffect } from 'react';
import templateManager from '../../lib/templates/templateManager';
import TemplateCard from './template-card';

// Template details component
// Displays detailed information about a template, tags, categories, and similar templates
const TemplateDetails = ({ templateId, onSelectTemplate, onBack }) => {
  const [template, setTemplate] = useState(null);
  const [similarTemplates, setSimilarTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load template and similar templates
  useEffect(() => {
    if (!templateId) return;
    
    // Get template details
    const templateData = templateManager.getTemplateById(templateId);
    setTemplate(templateData);
    
    // Get similar templates
    if (templateData) {
      const similar = templateManager.getSimilarTemplates(templateId);
      setSimilarTemplates(similar);
    }
    
    setLoading(false);
  }, [templateId]);
  
  // Get difficulty class style
  const getDifficultyClass = (difficulty) => {
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
  
  // Show loading state if loading or template not found
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!template) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="mt-4 text-gray-500">Template not found</p>
        <button
          onClick={onBack}
          className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Back to template list
        </button>
      </div>
    );
  }
  
  // Get full category and subcategory names
  const category = templateManager.getCategories().find(c => c.id === template.category);
  const subcategory = category?.subcategories.find(s => s.id === template.subcategory);
  
  return (
    <div className="template-details">
      {/* Back button */}
      <div className="mb-4">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to template list
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="md:flex">
          {/* Left image area */}
          <div className="md:w-1/2 p-4">
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              <img
                src={template.imageUrl}
                alt={template.title}
                className="w-full h-auto"
              />
              
              {/* Difficulty tag */}
              <div className="absolute top-3 left-3">
                <span className={`px-3 py-1 rounded-full ${getDifficultyClass(template.difficulty)}`}>
                  {getDifficultyText(template.difficulty)}
                </span>
              </div>
              
              {/* Popularity tag */}
              {template.popularity >= 90 && (
                <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full flex items-center text-amber-600">
                  <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 15.585l-7.071 3.536 1.415-8.236L0 6.171l7.071-1.026L10 0l2.929 5.145L20 6.171l-5.657 5.714 1.414 8.236z" clipRule="evenodd" />
                  </svg>
                  Popular Template
                </div>
              )}
            </div>
          </div>
          
          {/* Right details area */}
          <div className="md:w-1/2 p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{template.title}</h2>
            
            <p className="text-gray-600 mb-4">{template.description}</p>
            
            {/* Category information */}
            <div className="mb-4">
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <span className="font-medium mr-2">Category:</span>
                <span>
                  {category ? category.name : template.category}
                  {subcategory && ` > ${subcategory.name}`}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <span className="font-medium mr-2">Created:</span>
                <span>{template.createdAt}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <span className="font-medium mr-2">Popularity:</span>
                <div className="flex items-center">
                  <div className="relative w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                      style={{ width: `${template.popularity}%` }}
                    ></div>
                  </div>
                  <span className="ml-2">{template.popularity}%</span>
                </div>
              </div>
            </div>
            
            {/* Tags */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">AI Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {template.tags.map(tag => (
                  <span
                    key={tag.id}
                    className={`px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm`}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => onSelectTemplate(template)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Use This Template
              </button>
              
              <button
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Save to Favorites
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Similar templates */}
      {similarTemplates.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Similar Templates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similarTemplates.map(similarTemplate => (
              <TemplateCard
                key={similarTemplate.id}
                template={similarTemplate}
                onSelect={() => onSelectTemplate(similarTemplate)}
                viewMode="grid"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateDetails; 