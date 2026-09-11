/**
 * PHASE 22: Ambiance Sonore & Audio Guide Multi-pistes
 * Moteur audio Web Audio API autonome pour diffuser des ambiances musicales immersives
 * adaptées à la lecture (Lounge Hôtel, Nature Spa, Jazz Minimal, Corporate).
 */

import { AmbientSoundTrack } from '../types/saas';

export const AMBIENT_TRACKS: AmbientSoundTrack[] = [
  {
    id: 'track-lounge',
    title: 'Palace Lounge & Chillout',
    genre: 'LOUNGE',
    audioUrl: 'synth://lounge',
    volume: 0.25,
    loop: true,
  },
  {
    id: 'track-spa',
    title: 'Bulle Sérénité & Spa Zen',
    genre: 'NATURE_SPA',
    audioUrl: 'synth://spa',
    volume: 0.2,
    loop: true,
  },
  {
    id: 'track-jazz',
    title: 'Café Parisien & Jazz Velours',
    genre: 'MINIMAL_JAZZ',
    audioUrl: 'synth://jazz',
    volume: 0.25,
    loop: true,
  },
  {
    id: 'track-corporate',
    title: 'Atmosphère Moderne & Focus',
    genre: 'CORPORATE',
    audioUrl: 'synth://corporate',
    volume: 0.2,
    loop: true,
  },
];

class AmbientAudioService {
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;
  private currentTrack: AmbientSoundTrack = AMBIENT_TRACKS[0];
  private volume = 0.25;
  private timerId: any = null;
  private gainNode: GainNode | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private listeners: (() => void)[] = [];

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
        this.gainNode.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getTracks(): AmbientSoundTrack[] {
    return AMBIENT_TRACKS;
  }

  public getCurrentTrack(): AmbientSoundTrack {
    return this.currentTrack;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
    this.notify();
  }

  public selectTrack(track: AmbientSoundTrack) {
    this.currentTrack = track;
    if (this.isPlaying) {
      this.stop();
      this.play();
    } else {
      this.notify();
    }
  }

  public play() {
    this.initContext();
    if (!this.audioCtx || !this.gainNode) return;

    this.stopSynth();
    this.isPlaying = true;
    this.startAmbientSynth();
    this.notify();
  }

  public pause() {
    this.stopSynth();
    this.isPlaying = false;
    this.notify();
  }

  public stop() {
    this.stopSynth();
    this.isPlaying = false;
    this.notify();
  }

  public toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Synthétiseur harmonique ambiant procédural (accords relaxants modulés)
   */
  private startAmbientSynth() {
    if (!this.audioCtx || !this.gainNode) return;

    // Chords definition according to track genre
    let chordFreqs: number[][] = [];
    if (this.currentTrack.genre === 'LOUNGE') {
      chordFreqs = [
        [220, 261.63, 329.63, 392.0], // Am7
        [174.61, 220, 261.63, 329.63], // Fmaj7
        [196.0, 246.94, 293.66, 349.23], // G7
        [164.81, 196.0, 246.94, 293.66], // Em7
      ];
    } else if (this.currentTrack.genre === 'NATURE_SPA') {
      chordFreqs = [
        [130.81, 196.0, 261.63, 329.63], // Cmaj9
        [174.61, 220.0, 261.63, 329.63], // Fmaj7
        [146.83, 220.0, 293.66, 369.99], // Dm9
      ];
    } else if (this.currentTrack.genre === 'MINIMAL_JAZZ') {
      chordFreqs = [
        [220, 277.18, 329.63, 392.0, 440], // A9
        [146.83, 185.0, 220.0, 277.18],    // Dmaj7
        [164.81, 207.65, 246.94, 293.66],  // E7
      ];
    } else {
      chordFreqs = [
        [130.81, 196.0, 246.94, 329.63],
        [164.81, 220.0, 261.63, 329.63],
      ];
    }

    let chordIndex = 0;

    const playNextChord = () => {
      if (!this.isPlaying || !this.audioCtx || !this.gainNode) return;

      const freqs = chordFreqs[chordIndex % chordFreqs.length];
      chordIndex++;

      // Fade out previous oscillators
      this.stopSynth();

      const now = this.audioCtx.currentTime;
      const duration = 7.5; // seconds per atmospheric pad

      freqs.forEach((freq, i) => {
        if (!this.audioCtx || !this.gainNode) return;

        const osc = this.audioCtx.createOscillator();
        const noteGain = this.audioCtx.createGain();
        const filter = this.audioCtx.createBiquadFilter();

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq + (Math.random() * 0.8 - 0.4), now);

        // Low pass warm filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, now);
        filter.Q.setValueAtTime(1.5, now);

        // Gentle envelope (slow attack, long release)
        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.exponentialRampToValueAtTime(0.09 / freqs.length, now + 2.0);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.gainNode);

        osc.start(now);
        osc.stop(now + duration + 0.5);

        this.activeOscillators.push(osc);
      });

      this.timerId = setTimeout(playNextChord, (duration - 1.2) * 1000);
    };

    playNextChord();
  }

  private stopSynth() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Already stopped
      }
    });
    this.activeOscillators = [];
  }
}

export const ambientAudioService = new AmbientAudioService();
