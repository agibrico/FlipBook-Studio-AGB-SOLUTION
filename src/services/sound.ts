// Realistic paper flip audio synthesizer using Web Audio API
class FlipSoundEngine {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private listeners: Array<(muted: boolean) => void> = [];

  constructor() {
    // Setup automatic resume listener on first user interaction for mobile Safari / Chrome
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
      window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
      window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.notifyListeners();
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.notifyListeners();
  }

  public subscribe(cb: (muted: boolean) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.isMuted);
      } catch {
        // ignore
      }
    });
  }

  /**
   * Synthesize a hyper-realistic paper turning sound:
   * Layer 1: Crisp paper surface friction / texture brush (high frequency noise)
   * Layer 2: Aerodynamic page swoosh as leaf curves through air (resonant bandpass sweep)
   * Layer 3: Soft paper contact/settle as page lands against opposite stack
   */
  public playFlip() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const duration = 0.32;
      const sampleRate = ctx.sampleRate;

      // Slight organic randomized variance (+/- 7%) so each flip is uniquely tactile
      const pitchVariance = 0.93 + Math.random() * 0.14;
      const speedVariance = 0.95 + Math.random() * 0.1;

      // Master output gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.7, now);
      masterGain.connect(ctx.destination);

      // --- LAYER 1: Tactile paper friction / crisp rustle ---
      const noiseBuffer = ctx.createBuffer(1, Math.floor(sampleRate * 0.18), sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < noiseData.length; i++) {
        const white = Math.random() * 2 - 1;
        // Pink noise filter
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        const pink = b0 + b1 + b2 + white * 0.5362;
        noiseData[i] = pink * 0.18;
      }

      const frictionSource = ctx.createBufferSource();
      frictionSource.buffer = noiseBuffer;

      const frictionFilter = ctx.createBiquadFilter();
      frictionFilter.type = 'bandpass';
      frictionFilter.frequency.setValueAtTime(3200 * pitchVariance, now);
      frictionFilter.frequency.exponentialRampToValueAtTime(1400 * pitchVariance, now + 0.14);
      frictionFilter.Q.setValueAtTime(2.2, now);

      const frictionGain = ctx.createGain();
      frictionGain.gain.setValueAtTime(0.001, now);
      frictionGain.gain.linearRampToValueAtTime(0.42, now + 0.025);
      frictionGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      frictionSource.connect(frictionFilter);
      frictionFilter.connect(frictionGain);
      frictionGain.connect(masterGain);

      frictionSource.start(now);
      frictionSource.stop(now + 0.16);

      // --- LAYER 2: Aerodynamic leaf swoosh (paper moving through air) ---
      const swooshBuffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
      const swooshData = swooshBuffer.getChannelData(0);
      let lastVal = 0;
      for (let i = 0; i < swooshData.length; i++) {
        const white = Math.random() * 2 - 1;
        lastVal = (lastVal + 0.03 * white) / 1.03;
        swooshData[i] = lastVal * 2.2;
      }

      const swooshSource = ctx.createBufferSource();
      swooshSource.buffer = swooshBuffer;

      const swooshFilter = ctx.createBiquadFilter();
      swooshFilter.type = 'bandpass';
      swooshFilter.frequency.setValueAtTime(750 * pitchVariance, now);
      swooshFilter.frequency.exponentialRampToValueAtTime(2100 * pitchVariance, now + 0.09 * speedVariance);
      swooshFilter.frequency.exponentialRampToValueAtTime(450 * pitchVariance, now + duration);
      swooshFilter.Q.setValueAtTime(1.6, now);

      const swooshGain = ctx.createGain();
      swooshGain.gain.setValueAtTime(0.001, now);
      swooshGain.gain.linearRampToValueAtTime(0.38, now + 0.05);
      swooshGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      swooshSource.connect(swooshFilter);
      swooshFilter.connect(swooshGain);
      swooshGain.connect(masterGain);

      swooshSource.start(now);
      swooshSource.stop(now + duration);

      // --- LAYER 3: Soft paper contact / landing settle ---
      const settleBuffer = ctx.createBuffer(1, Math.floor(sampleRate * 0.1), sampleRate);
      const settleData = settleBuffer.getChannelData(0);
      for (let i = 0; i < settleData.length; i++) {
        settleData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.018));
      }

      const settleSource = ctx.createBufferSource();
      settleSource.buffer = settleBuffer;

      const settleFilter = ctx.createBiquadFilter();
      settleFilter.type = 'lowpass';
      settleFilter.frequency.setValueAtTime(380 * pitchVariance, now + 0.18);
      settleFilter.Q.setValueAtTime(1.2, now + 0.18);

      const settleGain = ctx.createGain();
      settleGain.gain.setValueAtTime(0.001, now + 0.18);
      settleGain.gain.linearRampToValueAtTime(0.18, now + 0.20);
      settleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      settleSource.connect(settleFilter);
      settleFilter.connect(settleGain);
      settleGain.connect(masterGain);

      settleSource.start(now + 0.18);
      settleSource.stop(now + 0.29);
    } catch {
      // Audio playback not allowed or unsupported in current environment
    }
  }
}

export const soundEngine = new FlipSoundEngine();
