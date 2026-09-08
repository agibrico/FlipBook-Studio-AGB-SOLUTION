import { FlipBookDocument, BookPage } from '../types';
import { SearchMatch, TocItem, BookmarkRecord } from '../types/saas';

class SearchService {
  /**
   * Search for text matches across all pages of a flipbook document
   */
  public search(doc: FlipBookDocument, query: string): SearchMatch[] {
    if (!query || query.trim().length < 2) return [];

    const cleanQuery = query.trim().toLowerCase();
    const results: SearchMatch[] = [];

    doc.pages.forEach((page) => {
      // Aggregate searchable text: page.text or extracted from htmlContent
      let content = page.text || '';
      if (!content && page.htmlContent) {
        // Strip HTML tags for clean text matching
        content = page.htmlContent.replace(/<[^>]*>/g, ' ');
      }
      if (!content && page.title) {
        content = page.title;
      }

      if (!content) return;

      const lowerContent = content.toLowerCase();
      let startIndex = 0;

      while ((startIndex = lowerContent.indexOf(cleanQuery, startIndex)) !== -1) {
        const snippetStart = Math.max(0, startIndex - 35);
        const snippetEnd = Math.min(content.length, startIndex + cleanQuery.length + 35);

        const snippetBefore = (snippetStart > 0 ? '…' : '') + content.substring(snippetStart, startIndex);
        const matchText = content.substring(startIndex, startIndex + cleanQuery.length);
        const snippetAfter = content.substring(startIndex + cleanQuery.length, snippetEnd) + (snippetEnd < content.length ? '…' : '');

        results.push({
          pageNumber: page.pageNumber,
          term: cleanQuery,
          snippetBefore,
          matchText,
          snippetAfter,
        });

        startIndex += cleanQuery.length;
        if (results.length > 50) break; // Maximum 50 matches for performance
      }
    });

    return results;
  }

  /**
   * Extract or generate table of contents
   */
  public getTableOfContents(doc: FlipBookDocument): TocItem[] {
    if (doc.tableOfContents && doc.tableOfContents.length > 0) {
      return doc.tableOfContents.map((item) => ({
        id: item.id,
        title: item.title,
        pageNumber: item.pageNumber,
        level: item.level || 1,
      }));
    }

    // Fallback: build auto TOC from page titles
    return doc.pages
      .filter((p) => p.title && p.title.trim().length > 0)
      .map((p, idx) => ({
        id: `toc-${p.pageNumber}-${idx}`,
        title: p.title || `Page ${p.pageNumber}`,
        pageNumber: p.pageNumber,
        level: 1,
      }));
  }

  /**
   * Bookmark storage management in local storage
   */
  public getBookmarks(flipbookId: string): BookmarkRecord[] {
    try {
      const stored = localStorage.getItem(`flipbook_bookmarks_${flipbookId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load bookmarks', e);
    }
    return [];
  }

  public saveBookmark(flipbookId: string, pageNumber: number, title?: string, color: string = '#6366f1'): BookmarkRecord {
    const list = this.getBookmarks(flipbookId);
    const existingIndex = list.findIndex((b) => b.pageNumber === pageNumber);

    const newBookmark: BookmarkRecord = {
      id: `bm-${Date.now()}`,
      flipbookId,
      pageNumber,
      title: title || `Page ${pageNumber}`,
      color,
      createdAt: Date.now(),
    };

    if (existingIndex >= 0) {
      list[existingIndex] = newBookmark;
    } else {
      list.push(newBookmark);
      list.sort((a, b) => a.pageNumber - b.pageNumber);
    }

    try {
      localStorage.setItem(`flipbook_bookmarks_${flipbookId}`, JSON.stringify(list));
    } catch {}

    return newBookmark;
  }

  public removeBookmark(flipbookId: string, pageNumber: number) {
    const list = this.getBookmarks(flipbookId).filter((b) => b.pageNumber !== pageNumber);
    try {
      localStorage.setItem(`flipbook_bookmarks_${flipbookId}`, JSON.stringify(list));
    } catch {}
  }
}

export const searchService = new SearchService();
