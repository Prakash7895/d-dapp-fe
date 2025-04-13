import { useState, useEffect } from 'react';

interface S3File {
  key: string;
  lastModified: Date;
  size: number;
  url: string;
}

interface PaginatedFiles {
  files: S3File[];
  nextContinuationToken?: string;
  hasMore: boolean;
}

export function useUserFiles(limit: number = 10) {
  const [files, setFiles] = useState<S3File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [continuationToken, setContinuationToken] = useState<string | undefined>();

  const fetchFiles = async (token?: string) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      if (token) {
        params.append('continuationToken', token);
      }

      const response = await fetch(`/api/files?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data: PaginatedFiles = await response.json();
      
      if (token) {
        setFiles(prev => [...prev, ...data.files]);
      } else {
        setFiles(data.files);
      }
      
      setHasMore(data.hasMore);
      setContinuationToken(data.nextContinuationToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && continuationToken) {
      fetchFiles(continuationToken);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return {
    files,
    loading,
    error,
    hasMore,
    loadMore,
    refresh: () => fetchFiles(),
  };
} 