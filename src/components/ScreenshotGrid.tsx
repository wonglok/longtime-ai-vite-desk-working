import React from 'react';

interface InspirationData {
  id: string;
  url: string;
  thumbnailPath: string;
  aiNotes: string;
  textContent: string;
}

const ScreenshotGrid = ({ inspirations }: { inspirations: InspirationData[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {inspirations.map((item) => (
        <article key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
          {/* Thumbnail Header */}
          <div className="relative h-48 bg-gray-200 flex items-center justify-center">
            {item.thumbnailPath ? (
              <img
                src={item.thumbnailPath}
                alt={`Screenshot of ${item.url}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500">No Screenshot</span>
            )}
          </div>

          {/* Content Section */}
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 truncate" title={item.url}>
              {item.url}
            </h3>
            
            <div className="text-sm text-gray-600 mb-3 line-clamp-2">
              {item.textContent || 'No content extracted'}
            </div>

            {/* AI Notes */}
            <div className="bg-blue-50 p-3 rounded-md border-l-4 border-blue-500">
              <h4 className="font-semibold text-sm mb-1">AI Analysis</h4>
              <p className="text-xs text-gray-700 whitespace-pre-wrap">
                {item.aiNotes || 'No AI notes generated yet.'}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default ScreenshotGrid;
