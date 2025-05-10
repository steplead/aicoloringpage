import React, { useState, useEffect } from 'react';
import templateManager from '../../lib/templates/templateManager';
import TemplateCard from './template-card';

/**
 * Template Selector Component
 * Enhanced with categories and AI tags support
 */
const TemplateSelector = ({
  onSelectTemplate = () => {},
  className = '',
  isLoading: initialLoading = false
}) => {
  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [popularTags, setPopularTags] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popularity');
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(initialLoading);
  
  // Fetch templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoadingTemplates(true);
        
        // 加载分类
        setCategories(templateManager.getCategories());
        
        // 加载流行标签
        setPopularTags(templateManager.getPopularTags());
        
        // 加载初始模板，基于选定的分类
        loadTemplates();
        
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    
    fetchTemplates();
  }, []);
  
  // Filter templates when category or search term changes
  useEffect(() => {
    loadTemplates();
  }, [selectedCategoryId, selectedSubcategoryId, selectedTags, searchQuery, sortBy]);
  
  // Load templates function
  const loadTemplates = () => {
    let filteredTemplates = [];
    
    // Filter by category
    if (selectedCategoryId === 'all') {
      filteredTemplates = templateManager.getAllTemplates();
    } else if (selectedSubcategoryId) {
      filteredTemplates = templateManager.getTemplatesByCategory(
        selectedCategoryId, 
        selectedSubcategoryId
      );
    } else {
      filteredTemplates = templateManager.getTemplatesByCategory(selectedCategoryId);
    }
    
    // Filter by tags
    if (selectedTags.length > 0) {
      const tagFilteredTemplates = templateManager.getTemplatesByTags(
        selectedTags,
        filteredTemplates.length // Get all matching templates
      );
      
      // Intersection
      filteredTemplates = filteredTemplates.filter(template => 
        tagFilteredTemplates.some(t => t.id === template.id)
      );
    }
    
    // Search filter
    if (searchQuery.trim() !== '') {
      filteredTemplates = filteredTemplates.filter(template => 
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Sort
    switch (sortBy) {
      case 'popularity':
        filteredTemplates.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'newest':
        filteredTemplates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'title':
        filteredTemplates.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'difficulty':
        const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
        filteredTemplates.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
        break;
    }
    
    setTemplates(filteredTemplates);
  };
  
  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(null); // Clear subcategory selection
  };
  
  // Handle subcategory change
  const handleSubcategoryChange = (subcategoryId) => {
    setSelectedSubcategoryId(subcategoryId === selectedSubcategoryId ? null : subcategoryId);
  };
  
  // Handle tag selection
  const handleTagToggle = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };
  
  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedCategoryId('all');
    setSelectedSubcategoryId(null);
    setSelectedTags([]);
    setSearchQuery('');
  };
  
  // Get current selected category
  const currentCategory = categories.find(c => c.id === selectedCategoryId);
  
  return (
    <div className="template-selector">
      {/* Top search and filter bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
      {/* Search input */}
        <div className="relative w-full sm:w-64 md:w-80">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {/* View and sort options */}
        <div className="flex space-x-4 w-full sm:w-auto justify-between sm:justify-end">
          {/* View toggle buttons */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Sort dropdown menu */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700"
          >
            <option value="popularity">By Popularity</option>
            <option value="newest">By Newest</option>
            <option value="title">By Title</option>
            <option value="difficulty">By Difficulty</option>
          </select>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left filter panel */}
        <div className="w-full md:w-64 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Category Browse</h3>
          
          {/* Category list */}
          <ul className="space-y-1 mb-6">
            <li>
              <button
                onClick={() => handleCategoryChange('all')}
                className={`w-full text-left px-3 py-2 rounded-md ${selectedCategoryId === 'all' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                All Templates
              </button>
            </li>
            {categories.map(category => (
              <li key={category.id}>
                <button
                  onClick={() => handleCategoryChange(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-md ${selectedCategoryId === category.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
          
          {/* Show subcategories (if a main category is selected) */}
          {currentCategory && selectedCategoryId !== 'all' && (
            <>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Subcategories</h3>
              <ul className="space-y-1 mb-6">
                {currentCategory.subcategories.map(subcategory => (
                  <li key={subcategory.id}>
                    <button
                      onClick={() => handleSubcategoryChange(subcategory.id)}
                      className={`w-full text-left px-3 py-2 rounded-md flex justify-between items-center ${selectedSubcategoryId === subcategory.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                    >
                      <span>{subcategory.name}</span>
                      <span className="text-sm text-gray-500">({subcategory.count})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          
          {/* Popular tags */}
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Popular Tags</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {popularTags.map(tag => (
          <button
                key={tag.id}
                onClick={() => handleTagToggle(tag.id)}
                className={`px-3 py-1 rounded-full text-sm ${selectedTags.includes(tag.id) ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
                {tag.name}
          </button>
        ))}
      </div>
      
          {/* Clear filters button */}
          {(selectedCategoryId !== 'all' || selectedSubcategoryId || selectedTags.length > 0 || searchQuery) && (
            <button
              onClick={clearFilters}
              className="w-full px-3 py-2 mt-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Clear All Filters
            </button>
          )}
        </div>
        
        {/* Right template display area */}
        <div className="flex-1">
          {/* Result count and filter summary */}
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-600">
              Found <span className="font-semibold">{templates.length}</span> templates
              {selectedCategoryId !== 'all' && ` • ${categories.find(c => c.id === selectedCategoryId)?.name}`}
              {selectedSubcategoryId && currentCategory && ` • ${currentCategory.subcategories.find(s => s.id === selectedSubcategoryId)?.name}`}
            </p>
          </div>
          
          {/* Selected tag list */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedTags.map(tagId => {
                const tag = popularTags.find(t => t.id === tagId);
                return tag ? (
                  <div key={tagId} className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm">
                    {tag.name}
                    <button
                      onClick={() => handleTagToggle(tagId)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                      >
                      &times;
                    </button>
                  </div>
                ) : null;
              })}
                </div>
          )}
          
          {/* Template display area */}
          {templates.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {templates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={() => onSelectTemplate(template)}
                  viewMode={viewMode}
                />
            ))}
          </div>
        ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
              <p className="mt-4 text-gray-500">No templates found</p>
              <button
                onClick={clearFilters}
                className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Clear All Filters
              </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default TemplateSelector; 