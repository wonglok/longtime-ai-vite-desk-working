import Image from 'next/image';

interface InspirationCardProps {
  id: string;
  url: string;
  thumbnailPath: string;
  aiNotes: string;
  websiteName: string;
}

export default function InspirationCard({ id, url, thumbnailPath, aiNotes, websiteName }: InspirationCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Thumbnail Header */}
      <div className="relative h-48 w-full bg-gray-200">
        {thumbnailPath && (
          <img
            src={thumbnailPath}
            alt={`Screenshot of ${websiteName}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{websiteName}</h3>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block mb-2">
          {url}
        </a>

        {/* AI Analysis Notes */}
        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-600 uppercase mb-1">AI Analysis</h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiNotes}</p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => window.location.href = `/inspire/${id}`}
          className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
