'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchSubmissions } from '../api/submissions';
import type {
  Submission,
  SubmissionFilters,
  PaginationParams,
} from '../types/submission';

interface UseSubmissionsReturn {
  submissions: Submission[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  hasMore: boolean;
  currentPage: number;
  totalPages?: number;
  goToPage: (page: number) => void;
  loadMore: () => void;
}

const DEFAULT_LIMIT = 10;

export function useSubmissions(
  filters?: SubmissionFilters,
  initialPagination?: PaginationParams,
): UseSubmissionsReturn {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationParams>({
    page: initialPagination?.page || 1,
    limit: initialPagination?.limit || DEFAULT_LIMIT,
    ...initialPagination,
  });
  const [hasMore, setHasMore] = useState(false);
  const [totalPages, setTotalPages] = useState<number | undefined>();

  const loadSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchSubmissions(filters, pagination);
      setSubmissions(response.data);
      setHasMore(response.pagination.hasMore ?? false);
      setTotalPages(response.pagination.totalPages);

      // If using cursor-based pagination, update cursor
      if (response.pagination.nextCursor) {
        setPagination((prev) => ({
          ...prev,
          cursor: response.pagination.nextCursor,
        }));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load submissions'),
      );
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Only include filter values, not pagination object to avoid infinite loops
    filters?.status,
    pagination.page,
    pagination.limit,
    pagination.cursor,
  ]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const refetch = useCallback(async () => {
    await loadSubmissions();
  }, [loadSubmissions]);

  const goToPage = useCallback(
    (page: number) => {
      setPagination((prev) => ({
        ...prev,
        page,
        cursor: undefined, // Reset cursor when using page-based pagination
      }));
    },
    [],
  );

  const loadMore = useCallback(() => {
    if (pagination.page) {
      // Offset-based pagination
      setPagination((prev) => ({
        ...prev,
        page: (prev.page || 1) + 1,
      }));
    } else if (pagination.cursor) {
      // Cursor-based pagination - trigger load with current cursor
      loadSubmissions();
    }
  }, [pagination.page, pagination.cursor, loadSubmissions]);

  return {
    submissions,
    isLoading,
    error,
    refetch,
    hasMore,
    currentPage: pagination.page || 1,
    totalPages,
    goToPage,
    loadMore,
  };
}
