import React, { useState } from 'react';

interface UrlInputFormProps {
  onSave: (url: string) => Promise<void>;
}

export default function UrlInputForm({ onSave }: UrlInputFormProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a URL.');
      return;
    }
    try {
      await onSave(url);
      setUrl('');
      setError(null);
    } catch (err) {
      setError('Failed to save inspiration. Please try again.');
    }
  };

  const isValidUrl = (input: string): boolean => {
    try {
      new URL(input);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="url"
        placeholder="Enter website URL..."
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setError(null);
        }}
        className={`border p-2 rounded ${error ? 'border-red-500' : 'border-gray-300'}`}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        Save Inspiration
      </button>
    </form>
  );
}