import Image from 'next/image';

interface InspirationCardProps {
  id: string;
  thumbnailUrl: string;
  websiteName: string;
  textualAnalysis?: string;
}

export default function InspirationCard({ id, thumbnailUrl, websiteName, textualAnalysis }: InspirationCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Thumbnail Header */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={`${websiteName} screenshot`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="mb-2 truncate text-lg font-semibold text-gray-900" title={websiteName}>
          {websiteName}
        </h3>
        
        {textualAnalysis && (
          <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
            {textualAnalysis}
          </p>
        )}
      </div>
    </div>
  );
}