import { getFiles } from '@/apiCalls';
import { useState, useEffect } from 'react';

export interface S3File {
  key: string;
  id: number;
  url: string;
  createdAt: string;
}

export function useUserFiles(limit: number = 10) {
  const [files, setFiles] = useState<S3File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [pageNo, setPageNo] = useState(1);

  const fetchFiles = async (pgNo: number) => {
    try {
      setLoading(true);
      setError(null);

      const data = await getFiles(pgNo, limit);
      if (data.status === 'success') {
        setPageNo(pgNo);
        setFiles((prev) =>
          pgNo === 1 ? [...(data.data ?? [])] : [...prev, ...(data.data ?? [])]
        );
        setHasMore(!!(data.data && data.data.length === limit));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore) {
      fetchFiles(pageNo + 1);
    }
  };

  useEffect(() => {
    fetchFiles(1);
  }, []);

  return {
    files,
    loading,
    error,
    hasMore,
    loadMore,
    refresh: () => {
      setPageNo(1);
      fetchFiles(1);
    },
  };
}
