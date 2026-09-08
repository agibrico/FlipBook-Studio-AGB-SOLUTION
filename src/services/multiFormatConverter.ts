import mammoth from 'mammoth';
import JSZip from 'jszip';
import { BookPage, FlipBookDocument, TableOfContentsItem } from '../types';

/**
 * PHASE 9: MULTI-FORMAT DOCUMENT CONVERSION PIPELINE
 * Word (.docx), PowerPoint (.pptx), Excel/CSV (.xlsx, .csv), Markdown/Text (.md, .txt), and Image Sets.
 */

// ============================================================================
// 1. WORD (.DOCX) CONVERTER
// ============================================================================
export async function convertDocxToFlipBook(file: File): Promise<FlipBookDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const rawHtml = result.value;

  const docTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const formattedTitle = docTitle.charAt(0).toUpperCase() + docTitle.slice(1);

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${rawHtml}</div>`, 'text/html');
  const container = doc.body.firstElementChild || doc.body;

  const childNodes = Array.from(container.children);
  const pages: BookPage[] = [];
  const tocItems: TableOfContentsItem[] = [];

  // Cover Page
  pages.push({
    pageNumber: 1,
    title: 'Couverture',
    type: 'html',
    text: formattedTitle,
    htmlContent: `
      <div class="h-full flex flex-col justify-between p-8 sm:p-12 text-zinc-900 bg-gradient-to-b from-amber-50/60 via-white to-amber-50/40">
        <div class="pt-8">
          <span class="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-800 bg-amber-100/70 rounded-full mb-6">
            Document interactif Word
          </span>
          <h1 class="text-3xl sm:text-4xl font-serif font-bold text-zinc-900 tracking-tight leading-tight">
            ${formattedTitle}
          </h1>
          <div class="w-16 h-1 bg-amber-600 rounded-full mt-6"></div>
        </div>

        <div class="py-12 flex flex-col items-center justify-center text-center opacity-80">
          <div class="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 shadow-inner mb-4">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <p class="text-sm text-zinc-500 font-medium">Édition FlipBook Studio</p>
        </div>

        <div class="border-t border-zinc-200/80 pt-6 flex items-center justify-between text-xs text-zinc-500 font-mono">
          <span>Source: ${file.name}</span>
          <span>${new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}</span>
        </div>
      </div>
    `,
  });

  tocItems.push({
    id: 'toc-cover',
    title: 'Couverture',
    pageNumber: 1,
  });

  let currentPageBlocks: string[] = [];
  let currentWordCount = 0;
  let currentPageNum = 2;
  const WORDS_PER_PAGE = 220;

  const flushPage = (titleHint?: string) => {
    if (currentPageBlocks.length === 0) return;
    const pageHtml = currentPageBlocks.join('\n');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = pageHtml;
    const textOnly = tempDiv.textContent || '';

    pages.push({
      pageNumber: currentPageNum,
      title: titleHint || `Page ${currentPageNum}`,
      type: 'html',
      text: textOnly,
      htmlContent: `
        <div class="h-full flex flex-col justify-between p-8 sm:p-10 text-zinc-800 bg-white">
          <div class="flex items-center justify-between pb-4 border-b border-zinc-100 text-xs text-zinc-400 font-mono">
            <span class="truncate max-w-[200px]">${formattedTitle}</span>
            <span>Page ${currentPageNum}</span>
          </div>

          <div class="flex-1 py-6 overflow-y-auto font-serif prose prose-zinc prose-sm max-w-none leading-relaxed text-zinc-800 space-y-4">
            ${pageHtml}
          </div>

          <div class="pt-3 border-t border-zinc-100 flex items-center justify-center text-xs text-zinc-400 font-mono">
            — ${currentPageNum} —
          </div>
        </div>
      `,
    });

    currentPageNum++;
    currentPageBlocks = [];
    currentWordCount = 0;
  };

  for (const node of childNodes) {
    const tagName = node.tagName.toLowerCase();
    const isHeading = tagName === 'h1' || tagName === 'h2';
    const textContent = node.textContent || '';
    const wordCount = textContent.split(/\s+/).filter(Boolean).length;

    if (isHeading && currentPageBlocks.length > 0) {
      flushPage();
    }

    if (isHeading) {
      tocItems.push({
        id: `toc-${currentPageNum}`,
        title: textContent.slice(0, 40) || `Section ${tocItems.length + 1}`,
        pageNumber: currentPageNum,
      });
    }

    if (tagName === 'h1') {
      currentPageBlocks.push(`<h2 class="text-2xl font-bold font-sans text-zinc-900 mt-2 mb-4 tracking-tight">${node.innerHTML}</h2>`);
    } else if (tagName === 'h2') {
      currentPageBlocks.push(`<h3 class="text-xl font-bold font-sans text-zinc-800 mt-4 mb-2">${node.innerHTML}</h3>`);
    } else if (tagName === 'h3') {
      currentPageBlocks.push(`<h4 class="text-lg font-semibold font-sans text-zinc-700 mt-3 mb-1">${node.innerHTML}</h4>`);
    } else if (tagName === 'table') {
      currentPageBlocks.push(`<div class="overflow-x-auto my-3"><table class="min-w-full text-xs border border-zinc-200">${node.innerHTML}</table></div>`);
    } else if (tagName === 'img') {
      currentPageBlocks.push(`<div class="my-4 text-center"><img src="${node.getAttribute('src')}" class="max-h-56 mx-auto rounded shadow-sm" alt="Illustration" /></div>`);
    } else {
      currentPageBlocks.push(`<p class="leading-relaxed text-[15px] text-zinc-700">${node.innerHTML}</p>`);
    }

    currentWordCount += Math.max(wordCount, 15);

    if (currentWordCount >= WORDS_PER_PAGE) {
      flushPage();
    }
  }

  flushPage();

  if (pages.length === 1) {
    pages.push({
      pageNumber: 2,
      title: 'Contenu',
      type: 'html',
      text: 'Document sans texte détectable.',
      htmlContent: `
        <div class="h-full flex items-center justify-center p-8 bg-white text-zinc-500">
          <p>Document sans contenu textuel détecté.</p>
        </div>
      `,
    });
  }

  return {
    id: `book-${Date.now()}`,
    title: formattedTitle,
    sourceType: 'docx',
    totalPages: pages.length,
    pages,
    tableOfContents: tocItems,
    aspectRatio: 0.707, // A4 Portrait
    createdAt: Date.now(),
  };
}

// ============================================================================
// 2. POWERPOINT (.PPTX) CONVERTER (OpenXML XML Extraction)
// ============================================================================
export async function convertPptxToFlipBook(file: File): Promise<FlipBookDocument> {
  const zip = new JSZip();
  const arrayBuffer = await file.arrayBuffer();
  const loadedZip = await zip.loadAsync(arrayBuffer);

  const docTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const formattedTitle = docTitle.charAt(0).toUpperCase() + docTitle.slice(1);

  // Find all slide XML files in ppt/slides/
  const slideEntries = Object.keys(loadedZip.files).filter((path) =>
    path.startsWith('ppt/slides/slide') && path.endsWith('.xml')
  );

  // Sort slides numerically: slide1.xml, slide2.xml, ...
  slideEntries.sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/[^0-9]/g, ''), 10) || 0;
    return numA - numB;
  });

  const pages: BookPage[] = [];
  const tocItems: TableOfContentsItem[] = [];

  const parser = new DOMParser();

  // Slide Color Palettes for sleek presentation slide styling
  const themes = [
    { bg: 'from-slate-950 via-indigo-950 to-slate-900', text: 'text-white', accent: 'text-indigo-400', badge: 'bg-indigo-500/20 text-indigo-300' },
    { bg: 'from-zinc-900 via-zinc-800 to-zinc-950', text: 'text-white', accent: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
    { bg: 'from-cyan-950 via-slate-900 to-slate-950', text: 'text-white', accent: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300' },
    { bg: 'from-violet-950 via-purple-950 to-slate-950', text: 'text-white', accent: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300' },
  ];

  let slideIndex = 1;

  for (const slidePath of slideEntries) {
    const slideXmlStr = await loadedZip.files[slidePath].async('string');
    const xmlDoc = parser.parseFromString(slideXmlStr, 'application/xml');

    // Extract all text elements (<a:t>)
    const textNodes = Array.from(xmlDoc.getElementsByTagName('a:t'));
    const textList: string[] = textNodes.map((n) => (n.textContent || '').trim()).filter(Boolean);

    let slideTitle = textList[0] || `Diapositive ${slideIndex}`;
    let bulletPoints = textList.slice(1);

    // If slide title is too long, truncate it
    if (slideTitle.length > 60) {
      bulletPoints = [slideTitle, ...bulletPoints];
      slideTitle = `Diapositive ${slideIndex}`;
    }

    const theme = themes[(slideIndex - 1) % themes.length];
    const isCover = slideIndex === 1;

    tocItems.push({
      id: `slide-toc-${slideIndex}`,
      title: slideTitle.slice(0, 35),
      pageNumber: slideIndex,
    });

    if (isCover) {
      pages.push({
        pageNumber: slideIndex,
        title: slideTitle,
        type: 'html',
        text: `${slideTitle}. ${bulletPoints.join(' ')}`,
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-12 bg-gradient-to-br ${theme.bg} ${theme.text} select-none relative overflow-hidden">
            <div class="flex items-center justify-between border-b border-white/10 pb-4">
              <span class="text-xs font-mono tracking-widest uppercase ${theme.accent}">Présentation PowerPoint</span>
              <span class="text-xs font-mono text-zinc-400">${slideEntries.length} Diapositives</span>
            </div>

            <div class="my-auto py-8">
              <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${theme.badge} border border-indigo-400/30 mb-6">
                Diapositive de Titre
              </span>
              <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                ${slideTitle}
              </h1>
              ${bulletPoints.length > 0 ? `<p class="text-lg text-zinc-300 max-w-lg leading-relaxed">${bulletPoints.slice(0, 2).join(' — ')}</p>` : ''}
            </div>

            <div class="pt-6 border-t border-white/10 flex justify-between items-center text-xs text-zinc-400 font-mono">
              <span>Source: ${file.name}</span>
              <span>Diapositive ${slideIndex} / ${slideEntries.length}</span>
            </div>
          </div>
        `,
      });
    } else {
      pages.push({
        pageNumber: slideIndex,
        title: slideTitle,
        type: 'html',
        text: `${slideTitle}. ${bulletPoints.join(' ')}`,
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-12 bg-gradient-to-br ${theme.bg} ${theme.text} select-none">
            <div class="flex items-center justify-between border-b border-white/10 pb-4">
              <span class="text-xs font-mono tracking-wider text-zinc-400 truncate max-w-[200px]">${formattedTitle}</span>
              <span class="text-xs font-mono ${theme.accent}">Slide ${slideIndex}</span>
            </div>

            <div class="flex-1 py-6 flex flex-col justify-center">
              <h2 class="text-2xl sm:text-3xl font-bold tracking-tight mb-6 ${theme.accent}">
                ${slideTitle}
              </h2>

              <div class="space-y-4 max-h-[360px] overflow-y-auto pr-2">
                ${bulletPoints.length > 0
                  ? bulletPoints
                      .map(
                        (bp) => `
                    <div class="flex items-start gap-3">
                      <span class="w-2 h-2 rounded-full bg-indigo-400 mt-2 flex-shrink-0"></span>
                      <p class="text-base text-zinc-200 leading-relaxed">${bp}</p>
                    </div>`
                      )
                      .join('')
                  : '<p class="text-zinc-400 italic">Contenu visuel ou graphique</p>'}
              </div>
            </div>

            <div class="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-zinc-500 font-mono">
              <span>Slide ${slideIndex} / ${slideEntries.length}</span>
              <span>PowerPoint Interactive Edition</span>
            </div>
          </div>
        `,
      });
    }

    slideIndex++;
  }

  // Fallback if no slides parsed
  if (pages.length === 0) {
    pages.push({
      pageNumber: 1,
      title: formattedTitle,
      type: 'html',
      text: formattedTitle,
      htmlContent: `
        <div class="h-full flex items-center justify-center p-8 bg-zinc-900 text-white">
          <p>Aucune diapositive textuelle trouvée dans ce fichier PowerPoint.</p>
        </div>
      `,
    });
  }

  return {
    id: `pptx-${Date.now()}`,
    title: formattedTitle,
    sourceType: 'sample',
    totalPages: pages.length,
    pages,
    tableOfContents: tocItems,
    aspectRatio: 1.333, // 4:3 or landscape slide ratio
    createdAt: Date.now(),
  };
}

// ============================================================================
// 3. EXCEL / CSV (.XLSX, .CSV) CONVERTER
// ============================================================================
export async function convertCsvOrExcelToFlipBook(file: File): Promise<FlipBookDocument> {
  const text = await file.text();
  const docTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const formattedTitle = docTitle.charAt(0).toUpperCase() + docTitle.slice(1);

  // Parse lines
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    throw new Error('Le fichier tableur est vide.');
  }

  // Simple CSV delimiter detection
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ',';
  const headers = firstLine.split(delimiter).map((h) => h.replace(/^"|"$/g, '').trim());

  const rows = lines.slice(1).map((l) =>
    l.split(delimiter).map((cell) => cell.replace(/^"|"$/g, '').trim())
  );

  const ROWS_PER_PAGE = 14;
  const totalDataPages = Math.ceil(rows.length / ROWS_PER_PAGE) || 1;
  const pages: BookPage[] = [];
  const tocItems: TableOfContentsItem[] = [];

  // Cover Page
  pages.push({
    pageNumber: 1,
    title: 'Rapport Tableur',
    type: 'html',
    text: `${formattedTitle} — Rapport de données`,
    htmlContent: `
      <div class="h-full flex flex-col justify-between p-8 sm:p-12 bg-gradient-to-br from-emerald-950 via-slate-900 to-zinc-950 text-white select-none">
        <div class="flex items-center justify-between border-b border-white/10 pb-4">
          <span class="text-xs font-mono uppercase tracking-widest text-emerald-400">Rapport Tableur & Données</span>
          <span class="text-xs font-mono text-zinc-400">${rows.length} enregistrements</span>
        </div>

        <div class="my-auto py-8">
          <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-6">
            Feuille de calcul interactive
          </span>
          <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            ${formattedTitle}
          </h1>
          <p class="text-base text-zinc-300 max-w-md leading-relaxed">
            Édition feuilletable avec ${headers.length} colonnes et ${rows.length} lignes de données structurées.
          </p>
        </div>

        <div class="pt-6 border-t border-white/10 flex justify-between items-center text-xs text-zinc-400 font-mono">
          <span>Source: ${file.name}</span>
          <span>${totalDataPages + 1} pages</span>
        </div>
      </div>
    `,
  });

  tocItems.push({ id: 'toc-1', title: 'Couverture du Rapport', pageNumber: 1 });

  // Data Pages
  for (let p = 0; p < totalDataPages; p++) {
    const pageNum = p + 2;
    const pageRows = rows.slice(p * ROWS_PER_PAGE, (p + 1) * ROWS_PER_PAGE);

    tocItems.push({
      id: `toc-${pageNum}`,
      title: `Données (${p * ROWS_PER_PAGE + 1} - ${Math.min((p + 1) * ROWS_PER_PAGE, rows.length)})`,
      pageNumber: pageNum,
    });

    pages.push({
      pageNumber: pageNum,
      title: `Page ${pageNum}`,
      type: 'html',
      text: pageRows.map((r) => r.join(' ')).join('\n'),
      htmlContent: `
        <div class="h-full flex flex-col justify-between p-6 sm:p-8 bg-white text-zinc-900">
          <div class="flex items-center justify-between pb-3 border-b border-zinc-200 text-xs text-zinc-500 font-mono">
            <span class="truncate max-w-[220px] font-semibold">${formattedTitle}</span>
            <span>Lignes ${p * ROWS_PER_PAGE + 1} à ${Math.min((p + 1) * ROWS_PER_PAGE, rows.length)}</span>
          </div>

          <div class="flex-1 py-4 overflow-x-auto">
            <table class="w-full text-xs text-left border-collapse border border-zinc-200">
              <thead>
                <tr class="bg-zinc-100 text-zinc-700 font-bold border-b border-zinc-200">
                  ${headers.map((h) => `<th class="p-2 border-r border-zinc-200 truncate max-w-[120px]">${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${pageRows
                  .map(
                    (row, rIdx) => `
                  <tr class="${rIdx % 2 === 0 ? 'bg-white' : 'bg-zinc-50'} hover:bg-emerald-50/50 border-b border-zinc-100 transition-colors">
                    ${row.map((val) => `<td class="p-2 border-r border-zinc-100 font-mono text-zinc-700 truncate max-w-[120px]">${val || '—'}</td>`).join('')}
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>

          <div class="pt-3 border-t border-zinc-200 flex justify-between items-center text-xs text-zinc-400 font-mono">
            <span>Page ${pageNum} sur ${totalDataPages + 1}</span>
            <span>Édition Tableur</span>
          </div>
        </div>
      `,
    });
  }

  return {
    id: `spreadsheet-${Date.now()}`,
    title: formattedTitle,
    sourceType: 'sample',
    totalPages: pages.length,
    pages,
    tableOfContents: tocItems,
    aspectRatio: 0.707,
    createdAt: Date.now(),
  };
}

// ============================================================================
// 4. MARKDOWN & TEXT (.MD, .TXT) CONVERTER
// ============================================================================
export async function convertTextToFlipBook(file: File): Promise<FlipBookDocument> {
  const text = await file.text();
  const docTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const formattedTitle = docTitle.charAt(0).toUpperCase() + docTitle.slice(1);

  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const pages: BookPage[] = [];
  const tocItems: TableOfContentsItem[] = [];

  // Cover
  pages.push({
    pageNumber: 1,
    title: 'Couverture',
    type: 'html',
    text: formattedTitle,
    htmlContent: `
      <div class="h-full flex flex-col justify-between p-8 sm:p-12 text-zinc-900 bg-gradient-to-b from-stone-50 via-white to-stone-100">
        <div>
          <span class="inline-block px-3 py-1 text-xs font-mono uppercase text-zinc-600 bg-zinc-200/80 rounded-md mb-6">
            Livre Virtuel
          </span>
          <h1 class="text-3xl sm:text-4xl font-serif font-bold text-zinc-900 tracking-tight leading-snug">
            ${formattedTitle}
          </h1>
          <div class="w-12 h-1 bg-zinc-800 rounded mt-4"></div>
        </div>
        <div class="border-t border-zinc-200 pt-6 flex justify-between text-xs text-zinc-400 font-mono">
          <span>Source: ${file.name}</span>
          <span>${paragraphs.length} paragraphes</span>
        </div>
      </div>
    `,
  });

  tocItems.push({ id: 'toc-1', title: 'Couverture', pageNumber: 1 });

  let curBlocks: string[] = [];
  let curWords = 0;
  let pageNum = 2;

  const flush = () => {
    if (curBlocks.length === 0) return;
    const body = curBlocks.join('\n');
    pages.push({
      pageNumber: pageNum,
      title: `Page ${pageNum}`,
      type: 'html',
      text: curBlocks.join(' '),
      htmlContent: `
        <div class="h-full flex flex-col justify-between p-8 sm:p-10 bg-white text-zinc-800 font-serif">
          <div class="flex items-center justify-between pb-3 border-b border-zinc-100 text-xs text-zinc-400 font-mono">
            <span class="truncate max-w-[200px]">${formattedTitle}</span>
            <span>Page ${pageNum}</span>
          </div>

          <div class="flex-1 py-6 overflow-y-auto space-y-4 text-[15px] leading-relaxed">
            ${body}
          </div>

          <div class="pt-3 border-t border-zinc-100 text-center text-xs text-zinc-400 font-mono">
            — ${pageNum} —
          </div>
        </div>
      `,
    });
    pageNum++;
    curBlocks = [];
    curWords = 0;
  };

  for (const para of paragraphs) {
    const isHeading = para.startsWith('#');
    const wordCount = para.split(/\s+/).length;

    if (isHeading) {
      if (curBlocks.length > 0) flush();
      const cleanHeading = para.replace(/^#+\s*/, '');
      tocItems.push({
        id: `toc-${pageNum}`,
        title: cleanHeading.slice(0, 35),
        pageNumber: pageNum,
      });
      curBlocks.push(`<h3 class="text-xl font-bold font-sans text-zinc-900 mt-4 mb-2">${cleanHeading}</h3>`);
    } else {
      curBlocks.push(`<p class="leading-relaxed text-zinc-700">${para}</p>`);
    }

    curWords += wordCount;
    if (curWords >= 220) {
      flush();
    }
  }

  flush();

  return {
    id: `book-${Date.now()}`,
    title: formattedTitle,
    sourceType: 'txt',
    totalPages: pages.length,
    pages,
    tableOfContents: tocItems,
    aspectRatio: 0.707,
    createdAt: Date.now(),
  };
}

// ============================================================================
// 5. IMAGE ALBUM CONVERTER
// ============================================================================
export async function convertImagesToFlipBook(files: File[]): Promise<FlipBookDocument> {
  const pages: BookPage[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    pages.push({
      pageNumber: i + 1,
      title: file.name.replace(/\.[^/.]+$/, ''),
      type: 'image',
      imageUrl: dataUrl,
      text: `Page ${i + 1} - ${file.name}`,
    });
  }

  return {
    id: `album-${Date.now()}`,
    title: 'Album Photos & Portfolio',
    sourceType: 'images',
    totalPages: pages.length,
    pages,
    aspectRatio: 0.707,
    createdAt: Date.now(),
  };
}
