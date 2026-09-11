import { PageComment, CommentReply, CommentCategory, UserRole } from '../types/saas';

const COMMENTS_STORAGE_KEY = 'flipbook_page_comments_v1';

// Seed demo comments so the feature is immediately discoverable and interactive
const INITIAL_SEED_COMMENTS: PageComment[] = [
  {
    id: 'comm-seed-1',
    flipbookId: 'sample-azur-brochure',
    pageNumber: 1,
    authorName: 'Sophie Martin',
    authorRole: 'CLIENT',
    content: 'Pouvez-vous agrandir légèrement le blason doré et vérifier la netteté du logo sur fond sombre ?',
    category: 'DESIGN',
    coordinates: { x: 50, y: 28 },
    resolved: false,
    replies: [
      {
        id: 'reply-seed-1',
        authorName: 'Alexandre Studio',
        authorRole: 'ADMIN',
        content: 'C’est noté Sophie, nous avons basculé sur le fichier SVG vectoriel haute définition !',
        createdAt: Date.now() - 3600000 * 5,
      },
    ],
    color: '#818cf8', // Indigo
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'comm-seed-2',
    flipbookId: 'sample-azur-brochure',
    pageNumber: 2,
    authorName: 'Marc Delorme',
    authorRole: 'OPERATOR',
    content: 'Vérifier la mention "Chambres avec vue mer panoramique" : les tarifs 2026 débutent à 320€ et non 290€.',
    category: 'PRICE',
    coordinates: { x: 35, y: 64 },
    resolved: true,
    replies: [],
    color: '#fbbf24', // Amber
    createdAt: Date.now() - 3600000 * 18,
    updatedAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'comm-seed-3',
    flipbookId: 'sample-azur-brochure',
    pageNumber: 4,
    authorName: 'Sophie Martin',
    authorRole: 'CLIENT',
    content: 'Excellente photo pour le Spa & Bien-être ! Est-il possible d’ajouter un lien direct vers la carte des soins ?',
    category: 'GENERAL',
    coordinates: { x: 72, y: 45 },
    resolved: false,
    replies: [],
    color: '#34d399', // Emerald
    createdAt: Date.now() - 3600000 * 8,
    updatedAt: Date.now() - 3600000 * 8,
  },
];

type Listener = () => void;

class CommentService {
  private comments: PageComment[] = [];
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
      if (stored) {
        this.comments = JSON.parse(stored);
      } else {
        this.comments = [...INITIAL_SEED_COMMENTS];
        this.saveToStorage();
      }
    } catch (err) {
      console.warn('Failed to parse page comments from storage', err);
      this.comments = [...INITIAL_SEED_COMMENTS];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(this.comments));
      this.notify();
    } catch (err) {
      console.warn('Failed to save page comments to storage', err);
    }
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('CommentService listener error:', e);
      }
    });
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Retrieves all comments for a given flipbook, optionally filtered by pageNumber.
   */
  public getComments(flipbookId: string, pageNumber?: number): PageComment[] {
    return this.comments
      .filter((c) => {
        // match specific book or match sample seeds if on default book
        const bookMatches = c.flipbookId === flipbookId || (!c.flipbookId && flipbookId === 'sample-azur-brochure');
        if (!bookMatches) return false;
        if (pageNumber !== undefined && c.pageNumber !== pageNumber) return false;
        return true;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Counts comments and unresolved comments for badges.
   */
  public getCommentCounts(flipbookId: string, pageNumber?: number): { total: number; unresolved: number } {
    const list = this.getComments(flipbookId, pageNumber);
    const total = list.length;
    const unresolved = list.filter((c) => !c.resolved).length;
    return { total, unresolved };
  }

  /**
   * Adds a new comment targeted to a page or specific coordinate.
   */
  public addComment(params: {
    flipbookId: string;
    pageNumber: number;
    authorName: string;
    authorRole?: UserRole | string;
    content: string;
    category?: CommentCategory;
    coordinates?: { x: number; y: number };
    color?: string;
  }): PageComment {
    const now = Date.now();
    const newComment: PageComment = {
      id: `comm-${now}-${Math.random().toString(36).substring(2, 6)}`,
      flipbookId: params.flipbookId,
      pageNumber: params.pageNumber,
      authorName: params.authorName.trim() || 'Visiteur Anonyme',
      authorRole: params.authorRole || 'CLIENT',
      content: params.content.trim(),
      category: params.category || 'GENERAL',
      coordinates: params.coordinates,
      resolved: false,
      replies: [],
      color: params.color || this.getColorForCategory(params.category || 'GENERAL'),
      createdAt: now,
      updatedAt: now,
    };

    this.comments.unshift(newComment);
    this.saveToStorage();
    return newComment;
  }

  /**
   * Edits comment text.
   */
  public updateComment(commentId: string, newContent: string): PageComment | null {
    const comm = this.comments.find((c) => c.id === commentId);
    if (!comm) return null;
    comm.content = newContent.trim();
    comm.updatedAt = Date.now();
    this.saveToStorage();
    return comm;
  }

  /**
   * Toggles resolved status.
   */
  public toggleResolve(commentId: string): boolean {
    const comm = this.comments.find((c) => c.id === commentId);
    if (!comm) return false;
    comm.resolved = !comm.resolved;
    comm.updatedAt = Date.now();
    this.saveToStorage();
    return comm.resolved;
  }

  /**
   * Deletes a comment.
   */
  public deleteComment(commentId: string): boolean {
    const before = this.comments.length;
    this.comments = this.comments.filter((c) => c.id !== commentId);
    if (this.comments.length !== before) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Adds a reply to an existing comment.
   */
  public addReply(params: {
    commentId: string;
    authorName: string;
    authorRole?: UserRole | string;
    content: string;
  }): CommentReply | null {
    const comm = this.comments.find((c) => c.id === params.commentId);
    if (!comm) return null;

    const newReply: CommentReply = {
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      authorName: params.authorName.trim() || 'Relecteur',
      authorRole: params.authorRole || 'CLIENT',
      content: params.content.trim(),
      createdAt: Date.now(),
    };

    comm.replies.push(newReply);
    comm.updatedAt = Date.now();
    this.saveToStorage();
    return newReply;
  }

  /**
   * Deletes a reply.
   */
  public deleteReply(commentId: string, replyId: string): boolean {
    const comm = this.comments.find((c) => c.id === commentId);
    if (!comm) return false;
    const initialLen = comm.replies.length;
    comm.replies = comm.replies.filter((r) => r.id !== replyId);
    if (comm.replies.length !== initialLen) {
      comm.updatedAt = Date.now();
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Exports all comments for a flipbook in formatted Markdown.
   */
  public exportCommentsAsMarkdown(flipbookId: string, flipbookTitle: string = 'FlipBook'): string {
    const list = this.getComments(flipbookId);
    if (list.length === 0) {
      return `# Notes & Commentaires — ${flipbookTitle}\n\nAucune note enregistrée pour le moment.`;
    }

    const lines: string[] = [
      `# Rapport des Commentaires & Notes — ${flipbookTitle}`,
      `*Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}*`,
      `Total des notes : ${list.length} (${list.filter((c) => !c.resolved).length} en attente, ${list.filter((c) => c.resolved).length} résolues)`,
      '',
      '---',
      '',
    ];

    // Group by page number
    const byPage: Record<number, PageComment[]> = {};
    list.forEach((c) => {
      if (!byPage[c.pageNumber]) byPage[c.pageNumber] = [];
      byPage[c.pageNumber].push(c);
    });

    const sortedPages = Object.keys(byPage)
      .map(Number)
      .sort((a, b) => a - b);

    sortedPages.forEach((pageNum) => {
      lines.push(`## 📄 Page ${pageNum}`);
      lines.push('');

      byPage[pageNum].forEach((c, idx) => {
        const statusBadge = c.resolved ? '[RÉSOLU ✅]' : '[EN ATTENTE ⏳]';
        const coordText = c.coordinates ? ` (Position : ${c.coordinates.x}%, ${c.coordinates.y}%)` : '';
        lines.push(`### Note #${idx + 1} ${statusBadge} — Catégorie : ${c.category}${coordText}`);
        lines.push(`**Auteur :** ${c.authorName} (${c.authorRole}) le ${new Date(c.createdAt).toLocaleDateString('fr-FR')} à ${new Date(c.createdAt).toLocaleTimeString('fr-FR')}`);
        lines.push(`> ${c.content}`);

        if (c.replies.length > 0) {
          lines.push('');
          lines.push(`**Réponses (${c.replies.length}) :**`);
          c.replies.forEach((r) => {
            lines.push(`- **${r.authorName}** : ${r.content} *(le ${new Date(r.createdAt).toLocaleTimeString('fr-FR')})*`);
          });
        }
        lines.push('');
      });

      lines.push('---');
      lines.push('');
    });

    return lines.join('\n');
  }

  public getColorForCategory(cat: CommentCategory): string {
    switch (cat) {
      case 'TYPO':
        return '#f43f5e'; // Rose
      case 'PRICE':
        return '#f59e0b'; // Amber
      case 'DESIGN':
        return '#8b5cf6'; // Violet
      case 'QUESTION':
        return '#06b6d4'; // Cyan
      case 'APPROVAL':
        return '#10b981'; // Emerald
      case 'GENERAL':
      default:
        return '#6366f1'; // Indigo
    }
  }

  public getCategoryLabel(cat: CommentCategory): string {
    switch (cat) {
      case 'TYPO':
        return 'Correction texte';
      case 'PRICE':
        return 'Tarif / Devis';
      case 'DESIGN':
        return 'Design & Visuel';
      case 'QUESTION':
        return 'Question';
      case 'APPROVAL':
        return 'Validation';
      case 'GENERAL':
      default:
        return 'Remarque générale';
    }
  }
}

export const commentService = new CommentService();
