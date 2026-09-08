import { BookPage } from '../types';

export interface SpeechState {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  currentPageNumber: number | null;
  currentTextSnippet: string;
  rate: number;
  selectedVoiceURI: string | null;
  hasText: boolean;
  totalSentences: number;
  currentSentenceIndex: number;
}

type StateListener = (state: SpeechState) => void;

/**
 * Cleanly extracts human-readable text from a BookPage (handling HTML markup or raw text)
 */
export function extractPageText(page: BookPage | undefined): string {
  if (!page) return '';

  let extracted = '';

  if (page.htmlContent && typeof window !== 'undefined') {
    try {
      // Replace block tags with period and space to avoid words mashing together
      const sanitized = page.htmlContent
        .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|blockquote|tr)>/gi, '. ')
        .replace(/<br\s*[\/]?>/gi, '. ');

      const tempEl = document.createElement('div');
      tempEl.innerHTML = sanitized;
      extracted = tempEl.textContent || tempEl.innerText || '';
    } catch {
      extracted = page.text || '';
    }
  } else if (page.text) {
    extracted = page.text;
  }

  // If page has a title and it's not already at the start, prepend it
  const trimmed = extracted
    .replace(/\s+/g, ' ')
    .replace(/\.+/g, '.')
    .replace(/\.\s*\./g, '.')
    .trim();

  if (page.title && !trimmed.toLowerCase().startsWith(page.title.toLowerCase())) {
    return `${page.title}. ${trimmed}`;
  }

  return trimmed;
}

/**
 * Splits text into natural sentence chunks for reliable SpeechSynthesis playback
 * (prevents the Chrome 15-second utterance stall bug)
 */
function splitIntoSentences(text: string): string[] {
  if (!text) return [];

  // Match sentence endings like . ? ! or line breaks
  const rawChunks = text.split(/(?<=[.?!;:])\s+/);
  const sentences: string[] = [];

  for (const chunk of rawChunks) {
    const clean = chunk.trim();
    if (!clean) continue;

    // If a sentence is abnormally long (>250 chars), split it at commas or clauses
    if (clean.length > 250) {
      const subChunks = clean.split(/(?<=[,])\s+/);
      for (const sub of subChunks) {
        if (sub.trim()) sentences.push(sub.trim());
      }
    } else {
      sentences.push(clean);
    }
  }

  return sentences.length > 0 ? sentences : [text];
}

class SpeechReaderService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private rate: number = 1.0;
  private listeners: Set<StateListener> = new Set();
  private keepAliveTimer: number | null = null;

  // Queue state for multi-sentence page reading
  private sentenceQueue: string[] = [];
  private currentSentenceIdx: number = 0;
  private activePageNum: number | null = null;
  private activePageText: string = '';

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  public isSupported(): boolean {
    return this.synth !== null;
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();

    // Auto-select a high quality French voice if available, otherwise browser default
    if (!this.selectedVoice && this.voices.length > 0) {
      const preferred =
        this.voices.find((v) => v.lang.startsWith('fr') && (v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Google'))) ||
        this.voices.find((v) => v.lang.startsWith('fr')) ||
        this.voices.find((v) => v.default) ||
        this.voices[0];

      this.selectedVoice = preferred || null;
    }
    this.notifyState();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.loadVoices();
    }
    return this.voices;
  }

  public setVoice(voiceURI: string) {
    const found = this.voices.find((v) => v.voiceURI === voiceURI);
    if (found) {
      this.selectedVoice = found;
      // If currently speaking, restart current sentence with new voice
      if (this.synth?.speaking && !this.synth.paused) {
        this.playCurrentSentence();
      } else {
        this.notifyState();
      }
    }
  }

  public setRate(newRate: number) {
    this.rate = Math.max(0.5, Math.min(2.0, newRate));
    if (this.synth?.speaking && !this.synth.paused) {
      this.playCurrentSentence();
    } else {
      this.notifyState();
    }
  }

  public getRate(): number {
    return this.rate;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notifyState() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  public getState(): SpeechState {
    const isSpeaking = !!this.synth?.speaking;
    const isPaused = !!this.synth?.paused;

    return {
      isSupported: this.isSupported(),
      isSpeaking: isSpeaking && !isPaused,
      isPaused: isPaused,
      currentPageNumber: this.activePageNum,
      currentTextSnippet: this.sentenceQueue[this.currentSentenceIdx] || '',
      rate: this.rate,
      selectedVoiceURI: this.selectedVoice ? this.selectedVoice.voiceURI : null,
      hasText: !!this.activePageText && this.activePageText.trim().length > 0,
      totalSentences: this.sentenceQueue.length,
      currentSentenceIndex: this.currentSentenceIdx,
    };
  }

  /**
   * Speak the content of a BookPage
   */
  public speakPage(page: BookPage, forceStart: boolean = true) {
    if (!this.synth) return;

    // If user clicked while already speaking this page, toggle pause
    if (!forceStart && this.activePageNum === page.pageNumber && this.synth.speaking) {
      if (this.synth.paused) {
        this.resume();
      } else {
        this.pause();
      }
      return;
    }

    this.stop();

    const fullText = extractPageText(page);
    this.activePageNum = page.pageNumber;
    this.activePageText = fullText;

    if (!fullText.trim()) {
      this.sentenceQueue = [];
      this.currentSentenceIdx = 0;
      this.notifyState();
      return;
    }

    this.sentenceQueue = splitIntoSentences(fullText);
    this.currentSentenceIdx = 0;
    this.startKeepAlive();
    this.playCurrentSentence();
  }

  private playCurrentSentence() {
    if (!this.synth) return;

    // Cancel current utterance
    this.synth.cancel();

    if (this.currentSentenceIdx >= this.sentenceQueue.length) {
      this.stop();
      return;
    }

    const textToRead = this.sentenceQueue[this.currentSentenceIdx];
    if (!textToRead) {
      this.currentSentenceIdx++;
      this.playCurrentSentence();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = this.rate;
    utterance.pitch = 1.0;

    // Detect if text looks predominantly English vs French or other
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
      utterance.lang = this.selectedVoice.lang;
    } else {
      // Default to French or browser default
      utterance.lang = 'fr-FR';
    }

    utterance.onstart = () => {
      this.notifyState();
    };

    utterance.onend = () => {
      this.currentSentenceIdx++;
      if (this.currentSentenceIdx < this.sentenceQueue.length) {
        this.playCurrentSentence();
      } else {
        // Finished reading the entire page
        this.stop();
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('SpeechSynthesis error:', e.error);
      }
      this.stop();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    this.notifyState();
  }

  public nextSentence() {
    if (this.currentSentenceIdx < this.sentenceQueue.length - 1) {
      this.currentSentenceIdx++;
      this.playCurrentSentence();
    }
  }

  public prevSentence() {
    if (this.currentSentenceIdx > 0) {
      this.currentSentenceIdx--;
      this.playCurrentSentence();
    } else {
      this.playCurrentSentence();
    }
  }

  public pause() {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      this.notifyState();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.notifyState();
    } else if (this.activePageNum && this.sentenceQueue.length > 0) {
      this.playCurrentSentence();
    }
  }

  public stop() {
    this.stopKeepAlive();
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
    this.currentSentenceIdx = 0;
    this.notifyState();
  }

  /**
   * Chromium bug workaround: speech synthesis can freeze if idle or running long
   */
  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveTimer = window.setInterval(() => {
      if (this.synth && this.synth.speaking && !this.synth.paused) {
        this.synth.pause();
        this.synth.resume();
      }
    }, 12000);
  }

  private stopKeepAlive() {
    if (this.keepAliveTimer !== null) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }
}

export const speechService = new SpeechReaderService();
