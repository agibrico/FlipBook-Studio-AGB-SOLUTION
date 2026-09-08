import JSZip from 'jszip';
import { FlipBookDocument } from '../types';
import { OfflineExportOptions } from '../types/saas';

class OfflineExportService {
  /**
   * Builds an autonomous, self-contained ZIP package that runs 100% offline in any browser.
   */
  public async generateOfflineZip(
    doc: FlipBookDocument,
    options: OfflineExportOptions = {
      includeVideos: false,
      includeSound: true,
      watermark: false,
      quality: 'HIGH',
    }
  ): Promise<Blob> {
    const zip = new JSZip();

    // 1. Standalone offline HTML reader template
    const standaloneHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(doc.title)} — Lecteur Hors-Ligne</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #09090b;
      color: #fafafa;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      user-select: none;
    }
    header {
      height: 48px;
      background: #18181b;
      border-bottom: 1px solid #27272a;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      font-size: 13px;
    }
    .badge {
      background: #27272a;
      color: #a1a1aa;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-family: monospace;
    }
    #viewer-stage {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      background: radial-gradient(circle at center, #18181b 0%, #09090b 100%);
      padding: 16px;
    }
    .book-container {
      position: relative;
      display: flex;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7);
      border-radius: 6px;
      overflow: hidden;
      max-width: 95vw;
      max-height: 85vh;
      background: #ffffff;
      transition: transform 0.2s ease;
    }
    .page-pane {
      width: 440px;
      height: 620px;
      position: relative;
      background: white;
      color: #18181b;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .page-pane img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .page-pane .html-content {
      padding: 32px;
      width: 100%;
      height: 100%;
      overflow-y: auto;
      font-size: 14px;
      line-height: 1.6;
    }
    .spine-crease {
      width: 12px;
      height: 100%;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
      pointer-events: none;
      background: linear-gradient(to right, rgba(0,0,0,0.15), rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15));
    }
    footer {
      height: 56px;
      background: #18181b;
      border-top: 1px solid #27272a;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }
    button {
      background: #27272a;
      border: 1px solid #3f3f46;
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.15s ease;
    }
    button:hover:not(:disabled) {
      background: #4f46e5;
      border-color: #6366f1;
    }
    button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    @media (max-width: 768px) {
      .page-pane.left-pane { display: none; }
      .spine-crease { display: none; }
      .page-pane { width: 90vw; height: 75vh; }
    }
  </style>
</head>
<body>
  <header>
    <div style="font-weight: 600;">${escapeHtml(doc.title)}</div>
    <div class="badge">Version Hors-Ligne Autonome</div>
  </header>

  <div id="viewer-stage">
    <div class="book-container">
      <div id="pane-left" class="page-pane left-pane"></div>
      <div class="spine-crease"></div>
      <div id="pane-right" class="page-pane right-pane"></div>
    </div>
  </div>

  <footer>
    <button id="btn-prev" onclick="prevPage()">◀ Précédente</button>
    <span id="page-counter" style="font-family: monospace; font-size: 13px; color: #a1a1aa;">Page 1 / ${doc.totalPages}</span>
    <button id="btn-next" onclick="nextPage()">Suivante ▶</button>
  </footer>

  <script>
    const pages = ${JSON.stringify(
      doc.pages.map((p) => ({
        pageNumber: p.pageNumber,
        title: p.title,
        type: p.type,
        imageUrl: p.imageUrl ? `pages/page_${p.pageNumber}.jpg` : undefined,
        htmlContent: p.htmlContent,
      }))
    )};
    const totalPages = ${doc.totalPages};
    let currentSpread = 1; // Left page number (odd/even)

    function renderPages() {
      const isMobile = window.innerWidth < 768;
      const leftPane = document.getElementById('pane-left');
      const rightPane = document.getElementById('pane-right');
      const counter = document.getElementById('page-counter');
      const btnPrev = document.getElementById('btn-prev');
      const btnNext = document.getElementById('btn-next');

      if (isMobile) {
        const page = pages.find(p => p.pageNumber === currentSpread) || pages[0];
        rightPane.innerHTML = renderPageHtml(page);
        counter.textContent = 'Page ' + currentSpread + ' / ' + totalPages;
        btnPrev.disabled = currentSpread <= 1;
        btnNext.disabled = currentSpread >= totalPages;
      } else {
        const leftPageNum = currentSpread % 2 === 0 ? currentSpread - 1 : currentSpread;
        const rightPageNum = leftPageNum + 1;

        const leftPage = pages.find(p => p.pageNumber === leftPageNum);
        const rightPage = pages.find(p => p.pageNumber === rightPageNum);

        leftPane.innerHTML = leftPage ? renderPageHtml(leftPage) : '<div style="color:#a1a1aa; font-size:12px;">Couverture</div>';
        rightPane.innerHTML = rightPage ? renderPageHtml(rightPage) : '<div style="color:#a1a1aa; font-size:12px;">Fin du document</div>';

        counter.textContent = 'Pages ' + (leftPage ? leftPageNum : '') + (leftPage && rightPage ? ' - ' : '') + (rightPage ? rightPageNum : '') + ' / ' + totalPages;
        btnPrev.disabled = leftPageNum <= 1;
        btnNext.disabled = rightPageNum >= totalPages;
      }
    }

    function renderPageHtml(page) {
      if (!page) return '';
      if (page.imageUrl) {
        return '<img src="' + page.imageUrl + '" alt="Page ' + page.pageNumber + '">';
      }
      return '<div class="html-content">' + (page.htmlContent || '<p>Page ' + page.pageNumber + '</p>') + '</div>';
    }

    function nextPage() {
      const step = window.innerWidth < 768 ? 1 : 2;
      if (currentSpread + step <= totalPages) {
        currentSpread += step;
        renderPages();
      }
    }

    function prevPage() {
      const step = window.innerWidth < 768 ? 1 : 2;
      if (currentSpread - step >= 1) {
        currentSpread -= step;
        renderPages();
      }
    }

    window.addEventListener('resize', renderPages);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
    });

    renderPages();
  </script>
</body>
</html>`;

    zip.file('index.html', standaloneHtml);

    // 2. Data manifest
    zip.file(
      'metadata.json',
      JSON.stringify(
        {
          id: doc.id,
          title: doc.title,
          totalPages: doc.totalPages,
          exportedAt: new Date().toISOString(),
          format: 'FLIPBOOK_OFFLINE_BUNDLE_V1',
        },
        null,
        2
      )
    );

    // 3. Web App Manifest for PWA installation
    zip.file(
      'manifest.json',
      JSON.stringify(
        {
          name: doc.title,
          short_name: doc.title.slice(0, 12),
          start_url: './index.html',
          display: 'standalone',
          background_color: '#09090b',
          theme_color: '#4f46e5',
        },
        null,
        2
      )
    );

    // 4. Readme instructions
    zip.file(
      'README.txt',
      `FLIPBOOK STUDIO — PACKAGE HORS-LIGNE AUTONOME
Document : ${doc.title}
Pages : ${doc.totalPages}
Exporté le : ${new Date().toLocaleString('fr-FR')}

MODE D'EMPLOI :
1. Décompressez l'archive ZIP sur votre ordinateur (Mac, Windows ou Linux).
2. Double-cliquez sur "index.html".
3. Le flipbook interactif s'ouvre directement dans votre navigateur habituel (Chrome, Safari, Edge, Firefox), sans nécessiter aucune connexion internet.
`
    );

    // 5. Build and return zip Blob
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    return zipBlob;
  }

  /**
   * Helper to download the generated zip directly to the client
   */
  public async downloadOfflineZip(doc: FlipBookDocument, options?: OfflineExportOptions) {
    const blob = await this.generateOfflineZip(doc, options);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = doc.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `${safeTitle}_offline_package.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const offlineExportService = new OfflineExportService();
