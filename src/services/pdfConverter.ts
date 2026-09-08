import * as pdfjsLib from 'pdfjs-dist';
import { BookPage, FlipBookDocument, TableOfContentsItem } from '../types';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export type ConversionJobStage =
  | 'VALIDATING'
  | 'PARSING'
  | 'RENDERING'
  | 'EXTRACTING_TEXT'
  | 'OPTIMIZING'
  | 'COMPLETED'
  | 'FAILED';

export interface ConversionProgress {
  stage: ConversionJobStage;
  percent: number; // 0 to 100
  currentPage: number;
  totalPages: number;
  statusText: string;
}

/**
 * PHASE 6: Strict PDF File Validation (Magic Bytes & Size Verification)
 */
export async function validatePdfFile(file: File, maxSizeBytes = 100 * 1024 * 1024): Promise<boolean> {
  if (file.size > maxSizeBytes) {
    throw new Error(`Le fichier dépasse la taille maximale autorisée (${Math.round(maxSizeBytes / (1024 * 1024))} Mo).`);
  }

  // Inspect first 5 bytes for PDF magic header: %PDF-
  const slice = file.slice(0, 5);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // %PDF- in ASCII: 0x25, 0x50, 0x44, 0x46, 0x2D
  const isPdf =
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d;

  if (!isPdf) {
    throw new Error("L'en-tête du fichier est invalide. Ce document n'est pas un fichier PDF authentique.");
  }

  return true;
}

/**
 * PHASE 6 & 7: Asynchronous Conversion Pipeline with Job Lifecycle & High-Fidelity Rendering
 */
export async function convertPdfToFlipBook(
  file: File,
  onProgress?: (progress: ConversionProgress) => void,
  abortSignal?: AbortSignal
): Promise<FlipBookDocument> {
  // 1. Stage: VALIDATING
  onProgress?.({
    stage: 'VALIDATING',
    percent: 5,
    currentPage: 0,
    totalPages: 0,
    statusText: 'Vérification de l’intégrité du fichier PDF et des signatures magiques...',
  });

  await validatePdfFile(file);

  if (abortSignal?.aborted) {
    throw new Error('Conversion annulée par l’utilisateur.');
  }

  // 2. Stage: PARSING
  onProgress?.({
    stage: 'PARSING',
    percent: 15,
    currentPage: 0,
    totalPages: 0,
    statusText: 'Décodage de la structure du document et des métadonnées...',
  });

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
    cMapPacked: true,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pages: BookPage[] = [];

  let detectedAspectRatio = 0.707; // Default A4 portrait
  const tocItems: TableOfContentsItem[] = [];

  // 3. Stage: RENDERING & EXTRACTING TEXT
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (abortSignal?.aborted) {
      throw new Error('Conversion annulée par l’utilisateur.');
    }

    const stagePercent = 20 + Math.round((pageNum / numPages) * 70);

    onProgress?.({
      stage: 'RENDERING',
      percent: stagePercent,
      currentPage: pageNum,
      totalPages: numPages,
      statusText: `Rendu haute fidélité de la page ${pageNum} sur ${numPages}...`,
    });

    const page = await pdf.getPage(pageNum);
    const unscaledViewport = page.getViewport({ scale: 1.0 });

    if (pageNum === 1 && unscaledViewport.width && unscaledViewport.height) {
      detectedAspectRatio = unscaledViewport.width / unscaledViewport.height;
    }

    // Render at crisp 1.8x - 2.0x scale for high-DPI displays
    const targetScale = Math.min(2.0, Math.max(1.2, 1400 / Math.max(unscaledViewport.width, unscaledViewport.height)));
    const viewport = page.getViewport({ scale: targetScale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: false });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (context) {
      // Clean white background
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvas: canvas,
        canvasContext: context,
        viewport: viewport,
      };
      await page.render(renderContext).promise;
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.90);

    // Extract text for full document search & speech synthesis
    let pageText = '';
    try {
      const textContent = await page.getTextContent();
      pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
    } catch {
      // Best effort text extraction
    }

    // Auto TOC candidate
    const firstLines = pageText.trim().split('\n')[0] || '';
    if (pageNum === 1 || (firstLines.length > 3 && firstLines.length < 50)) {
      tocItems.push({
        id: `toc-${pageNum}`,
        title: firstLines.slice(0, 40) || `Page ${pageNum}`,
        pageNumber: pageNum,
      });
    }

    pages.push({
      pageNumber: pageNum,
      title: `Page ${pageNum}`,
      type: 'image',
      imageUrl: dataUrl,
      text: pageText,
    });
  }

  // 4. Stage: OPTIMIZING (PDF outline / bookmarks extraction)
  onProgress?.({
    stage: 'OPTIMIZING',
    percent: 95,
    currentPage: numPages,
    totalPages: numPages,
    statusText: 'Génération de la table des matières et optimisation des pages...',
  });

  try {
    const outline = await pdf.getOutline();
    if (outline && outline.length > 0) {
      tocItems.length = 0;
      for (const item of outline) {
        if (typeof item.dest === 'string') {
          const dest = await pdf.getDestination(item.dest);
          if (dest && dest[0]) {
            const pageIndex = await pdf.getPageIndex(dest[0]);
            tocItems.push({
              id: `outline-${pageIndex + 1}`,
              title: item.title,
              pageNumber: pageIndex + 1,
            });
          }
        }
      }
    }
  } catch {
    // Optional outline extraction
  }

  onProgress?.({
    stage: 'COMPLETED',
    percent: 100,
    currentPage: numPages,
    totalPages: numPages,
    statusText: 'Conversion terminée avec succès !',
  });

  const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  return {
    id: `pdf-${Date.now()}`,
    title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
    sourceType: 'pdf',
    totalPages: pages.length,
    pages,
    tableOfContents: tocItems.length > 0 ? tocItems : undefined,
    aspectRatio: detectedAspectRatio,
    createdAt: Date.now(),
  };
}
