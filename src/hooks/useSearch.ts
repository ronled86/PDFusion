import { useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { usePdfDocument } from './usePdfDocument';
import { extractTextRects } from '../lib/pdfRender';

export const useSearch = () => {
  const { state, dispatch } = useAppContext();
  const { pdf } = usePdfDocument(state.file);

  const searchInDocument = useCallback(async (query: string) => {
    if (!pdf || !query.trim()) {
      dispatch({ type: 'CLEAR_SEARCH' });
      return;
    }

    dispatch({ type: 'SET_IS_SEARCHING', payload: true });
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });

    try {
      const results = [];
      
      // Search through all pages
      for (let pageIndex = 0; pageIndex < pdf.numPages; pageIndex++) {
        try {
          const highlights = await extractTextRects(pdf, pageIndex, query);
          if (highlights.length > 0) {
            results.push({ pageIndex, highlights });
          }
        } catch (error) {
          console.warn(`Failed to search page ${pageIndex + 1}:`, error);
        }
      }

      dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
      dispatch({ type: 'SET_CURRENT_SEARCH_RESULT_INDEX', payload: results.length > 0 ? 0 : -1 });

      // Build flattened hit list
  const flattened: Array<{ pageIndex: number; rectIndex: number; rect: { x: number; y: number; w: number; h: number; text?: string; start?: number; end?: number } }> = [];
      results.forEach(r => r.highlights.forEach((rect, rectIndex) => {
        flattened.push({ pageIndex: r.pageIndex, rectIndex, rect });
      }));
      dispatch({ type: 'SET_FLATTENED_SEARCH_HITS', payload: flattened });
      dispatch({ type: 'SET_CURRENT_SEARCH_HIT_INDEX', payload: flattened.length > 0 ? 0 : -1 });
      
      // Navigate to first result if found
      if (flattened.length > 0) {
        dispatch({ type: 'SET_PAGE_INDEX', payload: flattened[0].pageIndex });
      }
    } catch (error) {
      console.error('Search failed:', error);
      dispatch({ type: 'CLEAR_SEARCH' });
    } finally {
      dispatch({ type: 'SET_IS_SEARCHING', payload: false });
    }
  }, [pdf, dispatch]);

  const goToNextResult = useCallback(() => {
    const total = state.flattenedSearchHits.length;
    if (total === 0) return;
    const next = (state.currentSearchHitGlobalIndex + 1 + total) % total;
    dispatch({ type: 'SET_CURRENT_SEARCH_HIT_INDEX', payload: next });
    const target = state.flattenedSearchHits[next];
    if (target) dispatch({ type: 'SET_PAGE_INDEX', payload: target.pageIndex });
  }, [state.flattenedSearchHits, state.currentSearchHitGlobalIndex, dispatch]);

  const goToPrevResult = useCallback(() => {
    const total = state.flattenedSearchHits.length;
    if (total === 0) return;
    const prev = (state.currentSearchHitGlobalIndex - 1 + total) % total;
    dispatch({ type: 'SET_CURRENT_SEARCH_HIT_INDEX', payload: prev });
    const target = state.flattenedSearchHits[prev];
    if (target) dispatch({ type: 'SET_PAGE_INDEX', payload: target.pageIndex });
  }, [state.flattenedSearchHits, state.currentSearchHitGlobalIndex, dispatch]);

  const clearSearch = useCallback(() => {
    dispatch({ type: 'CLEAR_SEARCH' });
  }, [dispatch]);

  return {
    searchQuery: state.searchQuery,
    searchResults: state.searchResults,
    currentSearchResultIndex: state.currentSearchResultIndex,
  currentSearchHitGlobalIndex: state.currentSearchHitGlobalIndex,
  flattenedSearchHits: state.flattenedSearchHits,
    isSearching: state.isSearching,
  totalResults: state.flattenedSearchHits.length,
    searchInDocument,
    goToNextResult,
    goToPrevResult,
    clearSearch,
  };
};
