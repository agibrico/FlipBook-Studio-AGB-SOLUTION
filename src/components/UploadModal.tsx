import React, { useState, useRef } from 'react';
import { FlipBookDocument } from '../types';
import { convertPdfToFlipBook, ConversionProgress } from '../services/pdfConverter';
import {
  convertDocxToFlipBook,
  convertPptxToFlipBook,
  convertCsvOrExcelToFlipBook,
  convertTextToFlipBook,
  convertImagesToFlipBook,
} from '../services/multiFormatConverter';
import { SAMPLE_BOOKS } from '../services/sampleBooks';
import { useAuth } from '../contexts/AuthContext';
import { tenantService } from '../services/tenantService';
import {
  UploadCloud,
  FileText,
  FileCode,
  Image as ImageIcon,
  Presentation,
  Sheet,
  Sparkles,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Ban,
  Building2,
} from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentLoaded: (doc: FlipBookDocument) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDocumentLoaded,
}) => {
  const { role, activeClient, activeOrg } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState<ConversionProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>(activeClient?.id || '');

  // AbortController for cancelable conversion jobs
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const availableClients = tenantService.getClients(activeOrg.id);

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsConverting(false);
    setProgress(null);
    setErrorMessage('Conversion interrompue par l’utilisateur.');
  };

  const handleFileProcess = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);
    setIsConverting(true);
    setProgress(null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const file = files[0];
      const fileName = file.name.toLowerCase();

      let flipDoc: FlipBookDocument;

      // 1. PDF Converter with Job Lifecycle
      if (fileName.endsWith('.pdf')) {
        flipDoc = await convertPdfToFlipBook(
          file,
          (p) => setProgress(p),
          abortController.signal
        );
      }
      // 2. Word (.docx) Converter
      else if (fileName.endsWith('.docx')) {
        setProgress({
          stage: 'PARSING',
          percent: 30,
          currentPage: 1,
          totalPages: 1,
          statusText: 'Conversion et mise en page du document Word (.docx)...',
        });
        flipDoc = await convertDocxToFlipBook(file);
      }
      // 3. PowerPoint (.pptx) Converter
      else if (fileName.endsWith('.pptx')) {
        setProgress({
          stage: 'PARSING',
          percent: 35,
          currentPage: 1,
          totalPages: 1,
          statusText: 'Extraction des diapositives PowerPoint (.pptx)...',
        });
        flipDoc = await convertPptxToFlipBook(file);
      }
      // 4. Excel / CSV (.xlsx, .csv) Converter
      else if (fileName.endsWith('.csv') || fileName.endsWith('.xlsx')) {
        setProgress({
          stage: 'PARSING',
          percent: 40,
          currentPage: 1,
          totalPages: 1,
          statusText: 'Formatage des feuilles de données en tableau interactif...',
        });
        flipDoc = await convertCsvOrExcelToFlipBook(file);
      }
      // 5. Plain text & Markdown (.txt, .md)
      else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
        setProgress({
          stage: 'PARSING',
          percent: 50,
          currentPage: 1,
          totalPages: 1,
          statusText: 'Structuration typographique et pagination du texte...',
        });
        flipDoc = await convertTextToFlipBook(file);
      }
      // 6. Image albums (.png, .jpg, .webp)
      else if (file.type.startsWith('image/')) {
        setProgress({
          stage: 'RENDERING',
          percent: 60,
          currentPage: 1,
          totalPages: files.length,
          statusText: `Création de l'album d'images HD (${files.length} fichiers)...`,
        });
        flipDoc = await convertImagesToFlipBook(Array.from(files));
      } else {
        throw new Error(
          'Format non supporté. Formats acceptés : PDF (.pdf), Word (.docx), PowerPoint (.pptx), Tableur (.csv), Texte (.txt, .md) ou Images (.jpg, .png).'
        );
      }

      // If client attribution is selected in admin view, link to tenant record
      const targetClientId = selectedClientId || (activeClient ? activeClient.id : undefined);
      if (targetClientId) {
        tenantService.createFlipbook({
          organizationId: activeOrg.id,
          clientId: targetClientId,
          title: flipDoc.title,
          slug: flipDoc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          sourceDocumentId: `doc-${Date.now()}`,
          status: 'READY',
          visibility: 'PUBLIC',
          totalPages: flipDoc.totalPages,
          publicToken: `token-${Date.now()}`,
          viewCount: 0,
          language: 'fr',
          createdBy: 'pao-operator',
          permissions: {
            allowDownload: true,
            allowPrint: true,
            allowShare: true,
            allowIndexing: true,
            passwordProtected: false,
            isActive: true,
          },
        });
      }

      onDocumentLoaded(flipDoc);
      onClose();
    } catch (err) {
      if (abortController.signal.aborted) {
        console.log('Conversion annulée.');
      } else {
        console.error('Erreur lors du traitement du document:', err);
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Une erreur inattendue est survenue lors de la conversion.'
        );
      }
    } finally {
      setIsConverting(false);
      setProgress(null);
      abortControllerRef.current = null;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      id="upload-modal-backdrop"
      onClick={!isConverting ? onClose : undefined}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="upload-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 transition-all"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-900/80">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
              Importer un Document & Créer un FlipBook
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Pipeline haute fidélité pour PDF, Word, PowerPoint, Tableur et Albums
            </p>
          </div>
          {!isConverting && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {errorMessage && (
            <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl flex items-start gap-3 text-red-200 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Échec de l’importation</p>
                <p className="text-xs text-red-300 mt-0.5">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-red-200 text-xs font-mono"
              >
                Ignorer
              </button>
            </div>
          )}

          {/* Client Attribution Selection (for Admin/Operator) */}
          {role !== 'CLIENT' && availableClients.length > 0 && !isConverting && (
            <div className="bg-zinc-950/50 p-3.5 rounded-xl border border-zinc-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <div>
                  <label htmlFor="client-selector" className="text-xs font-semibold text-zinc-200 block">
                    Attribution Client (Multi-Tenant)
                  </label>
                  <p className="text-[11px] text-zinc-400">
                    Attribuer le flipbook créé directement au dossier d'un client
                  </p>
                </div>
              </div>
              <select
                id="client-selector"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Catalogue Général (Non assigné)</option>
                {availableClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.companyName || client.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isConverting ? (
            /* Asynchronous Conversion Pipeline Progress */
            <div className="py-8 px-4 flex flex-col items-center text-center space-y-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/10">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                {progress && progress.percent > 0 && (
                  <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono text-[10px] font-bold shadow-md">
                    {progress.percent}%
                  </span>
                )}
              </div>

              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-base font-semibold text-white">
                  Traitement du document en cours
                </h3>
                <p className="text-xs text-indigo-300 font-medium">
                  {progress?.statusText || 'Initialisation du moteur de conversion...'}
                </p>
                {progress && progress.totalPages > 0 && (
                  <p className="text-xs text-zinc-400 font-mono">
                    Page {progress.currentPage} / {progress.totalPages}
                  </p>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-md bg-zinc-800 rounded-full h-2.5 overflow-hidden border border-zinc-700/60 p-0.5">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 h-full rounded-full transition-all duration-300 shadow-sm shadow-indigo-500/50"
                  style={{ width: `${progress?.percent || 15}%` }}
                />
              </div>

              {/* Stage Stepper Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {[
                  { label: 'Validation', active: true },
                  { label: 'Décodage', active: (progress?.percent || 0) >= 15 },
                  { label: 'Rendu HD', active: (progress?.percent || 0) >= 30 },
                  { label: 'Indexation & Sommaire', active: (progress?.percent || 0) >= 80 },
                  { label: 'Prêt', active: (progress?.percent || 0) >= 98 },
                ].map((st, i) => (
                  <span
                    key={i}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wide ${
                      st.active
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-zinc-800/60 text-zinc-500 border border-zinc-800'
                    }`}
                  >
                    {st.label}
                  </span>
                ))}
              </div>

              {/* Cancel button */}
              <button
                type="button"
                onClick={handleCancel}
                className="mt-4 px-4 py-2 text-xs font-medium text-zinc-400 hover:text-red-300 hover:bg-red-950/30 border border-zinc-700 hover:border-red-800/60 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                Annuler la conversion
              </button>
            </div>
          ) : (
            <>
              {/* Drag & Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
                    : 'border-zinc-700/80 hover:border-indigo-500/60 bg-zinc-950/40 hover:bg-zinc-950/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.pptx,.csv,.xlsx,.txt,.md,image/png,image/jpeg,image/webp"
                  onChange={(e) => e.target.files && handleFileProcess(e.target.files)}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-indigo-400 shadow-inner mb-4">
                  <UploadCloud className="w-7 h-7" />
                </div>

                <p className="text-sm font-semibold text-zinc-100">
                  Glissez-déposez votre document ici
                </p>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
                  ou <span className="text-indigo-400 underline font-medium">parcourez vos fichiers</span> pour créer instantanément votre flipbook interactif.
                </p>

                {/* Formats badges */}
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-[11px] font-mono text-zinc-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-red-400" />
                    PDF (.pdf)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-[11px] font-mono text-zinc-300 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-blue-400" />
                    Word (.docx)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-[11px] font-mono text-zinc-300 flex items-center gap-1.5">
                    <Presentation className="w-3.5 h-3.5 text-orange-400" />
                    PowerPoint (.pptx)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-[11px] font-mono text-zinc-300 flex items-center gap-1.5">
                    <Sheet className="w-3.5 h-3.5 text-emerald-400" />
                    Tableur (.csv)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-[11px] font-mono text-zinc-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                    Images / Album
                  </span>
                </div>
              </div>

              {/* Sample demo books section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Ou essayez un exemple prêt à feuilleter :
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {SAMPLE_BOOKS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => {
                        onDocumentLoaded(sample);
                        onClose();
                      }}
                      className="p-3 bg-zinc-950/60 border border-zinc-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 rounded-xl text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono text-indigo-400 uppercase">
                          {sample.pages.length} pages
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <h4 className="text-xs font-semibold text-zinc-200 line-clamp-1 group-hover:text-white">
                        {sample.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {sample.author}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
