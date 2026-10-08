import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions {
  /** Número de items a mostrar por página */
  itemsPerPage?: number;
  /** Número de items adicionales al cargar más */
  loadMoreCount?: number;
}

interface UsePaginationReturn<T> {
  /** Items que se deben mostrar actualmente */
  visibleItems: T[];
  /** Total de items disponibles */
  totalItems: number;
  /** Si hay más items para cargar */
  hasMore: boolean;
  /** Función para cargar más items */
  loadMore: () => void;
  /** Función para resetear la paginación */
  reset: () => void;
  /** Página actual */
  currentPage: number;
  /** Total de páginas */
  totalPages: number;
  /** Número de items visibles */
  visibleCount: number;
}

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { itemsPerPage = 10, loadMoreCount } = options;
  const increment = loadMoreCount || itemsPerPage;

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    if (items.length === 0) return 1;
    return Math.ceil(items.length / itemsPerPage);
  }, [items.length, itemsPerPage]);

  const visibleItems = useMemo(() => {
    const count = itemsPerPage + (currentPage - 1) * increment;
    return items.slice(0, count);
  }, [items, currentPage, itemsPerPage, increment]);

  const hasMore = useMemo(() => {
    return visibleItems.length < items.length;
  }, [visibleItems.length, items.length]);

  const loadMore = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    visibleItems,
    totalItems: items.length,
    hasMore,
    loadMore,
    reset,
    currentPage,
    totalPages,
    visibleCount: visibleItems.length,
  };
}
