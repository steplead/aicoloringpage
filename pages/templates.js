import React, { useState } from 'react';
import Head from 'next/head';
import TemplateSelector from '../components/ui/template-selector';
import TemplateDetails from '../components/ui/template-details';

const TemplatesPage = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [viewMode, setViewMode] = useState('browse'); // 'browse' or 'detail'
  
  // Handle template selection
  const handleSelectTemplate = (template) => {
    console.log('Selected template:', template);
    // In actual implementation, this would navigate to the edit page
    alert(`Selected template: ${template.title}, would navigate to edit page in actual implementation`);
  };
  
  // Handle template details view
  const handleViewDetails = (template) => {
    setSelectedTemplateId(template.id);
    setViewMode('detail');
    window.scrollTo(0, 0);
  };
  
  // Return to browse mode
  const handleBackToBrowse = () => {
    setViewMode('browse');
    setSelectedTemplateId(null);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Templates - AI Coloring Page App</title>
        <meta name="description" content="Browse and select AI coloring page templates, including various categories and styles" />
        <meta name="keywords" content="AI coloring page,templates,categories,tags,ghibli style" />
      </Head>
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Template Library</h1>
        <p className="text-gray-600 mb-8">
          Browse our template library and choose your favorite template to start creating. 
          Use category and tag filters to find the perfect template.
        </p>
        
        {viewMode === 'browse' ? (
          // Browse mode - show template selector
          <TemplateSelector
            onSelectTemplate={handleViewDetails}
          />
        ) : (
          // Detail mode - show template details
          <TemplateDetails
            templateId={selectedTemplateId}
            onSelectTemplate={handleSelectTemplate}
            onBack={handleBackToBrowse}
          />
        )}
      </main>
      
      <footer className="mt-16 bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2024 AI Coloring Page App. All templates are for demonstration purposes only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TemplatesPage; 