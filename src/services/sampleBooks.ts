import { FlipBookDocument } from '../types';

export const SAMPLE_BOOKS: FlipBookDocument[] = [
  {
    id: 'sample-vibe-mag',
    title: 'VIBE MAG — Le Futur du Code & Design',
    author: 'Studio Numérique 2026',
    sourceType: 'sample',
    totalPages: 8,
    aspectRatio: 0.707,
    createdAt: Date.now(),
    tableOfContents: [
      { id: 'toc-1', title: 'Couverture & Édito', pageNumber: 1 },
      { id: 'toc-2', title: 'Sommaire & Manifeste', pageNumber: 2 },
      { id: 'toc-3', title: "L'Ère du Vibe Coding", pageNumber: 3 },
      { id: 'toc-4', title: 'Design Tactile & Gestes', pageNumber: 4 },
      { id: 'toc-5', title: 'Portfolio d’Interfaces Mobiles', pageNumber: 5 },
      { id: 'toc-6', title: 'Typographie & Micro-Rythmes', pageNumber: 6 },
      { id: 'toc-7', title: 'Entrevue: Créer sans Friction', pageNumber: 7 },
      { id: 'toc-8', title: 'Dernière de Couverture', pageNumber: 8 },
    ],
    pages: [
      // Page 1: Cover
      {
        pageNumber: 1,
        title: 'Couverture',
        type: 'html',
        text: 'VIBE MAG Numéro 01 Le Futur du Code et du Design Édition Spéciale 2026',
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-12 bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 text-white select-none relative overflow-hidden">
            <div class="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>

            <div class="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
              <span class="text-xs font-mono tracking-widest uppercase text-indigo-300">Numéro 01 • Trimestriel</span>
              <span class="text-xs font-mono tracking-wider uppercase text-zinc-400">Édition Tactile 2026</span>
            </div>

            <div class="my-auto py-8 relative z-10">
              <span class="inline-block px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 mb-6">
                Édition Interactive
              </span>
              <h1 class="text-5xl sm:text-6xl font-black tracking-tighter leading-none mb-4 font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-indigo-200">
                VIBE<br/><span class="text-indigo-400">MAG</span>
              </h1>
              <p class="text-lg sm:text-xl font-light text-zinc-300 max-w-xs leading-snug">
                L'avènement du code intuitif, des flipbooks vivants et du design mobile-first.
              </p>
              <div class="mt-8 flex items-center gap-3 text-xs text-zinc-400 font-mono">
                <span class="w-8 h-px bg-indigo-400"></span>
                <span>FEUILLETEZ POUR DÉCOUVRIR</span>
              </div>
            </div>

            <div class="pt-6 border-t border-white/10 flex justify-between items-end relative z-10 text-xs text-zinc-400 font-mono">
              <div>
                <p class="text-zinc-500">DIRECTION ARTISTIQUE</p>
                <p class="text-white font-medium">Gilles Brice & Studio Vibe</p>
              </div>
              <div class="text-right">
                <p class="text-indigo-400 font-bold tracking-wider">FLIPBOOK 3D</p>
                <p class="text-zinc-500">Touch & Flip Ready</p>
              </div>
            </div>
          </div>
        `,
      },
      // Page 2: Manifeste
      {
        pageNumber: 2,
        title: 'Sommaire & Manifeste',
        type: 'html',
        text: 'Manifeste du Vibe Coder. Le code ne se lit plus seulement, il se ressent.',
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-10 bg-zinc-50 text-zinc-900">
            <div class="flex items-center justify-between border-b border-zinc-200 pb-3 text-xs text-zinc-400 font-mono">
              <span>ÉDITO & SOMMAIRE</span>
              <span>PAGE 02</span>
            </div>

            <div class="flex-1 py-6 space-y-6">
              <div>
                <span class="text-xs uppercase tracking-widest text-indigo-600 font-bold">Édito</span>
                <h2 class="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 mt-1">
                  Le document qui respire
                </h2>
              </div>

              <p class="text-zinc-700 leading-relaxed font-serif text-[15px]">
                Le PDF traditionnel est rigide, statique et pénible sur mobile. Les lecteurs zooment à deux doigts, se perdent dans des colonnes minuscules et subissent une expérience morne.
              </p>

              <blockquote class="pl-4 border-l-2 border-indigo-600 italic text-zinc-800 font-serif text-[15px] bg-indigo-50/50 py-2 pr-3 rounded-r">
                « Transformer un document en objet tactile, c'est lui redonner la noblesse du papier tout en lui offrant la fluidité du numérique. »
              </blockquote>

              <div class="pt-2">
                <h3 class="text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase mb-3">Au sommaire de ce numéro :</h3>
                <ul class="space-y-2 text-sm font-sans text-zinc-700">
                  <li class="flex items-baseline justify-between border-b border-dashed border-zinc-200 pb-1">
                    <span>03. L'avènement du Vibe Coding</span>
                    <span class="font-mono text-zinc-400 text-xs">P. 03</span>
                  </li>
                  <li class="flex items-baseline justify-between border-b border-dashed border-zinc-200 pb-1">
                    <span>04. Ergonomie tactile & 3D Web</span>
                    <span class="font-mono text-zinc-400 text-xs">P. 04</span>
                  </li>
                  <li class="flex items-baseline justify-between border-b border-dashed border-zinc-200 pb-1">
                    <span>05. Galeries & Rendu Haute Définition</span>
                    <span class="font-mono text-zinc-400 text-xs">P. 05</span>
                  </li>
                  <li class="flex items-baseline justify-between border-b border-dashed border-zinc-200 pb-1">
                    <span>06. Anatomie d'un FlipBook</span>
                    <span class="font-mono text-zinc-400 text-xs">P. 06</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="border-t border-zinc-200 pt-3 flex justify-between text-xs text-zinc-400 font-mono">
              <span>VIBE MAG</span>
              <span>— 02 —</span>
            </div>
          </div>
        `,
      },
      // Page 3: L'Ère du Vibe Coding
      {
        pageNumber: 3,
        title: "L'Ère du Vibe Coding",
        type: 'html',
        text: 'Le Vibe Coding transforme la manière dont les créateurs conçoivent le web.',
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-10 bg-white text-zinc-900">
            <div class="flex items-center justify-between border-b border-zinc-100 pb-3 text-xs text-zinc-400 font-mono">
              <span>DOSSIER TECH</span>
              <span>PAGE 03</span>
            </div>

            <div class="flex-1 py-6 space-y-4">
              <span class="text-xs uppercase tracking-widest text-indigo-600 font-bold">Focus</span>
              <h2 class="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight leading-tight">
                L'Ère du Vibe Coding
              </h2>

              <p class="text-zinc-700 leading-relaxed text-[15px] font-serif first-letter:text-4xl first-letter:font-bold first-letter:text-indigo-600 first-letter:mr-2 first-letter:float-left">
                Coder en harmonie avec le ressenti utilisateur. Ce n'est plus seulement une question de syntaxe ou de performances brutes, mais d'orchestration sensorielle.
              </p>

              <div class="grid grid-cols-2 gap-3 my-4">
                <div class="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/70">
                  <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mb-2">01</div>
                  <h4 class="font-bold text-xs uppercase tracking-wider text-zinc-800">Sensibilité Haptique</h4>
                  <p class="text-xs text-zinc-500 mt-1 leading-snug">Chaque page tournée produit un bruissement organique au casque ou haut-parleur.</p>
                </div>
                <div class="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/70">
                  <div class="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm mb-2">02</div>
                  <h4 class="font-bold text-xs uppercase tracking-wider text-zinc-800">Perspective 3D</h4>
                  <p class="text-xs text-zinc-500 mt-1 leading-snug">La lumière rasante et les ombres de tranche restituent le relief réel du livre.</p>
                </div>
              </div>

              <p class="text-zinc-600 text-sm leading-relaxed font-serif">
                Sur smartphone, le geste naturel du pouce prend le relais : effleurer le coin supérieur droit pour tourner, glisser horizontalement ou appuyer deux fois pour zoomer sans décalage.
              </p>
            </div>

            <div class="border-t border-zinc-100 pt-3 flex justify-between text-xs text-zinc-400 font-mono">
              <span>VIBE MAG</span>
              <span>— 03 —</span>
            </div>
          </div>
        `,
      },
      // Page 4: Design Tactile & Mobile
      {
        pageNumber: 4,
        title: 'Design Tactile & Gestes',
        type: 'html',
        text: 'Pourquoi le mobile exige une refonte totale de la lecture de documents.',
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-10 bg-indigo-950 text-white">
            <div class="flex items-center justify-between border-b border-indigo-800 pb-3 text-xs text-indigo-300 font-mono">
              <span>EXPÉRIENCE MOBILE</span>
              <span>PAGE 04</span>
            </div>

            <div class="flex-1 py-6 space-y-5">
              <span class="text-xs uppercase tracking-widest text-indigo-400 font-bold">Ergonomie Thumb-Zone</span>
              <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Penser pour le Pouce
              </h2>

              <p class="text-indigo-150 leading-relaxed text-[15px] font-sans">
                82% des consultations de documents interactifs se font désormais sur mobile à une seule main. Les commandes doivent être situées dans la zone basse de l'écran.
              </p>

              <div class="bg-indigo-900/60 p-4 rounded-xl border border-indigo-700/50 space-y-3">
                <div class="flex items-center gap-3">
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span class="text-xs font-mono text-zinc-200">Mode Simple Page Dynamique</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span class="text-xs font-mono text-zinc-200">Pinch-to-Zoom jusqu'à 250%</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
                  <span class="text-xs font-mono text-zinc-200">Bande de vignettes d'accès rapide</span>
                </div>
              </div>

              <p class="text-xs text-indigo-300/80 leading-relaxed font-mono">
                En tournant l'appareil en paysage, le visualiseur s'adapte automatiquement en double-page comme un véritable magazine ouvert sur une table.
              </p>
            </div>

            <div class="border-t border-indigo-800 pt-3 flex justify-between text-xs text-indigo-400 font-mono">
              <span>VIBE MAG</span>
              <span>— 04 —</span>
            </div>
          </div>
        `,
      },
      // Page 5: Portfolio & Visuels
      {
        pageNumber: 5,
        title: "Portfolio d'Interfaces Mobiles",
        type: 'html',
        text: 'Galerie visuelle des rendus vectoriels et conversion immédiate.',
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-10 bg-zinc-900 text-white">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-3 text-xs text-zinc-400 font-mono">
              <span>SHOWCASE</span>
              <span>PAGE 05</span>
            </div>

            <div class="flex-1 py-6 flex flex-col justify-center">
              <span class="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-2">Galerie</span>
              <h2 class="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                Une netteté Retina absolue
              </h2>
              <p class="text-sm text-zinc-400 mb-6">
                Chaque page importée depuis vos PDF et Word est vectorisée ou restituée en double résolution pour éviter tout flou de zoom.
              </p>

              <div class="relative rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950 p-6 flex flex-col items-center text-center">
                <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white mb-3 shadow-lg shadow-indigo-500/30">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h4 class="font-bold text-white text-base">Multi-formats compatibles</h4>
                <p class="text-xs text-zinc-400 mt-1 max-w-xs">PDF vectoriels, Word .docx, documents textes, images et photos haute définition.</p>
                <div class="mt-4 flex gap-2">
                  <span class="px-2 py-0.5 rounded text-[11px] bg-zinc-800 text-zinc-300 font-mono">.PDF</span>
                  <span class="px-2 py-0.5 rounded text-[11px] bg-zinc-800 text-zinc-300 font-mono">.DOCX</span>
                  <span class="px-2 py-0.5 rounded text-[11px] bg-zinc-800 text-zinc-300 font-mono">.TXT</span>
                  <span class="px-2 py-0.5 rounded text-[11px] bg-zinc-800 text-zinc-300 font-mono">.PNG</span>
                </div>
              </div>
            </div>

            <div class="border-t border-zinc-800 pt-3 flex justify-between text-xs text-zinc-400 font-mono">
              <span>VIBE MAG</span>
              <span>— 05 —</span>
            </div>
          </div>
        `,
      },
      // Page 6: Typographie & Rendu
      {
        pageNumber: 6,
        title: 'Typographie & Micro-Rythmes',
        type: 'html',
        text: 'La typographie au service du confort de lecture.',
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-10 bg-amber-50/40 text-zinc-900">
            <div class="flex items-center justify-between border-b border-amber-900/10 pb-3 text-xs text-amber-800/60 font-mono">
              <span>DESIGN SYSTÈME</span>
              <span>PAGE 06</span>
            </div>

            <div class="flex-1 py-6 space-y-4">
              <span class="text-xs uppercase tracking-widest text-amber-800 font-bold">Lisibilité</span>
              <h2 class="text-2xl sm:text-3xl font-serif font-bold text-zinc-900">
                L'art de la mise en page
              </h2>

              <p class="text-zinc-700 leading-relaxed font-serif text-[15px]">
                Pour qu'un document soit dévoré d'une traite, la ligne de lecture ne doit jamais dépasser 70 caractères.
              </p>

              <div class="p-4 bg-white rounded-xl border border-amber-200/70 shadow-sm space-y-2">
                <div class="text-xs font-mono text-zinc-400">Contraste & Éclairage</div>
                <p class="text-xs text-zinc-600 leading-relaxed">
                  Basculez entre 4 ambiances de lecture selon l'environnement : Studio sombre pour le soir, Papier chaud pour le café, Bois naturel ou Minimaliste épuré.
                </p>
              </div>

              <div class="p-4 bg-white rounded-xl border border-amber-200/70 shadow-sm space-y-2">
                <div class="text-xs font-mono text-zinc-400">Recherche & Signets</div>
                <p class="text-xs text-zinc-600 leading-relaxed">
                  Retrouvez instantanément n'importe quel mot-clé dans les pages indexées et épinglez vos passages favoris en un tap.
                </p>
              </div>
            </div>

            <div class="border-t border-amber-900/10 pt-3 flex justify-between text-xs text-amber-800/60 font-mono">
              <span>VIBE MAG</span>
              <span>— 06 —</span>
            </div>
          </div>
        `,
      },
      // Page 7: Entrevue
      {
        pageNumber: 7,
        title: 'Entrevue: Créer sans Friction',
        type: 'html',
        text: 'Discussion sur le futur des interfaces de lecture.',
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-10 bg-white text-zinc-900">
            <div class="flex items-center justify-between border-b border-zinc-100 pb-3 text-xs text-zinc-400 font-mono">
              <span>ENTRETIEN</span>
              <span>PAGE 07</span>
            </div>

            <div class="flex-1 py-6 space-y-4 font-serif">
              <span class="text-xs uppercase tracking-widest text-indigo-600 font-bold font-sans">Perspective</span>
              <h2 class="text-2xl sm:text-3xl font-bold font-sans text-zinc-900 leading-tight">
                « L'interactivité n'est pas un gadget »
              </h2>

              <p class="text-xs text-zinc-500 font-sans italic">
                Entretien avec les créateurs de la plateforme FlipBook Studio.
              </p>

              <div class="space-y-3 text-[14px] leading-relaxed text-zinc-700">
                <p>
                  <strong class="font-sans text-zinc-900">Question :</strong> Qu'est-ce qui distingue cette liseuse d'une visionneuse PDF classique ?
                </p>
                <p>
                  <strong class="font-sans text-zinc-900">Réponse :</strong> La visionneuse classique traite le document comme un rouleau infini vertical sans repère spatial. Le FlipBook réintroduit la mémoire spatiale : on sait exactement où se situe une information, « vers le milieu à droite », comme dans un vrai recueil.
                </p>
              </div>
            </div>

            <div class="border-t border-zinc-100 pt-3 flex justify-between text-xs text-zinc-400 font-mono">
              <span>VIBE MAG</span>
              <span>— 07 —</span>
            </div>
          </div>
        `,
      },
      // Page 8: Back cover
      {
        pageNumber: 8,
        title: 'Dernière de Couverture',
        type: 'html',
        text: 'FlipBook Studio. Vos documents prennent vie. Fin de l’édition.',
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-12 bg-zinc-950 text-white select-none text-center">
            <div class="flex justify-center items-center">
              <span class="w-12 h-1 bg-indigo-500 rounded-full"></span>
            </div>

            <div class="my-auto py-8">
              <div class="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center mx-auto mb-6 text-indigo-300">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <h2 class="text-2xl font-bold font-sans tracking-tight">FlipBook Studio</h2>
              <p class="text-sm text-zinc-400 mt-2 max-w-xs mx-auto leading-relaxed">
                Importez maintenant votre propre document PDF ou Word pour créer votre flipbook interactif.
              </p>
            </div>

            <div class="border-t border-zinc-800 pt-6 text-xs text-zinc-500 font-mono">
              <p>© 2026 FlipBook Studio — Conçu pour mobile & tactile</p>
            </div>
          </div>
        `,
      },
    ],
  },
  {
    id: 'sample-handbook',
    title: 'Manuel Technique — Nomad & Vibe Dev',
    author: 'Architecture Lab',
    sourceType: 'sample',
    totalPages: 6,
    aspectRatio: 0.707,
    createdAt: Date.now(),
    tableOfContents: [
      { id: 'hb-1', title: 'Titre & Introduction', pageNumber: 1 },
      { id: 'hb-2', title: 'Principes de Conception', pageNumber: 2 },
      { id: 'hb-3', title: 'Optimisations Tactiles Mobile', pageNumber: 3 },
      { id: 'hb-4', title: 'Gestion de la Mémoire & Canvas', pageNumber: 4 },
      { id: 'hb-5', title: 'Checklist de Validation', pageNumber: 5 },
      { id: 'hb-6', title: 'Conclusion & Ressources', pageNumber: 6 },
    ],
    pages: [
      {
        pageNumber: 1,
        title: 'Couverture Manuel',
        type: 'html',
        text: 'Manuel Technique Nomad & Vibe Dev Guide pour ingénieurs et créateurs d’expériences interactives.',
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-12 bg-slate-900 text-white">
            <div class="flex justify-between items-center text-xs font-mono text-cyan-400">
              <span>DOC REF // 2026.04</span>
              <span>VERSION 3.2</span>
            </div>
            <div class="my-auto py-8">
              <span class="inline-block px-3 py-1 bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono rounded mb-4">SPECIFICATION</span>
              <h1 class="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white leading-tight">
                MANUEL<br/><span class="text-cyan-400">NOMAD & DEV</span>
              </h1>
              <p class="text-slate-400 text-sm mt-4 font-mono leading-relaxed max-w-xs">
                Guide des architectures de lecture interactive et flipbooks temps réel.
              </p>
            </div>
            <div class="border-t border-slate-800 pt-4 flex justify-between text-xs text-slate-500 font-mono">
              <span>TECH MANUAL</span>
              <span>P. 01</span>
            </div>
          </div>
        `,
      },
      {
        pageNumber: 2,
        title: 'Principes de Conception',
        type: 'html',
        text: 'Architecture du FlipBook 3D. Calculs des matrices de rotation et perspective.',
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-10 bg-slate-50 text-slate-900 font-mono">
            <div class="flex justify-between text-xs text-slate-400 border-b border-slate-200 pb-2">
              <span>SECTION 01</span>
              <span>P. 02</span>
            </div>
            <div class="flex-1 py-4 space-y-4 text-xs">
              <h2 class="text-lg font-bold text-slate-900">01. Modèle Géométrique</h2>
              <p class="text-slate-600 leading-relaxed font-sans text-sm">
                La simulation d’une page qui tourne repose sur la déformation 3D combinée à un ombrage dynamique simulant la lumière incidente.
              </p>
              <div class="bg-slate-900 text-cyan-300 p-3 rounded text-[11px] leading-relaxed">
                <code>perspective: 1800px;<br/>transform-origin: left center;<br/>transform: rotateY(-180deg);</code>
              </div>
              <p class="text-slate-600 leading-relaxed font-sans text-sm">
                La gouttière centrale applique un dégradé radial subtil qui donne l'illusion du pli papier d'une reliure collée.
              </p>
            </div>
            <div class="border-t border-slate-200 pt-2 text-right text-xs text-slate-400">
              02 / 06
            </div>
          </div>
        `,
      },
      {
        pageNumber: 3,
        title: 'Optimisations Tactiles Mobile',
        type: 'html',
        text: 'Détection des gestes tactiles et accélération matérielle.',
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-10 bg-white text-slate-900">
            <div class="flex justify-between text-xs text-slate-400 border-b border-slate-100 pb-2 font-mono">
              <span>SECTION 02</span>
              <span>P. 03</span>
            </div>
            <div class="flex-1 py-4 space-y-4">
              <h2 class="text-lg font-bold text-slate-900 font-mono">02. Détection Tactile</h2>
              <p class="text-slate-700 leading-relaxed text-sm">
                Sur écran tactile, le calcul de la vitesse de glissement (velocity swipe) permet de déclencher l'animation sans latence dès que l'utilisateur relâche le doigt.
              </p>
              <div class="p-3 bg-cyan-50 border border-cyan-200 rounded text-xs text-cyan-900">
                <strong>Conseil Vibe :</strong> En mode portrait, afficher une seule page plein écran permet une lisibilité maximale même sur un écran de 5.8 pouces.
              </div>
            </div>
            <div class="border-t border-slate-100 pt-2 text-right text-xs text-slate-400 font-mono">
              03 / 06
            </div>
          </div>
        `,
      },
      {
        pageNumber: 4,
        title: 'Gestion Mémoire',
        type: 'html',
        text: 'Rendu multi-résolution des documents PDF volumineux.',
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-10 bg-white text-slate-900">
            <div class="flex justify-between text-xs text-slate-400 border-b border-slate-100 pb-2 font-mono">
              <span>SECTION 03</span>
              <span>P. 04</span>
            </div>
            <div class="flex-1 py-4 space-y-4">
              <h2 class="text-lg font-bold text-slate-900 font-mono">03. Pipeline Mémoire</h2>
              <p class="text-slate-700 leading-relaxed text-sm">
                Les documents de plus de 50 pages utilisent un système de virtualisation : seules les pages courantes et adjacentes sont maintenues en texture GPU pour préserver la batterie mobile.
              </p>
            </div>
            <div class="border-t border-slate-100 pt-2 text-right text-xs text-slate-400 font-mono">
              04 / 06
            </div>
          </div>
        `,
      },
      {
        pageNumber: 5,
        title: 'Checklist Validation',
        type: 'html',
        text: 'Checklist de contrôle qualité avant diffusion du flipbook.',
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-10 bg-slate-50 text-slate-900">
            <div class="flex justify-between text-xs text-slate-400 border-b border-slate-200 pb-2 font-mono">
              <span>SECTION 04</span>
              <span>P. 05</span>
            </div>
            <div class="flex-1 py-4 space-y-3">
              <h2 class="text-lg font-bold text-slate-900 font-mono">04. Checklist Qualité</h2>
              <ul class="space-y-2 text-xs font-mono text-slate-700">
                <li class="flex items-center gap-2">
                  <span class="text-emerald-600 font-bold">[✓]</span>
                  <span>Temps de chargement initial &lt; 500ms</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-emerald-600 font-bold">[✓]</span>
                  <span>Support plein écran sur iOS & Android</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-emerald-600 font-bold">[✓]</span>
                  <span>Audio de feuilletage sans coupure</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-emerald-600 font-bold">[✓]</span>
                  <span>Signets persistants en mémoire locale</span>
                </li>
              </ul>
            </div>
            <div class="border-t border-slate-200 pt-2 text-right text-xs text-slate-400 font-mono">
              05 / 06
            </div>
          </div>
        `,
      },
      {
        pageNumber: 6,
        title: 'Fin du Manuel',
        type: 'html',
        text: 'Manuel Technique Nomad & Dev. Fin du document.',
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-12 bg-slate-900 text-white text-center font-mono">
            <div class="text-xs text-slate-500">END OF SPECIFICATION</div>
            <div class="my-auto py-8">
              <h3 class="text-2xl font-bold text-cyan-400">FIN DU GUIDE</h3>
              <p class="text-xs text-slate-400 mt-2">Prêt pour déploiement interactif.</p>
            </div>
            <div class="text-xs text-slate-600">06 / 06</div>
          </div>
        `,
      },
    ],
  },
  {
    id: 'sample-menu',
    title: 'Carte & Menu — L’Atelier des Saveurs',
    author: 'Gastronomie & Vins',
    sourceType: 'sample',
    totalPages: 4,
    aspectRatio: 0.707,
    createdAt: Date.now(),
    tableOfContents: [
      { id: 'm-1', title: 'Couverture du Menu', pageNumber: 1 },
      { id: 'm-2', title: 'Entrées & Plats Signatures', pageNumber: 2 },
      { id: 'm-3', title: 'Fromages & Desserts', pageNumber: 3 },
      { id: 'm-4', title: 'Cocktails & Vins', pageNumber: 4 },
    ],
    pages: [
      {
        pageNumber: 1,
        title: 'Menu Couverture',
        type: 'html',
        text: 'L’Atelier des Saveurs Restaurant Gastronomique Carte de Saison',
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-12 bg-stone-900 text-amber-100 text-center font-serif">
            <div class="text-xs uppercase tracking-[0.3em] text-amber-400/80">Paris • Saison 2026</div>
            <div class="my-auto py-6">
              <div class="w-16 h-16 border border-amber-400/50 rotate-45 mx-auto mb-6 flex items-center justify-center">
                <span class="-rotate-45 text-amber-300 font-bold text-lg">A</span>
              </div>
              <h1 class="text-3xl sm:text-4xl font-normal tracking-wide text-amber-50">L’ATELIER<br/><span class="text-amber-300 italic font-light">des Saveurs</span></h1>
              <div class="w-12 h-px bg-amber-400/50 mx-auto my-4"></div>
              <p class="text-xs tracking-widest uppercase text-stone-400">Menu Dégustation</p>
            </div>
            <div class="text-[11px] text-stone-500 tracking-wider">FEUILLETEZ LA CARTE</div>
          </div>
        `,
      },
      {
        pageNumber: 2,
        title: 'Entrées & Plats',
        type: 'html',
        text: 'Entrées raffinées et plats signatures préparés avec des produits frais du terroir.',
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-10 bg-[#faf8f5] text-stone-900 font-serif">
            <div class="flex justify-between text-xs text-stone-400 border-b border-stone-200 pb-2">
              <span>ENTRÉES & SIGNATURES</span>
              <span>P. 02</span>
            </div>
            <div class="flex-1 py-4 space-y-5">
              <div>
                <h3 class="text-xs uppercase tracking-widest text-amber-800 font-bold border-b border-amber-900/10 pb-1 mb-3">Pour Débuter</h3>
                <div class="space-y-3 text-xs">
                  <div class="flex justify-between items-baseline">
                    <span class="font-bold text-stone-800">Velouté de Butternut rôti & Huile de truffe</span>
                    <span class="text-stone-600 font-mono">18 €</span>
                  </div>
                  <div class="flex justify-between items-baseline">
                    <span class="font-bold text-stone-800">Carpaccio de Saint-Jacques aux agrumes</span>
                    <span class="text-stone-600 font-mono">24 €</span>
                  </div>
                </div>
              </div>
              <div class="pt-2">
                <h3 class="text-xs uppercase tracking-widest text-amber-800 font-bold border-b border-amber-900/10 pb-1 mb-3">Plats de Résistance</h3>
                <div class="space-y-3 text-xs">
                  <div class="flex justify-between items-baseline">
                    <span class="font-bold text-stone-800">Filet de Bar de ligne en croûte d’herbes</span>
                    <span class="text-stone-600 font-mono">36 €</span>
                  </div>
                  <div class="flex justify-between items-baseline">
                    <span class="font-bold text-stone-800">Quasi de Veau rôti, morilles & purée truffée</span>
                    <span class="text-stone-600 font-mono">42 €</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-center text-[11px] text-stone-400 italic">Menu servi midi et soir</div>
          </div>
        `,
      },
      {
        pageNumber: 3,
        title: 'Desserts & Douceurs',
        type: 'html',
        text: 'Desserts du chef pâtissier et accords sucrés.',
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-10 bg-[#faf8f5] text-stone-900 font-serif">
            <div class="flex justify-between text-xs text-stone-400 border-b border-stone-200 pb-2">
              <span>DOUCEURS</span>
              <span>P. 03</span>
            </div>
            <div class="flex-1 py-4 space-y-5">
              <h3 class="text-xs uppercase tracking-widest text-amber-800 font-bold border-b border-amber-900/10 pb-1 mb-3">Desserts Signatures</h3>
              <div class="space-y-4 text-xs">
                <div>
                  <div class="flex justify-between font-bold text-stone-800">
                    <span>Soufflé chaud au Grand Marnier</span>
                    <span class="font-mono text-stone-600">16 €</span>
                  </div>
                  <p class="text-[11px] text-stone-500 mt-0.5">Crème glacée vanille de Madagascar</p>
                </div>
                <div>
                  <div class="flex justify-between font-bold text-stone-800">
                    <span>Millefeuille croustillant praliné</span>
                    <span class="font-mono text-stone-600">15 €</span>
                  </div>
                  <p class="text-[11px] text-stone-500 mt-0.5">Caramel beurre salé fondant</p>
                </div>
              </div>
            </div>
            <div class="text-center text-[11px] text-stone-400 italic">Toutes nos pâtisseries sont faites maison</div>
          </div>
        `,
      },
      {
        pageNumber: 4,
        title: 'Vins & Cocktails',
        type: 'html',
        text: 'Sélection de cocktails signature et grands crus.',
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-12 bg-stone-900 text-amber-100 text-center font-serif">
            <div class="text-xs uppercase tracking-widest text-amber-400/70">LA CAVE</div>
            <div class="my-auto py-4 space-y-4 text-xs">
              <h3 class="text-xl font-normal text-amber-200">Accords & Digestifs</h3>
              <p class="text-stone-400 text-[12px] leading-relaxed max-w-xs mx-auto">
                Notre sommelier se tient à votre disposition pour vous orienter à travers les terroirs de France.
              </p>
              <div class="pt-2 text-amber-300 font-mono text-[11px]">
                Réservations : 01 42 68 00 00
              </div>
            </div>
            <div class="text-[11px] text-stone-500">Merci de votre visite</div>
          </div>
        `,
      },
    ],
  },
  {
    id: 'sample-hotel-azur',
    title: 'Brochure Prestige — Hôtel Azur Palace',
    author: 'Direction Artistique Azur',
    sourceType: 'sample',
    totalPages: 4,
    aspectRatio: 0.707,
    createdAt: Date.now(),
    tableOfContents: [
      { id: 'az-1', title: 'Couverture & Bienvenue', pageNumber: 1 },
      { id: 'az-2', title: 'Les Suites Royales & Vidéo 360°', pageNumber: 2 },
      { id: 'az-3', title: 'Gastronomie & Vins d’Exception', pageNumber: 3 },
      { id: 'az-4', title: 'Accès, Conciergerie & Réservations', pageNumber: 4 },
    ],
    pages: [
      {
        pageNumber: 1,
        title: 'Couverture Azur Palace',
        type: 'html',
        text: 'Hôtel Azur Palace Côte d’Azur Bienvenue dans le luxe méditerranéen.',
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-12 bg-sky-950 text-white font-serif text-center relative">
            <div class="text-xs uppercase tracking-[0.3em] text-amber-300">CÔTE D’AZUR • PALACE 5★</div>
            <div class="my-auto py-6">
              <div class="w-16 h-16 rounded-full border border-amber-300/40 mx-auto mb-6 flex items-center justify-center bg-sky-900/60">
                <span class="text-amber-300 text-xl font-bold font-sans">A</span>
              </div>
              <h1 class="text-3xl sm:text-4xl font-normal tracking-wide text-white leading-tight">
                HÔTEL AZUR<br/><span class="text-amber-300 italic font-light">Palace &amp; Spa</span>
              </h1>
              <div class="w-12 h-px bg-amber-400/50 mx-auto my-4"></div>
              <p class="text-xs tracking-widest uppercase text-sky-200">Édition Interactive &amp; Médias</p>
            </div>
            <div class="text-[11px] text-sky-300 tracking-wider font-mono">
              CLIQUEZ SUR LES ZONES INTERACTIVES POUR TESTER
            </div>
          </div>
        `,
      },
      {
        pageNumber: 2,
        title: 'Suites Royales & Vidéo',
        type: 'html',
        text: 'Suites avec vue panoramique mer Méditerranée et terrasse privative.',
        hotspots: [
          {
            id: 'hs-hotel-video',
            flipbookId: 'sample-hotel-azur',
            pageNumber: 2,
            type: 'VIDEO',
            label: 'Visite Vidéo — Suite Panoramique',
            targetUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hotel-resort-pool-at-dusk-4217-large.mp4',
            region: { x: 0.15, y: 0.38, width: 0.7, height: 0.25 },
          },
          {
            id: 'hs-hotel-whatsapp',
            flipbookId: 'sample-hotel-azur',
            pageNumber: 2,
            type: 'WHATSAPP',
            label: 'WhatsApp Concierge 24/7',
            phoneNumber: '+33493001122',
            whatsappMessage: 'Bonjour, je souhaite réserver la Suite Panoramique pour ce week-end.',
            region: { x: 0.15, y: 0.78, width: 0.7, height: 0.1 },
          },
        ],
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-10 bg-slate-900 text-white font-sans">
            <div class="flex justify-between text-xs text-sky-300 font-mono border-b border-sky-800 pb-2">
              <span>HÉBERGEMENT DE PRESTIGE</span>
              <span>P. 02</span>
            </div>
            <div class="flex-1 py-4 space-y-4">
              <span class="text-xs uppercase tracking-widest text-amber-400 font-bold">Suite Panoramique Mer</span>
              <h2 class="text-2xl font-bold font-serif text-white">Le Sanctuaire de vos Rêves</h2>
              <p class="text-xs text-slate-300 leading-relaxed">
                Profitez d’une vue plongeante sur la baie de Cannes depuis un balcon en teck privatif de 45 m².
              </p>
              <div class="p-4 rounded-xl bg-sky-950/80 border border-sky-700/60 text-center space-y-1">
                <p class="text-xs font-bold text-sky-200">🎬 Cliquez sur la zone ci-dessous pour lancer la vidéo 360°</p>
                <p class="text-[11px] text-sky-400 font-mono">Lecteur vidéo streaming intégré sans quitter la page</p>
              </div>
            </div>
            <div class="border-t border-sky-800 pt-3 flex justify-between text-xs text-sky-400 font-mono">
              <span>AZUR PALACE</span>
              <span>— 02 —</span>
            </div>
          </div>
        `,
      },
      {
        pageNumber: 3,
        title: 'Gastronomie & Champagne',
        type: 'html',
        text: 'Dégustez notre sélection de champagnes d’exception et mets étoilés.',
        hotspots: [
          {
            id: 'hs-hotel-champagne',
            flipbookId: 'sample-hotel-azur',
            pageNumber: 3,
            type: 'PRODUCT',
            label: 'Cuvée Brut Millésimée',
            productPrice: '185 €',
            targetUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80',
            tooltipText: 'Bouteille servie frappée en suite avec mignardises et macarons de notre chef étoilé.',
            region: { x: 0.15, y: 0.38, width: 0.7, height: 0.25 },
          },
          {
            id: 'hs-hotel-jump',
            flipbookId: 'sample-hotel-azur',
            pageNumber: 3,
            type: 'URL',
            label: 'Sauter à la Conciergerie (Page 4)',
            targetUrl: 'page:4',
            region: { x: 0.15, y: 0.8, width: 0.7, height: 0.1 },
          },
        ],
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-10 bg-stone-900 text-stone-100 font-serif">
            <div class="flex justify-between text-xs text-amber-300/80 border-b border-amber-900/40 pb-2">
              <span>TABLE ÉTOILÉE &amp; CAVE</span>
              <span>P. 03</span>
            </div>
            <div class="flex-1 py-4 space-y-4">
              <span class="text-xs uppercase tracking-widest text-amber-400 font-bold font-sans">Millésimes Rares</span>
              <h2 class="text-2xl font-normal text-amber-100">La Cave Impériale</h2>
              <p class="text-xs text-stone-300 font-sans leading-relaxed">
                Notre chef sommelier vous propose les plus grands crus classés de Champagne et de Bourgogne.
              </p>
              <div class="p-4 rounded-xl bg-amber-950/40 border border-amber-800/40 text-center font-sans space-y-1">
                <p class="text-xs font-bold text-amber-300">🛍️ Cliquez sur le produit ci-dessous pour voir la fiche d’achat</p>
                <p class="text-[11px] text-amber-200/70 font-mono">Ajout panier &amp; commande en chambre</p>
              </div>
            </div>
            <div class="border-t border-amber-900/40 pt-3 flex justify-between text-xs text-amber-400 font-mono font-sans">
              <span>AZUR PALACE</span>
              <span>— 03 —</span>
            </div>
          </div>
        `,
      },
      {
        pageNumber: 4,
        title: 'Réservations & Contact',
        type: 'html',
        text: 'Contactez notre conciergerie ou réservez directement votre séjour.',
        hotspots: [
          {
            id: 'hs-hotel-phone',
            flipbookId: 'sample-hotel-azur',
            pageNumber: 4,
            type: 'PHONE',
            label: 'Appeler la Réception',
            phoneNumber: '+33 4 93 00 11 22',
            region: { x: 0.2, y: 0.45, width: 0.6, height: 0.12 },
          },
          {
            id: 'hs-hotel-email',
            flipbookId: 'sample-hotel-azur',
            pageNumber: 4,
            type: 'EMAIL',
            label: 'Écrire par Email',
            emailAddress: 'contact@hotel-azur-palace.fr',
            region: { x: 0.2, y: 0.65, width: 0.6, height: 0.12 },
          },
        ],
        htmlContent: `
          <div class="h-full flex flex-col justify-between p-8 sm:p-12 bg-sky-950 text-white text-center font-serif">
            <div class="text-xs uppercase tracking-widest text-amber-300">CONCIERGERIE 24/7</div>
            <div class="my-auto py-4 space-y-3 font-sans">
              <h3 class="text-2xl font-serif text-white">À votre entière disposition</h3>
              <p class="text-xs text-sky-200 max-w-xs mx-auto leading-relaxed">
                Transfert héliport, chauffeur privé, réservation de yachts ou privatisation du spa.
              </p>
            </div>
            <div class="text-[11px] text-sky-400 font-mono">
              Hôtel Azur Palace • Promenade des Flots, 06400 Cannes
            </div>
          </div>
        `,
      },
    ],
  },
];
