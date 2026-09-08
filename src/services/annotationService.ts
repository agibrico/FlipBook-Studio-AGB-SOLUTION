import {
  VisualAnnotation,
  AnnotationType,
  ReviewWorkflowStatus,
  ReviewFeedback,
  UserRole,
} from '../types/saas';

const ANNOTATIONS_STORAGE_KEY = 'flipbook_visual_annotations';
const REVIEW_STORAGE_KEY = 'flipbook_review_workflows';

class AnnotationService {
  private annotations: VisualAnnotation[] = [];
  private reviews: Record<string, { status: ReviewWorkflowStatus; feedbacks: ReviewFeedback[] }> = {};

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const ann = localStorage.getItem(ANNOTATIONS_STORAGE_KEY);
      if (ann) this.annotations = JSON.parse(ann);

      const rev = localStorage.getItem(REVIEW_STORAGE_KEY);
      if (rev) this.reviews = JSON.parse(rev);
    } catch (e) {
      console.warn('Failed to load annotations from storage', e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(ANNOTATIONS_STORAGE_KEY, JSON.stringify(this.annotations));
      localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(this.reviews));
    } catch (e) {
      console.warn('Failed to save annotations to storage', e);
    }
  }

  public getAnnotations(flipbookId: string, pageNumber?: number): VisualAnnotation[] {
    return this.annotations.filter((a) => {
      if (a.flipbookId !== flipbookId) return false;
      if (pageNumber !== undefined && a.pageNumber !== pageNumber) return false;
      return true;
    });
  }

  public addAnnotation(annotation: Omit<VisualAnnotation, 'id' | 'createdAt' | 'resolved'>): VisualAnnotation {
    const created: VisualAnnotation = {
      id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ...annotation,
      resolved: false,
      createdAt: Date.now(),
    };

    this.annotations.push(created);
    this.saveToStorage();
    return created;
  }

  public deleteAnnotation(annotationId: string) {
    this.annotations = this.annotations.filter((a) => a.id !== annotationId);
    this.saveToStorage();
  }

  public toggleResolve(annotationId: string) {
    const a = this.annotations.find((item) => item.id === annotationId);
    if (a) {
      a.resolved = !a.resolved;
      this.saveToStorage();
    }
  }

  // ================= Review & Approval Workflow =================

  public getReviewWorkflow(flipbookId: string): {
    status: ReviewWorkflowStatus;
    feedbacks: ReviewFeedback[];
  } {
    if (!this.reviews[flipbookId]) {
      this.reviews[flipbookId] = {
        status: 'IN_REVIEW',
        feedbacks: [
          {
            id: 'fb-initial',
            flipbookId,
            authorName: 'Alexandre Laurent (Directeur)',
            role: 'ADMIN',
            message: 'Catalogue soumis au client pour relecture et validation finale des tarifs.',
            requestedStatus: 'IN_REVIEW',
            createdAt: Date.now() - 48 * 3600000,
          },
        ],
      };
      this.saveToStorage();
    }
    return this.reviews[flipbookId];
  }

  public submitReviewFeedback(
    flipbookId: string,
    authorName: string,
    role: UserRole,
    message: string,
    newStatus: ReviewWorkflowStatus
  ): ReviewFeedback {
    const workflow = this.getReviewWorkflow(flipbookId);
    const feedback: ReviewFeedback = {
      id: `fb-${Date.now()}`,
      flipbookId,
      authorName,
      role,
      message,
      requestedStatus: newStatus,
      createdAt: Date.now(),
    };

    workflow.status = newStatus;
    workflow.feedbacks.unshift(feedback);
    this.saveToStorage();
    return feedback;
  }
}

export const annotationService = new AnnotationService();
