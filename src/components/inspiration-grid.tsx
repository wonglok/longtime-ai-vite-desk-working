import React, { useEffect } from 'react';

interface Inspiration {
  id: string;
  url: string;
  websiteName: string;
  thumbnailUrl: string;
  textualAnalysis: string;
  aiNotes: string;
}

export default function InspirationGrid() {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);

  useEffect(() => {
    fetch('/api/inspirations')
      .then((res) => res.json())
      .then((data: Inspiration[]) => setInspirations(data));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {inspirations.map((inspiration) => (
        <InspirationCard key={inspiration.id} inspiration={inspiration} />
      ))}
    </div>
  );
}