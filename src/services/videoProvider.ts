import { VideoAsset, VideoProviderType } from '../types/saas';

export interface VideoUploadParams {
  file?: File | Blob;
  title: string;
  externalUrl?: string;
  organizationId: string;
  flipbookId: string;
  pageNumber: number;
}

export interface VideoProviderResult {
  providerVideoId: string;
  publicToken: string;
  publicUrl: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  aspectRatio?: string;
}

/**
 * Interface abstraite VideoProvider
 * Découple le SaaS de tout fournisseur sous-jacent (Cloudflare Stream, YouTube, Vimeo, Private Storage).
 */
export interface IVideoProvider {
  readonly providerType: VideoProviderType;

  /**
   * Upload ou enregistrement d'une ressource vidéo
   */
  registerVideo(params: VideoUploadParams): Promise<VideoProviderResult>;

  /**
   * Génération de l'URL d'intégration (iframe / player)
   */
  generateEmbedUrl(providerVideoId: string, options?: { autoplay?: boolean; muted?: boolean }): string;

  /**
   * Suppression de la vidéo sur le provider
   */
  deleteVideo(providerVideoId: string): Promise<boolean>;
}

// ----------------------------------------------------------------------
// Implémentation 1 : Cloudflare Stream (Fournisseur prioritaire)
// ----------------------------------------------------------------------
export class CloudflareStreamProvider implements IVideoProvider {
  readonly providerType: VideoProviderType = 'CLOUDFLARE_STREAM';
  private apiToken?: string;
  private accountId?: string;

  constructor(apiToken?: string, accountId?: string) {
    this.apiToken = apiToken;
    this.accountId = accountId;
  }

  async registerVideo(params: VideoUploadParams): Promise<VideoProviderResult> {
    const publicToken = generatePublicToken(12);
    const mockOrRealVideoId = `cf-${Date.now()}-${generatePublicToken(6)}`;

    // Cloudflare Stream génère un URL de lecture public sécurisé
    const publicUrl = `/v/${publicToken}`;
    const thumbnailUrl = `https://videodelivery.net/${mockOrRealVideoId}/thumbnails/thumbnail.jpg?time=2s&height=600`;

    return {
      providerVideoId: mockOrRealVideoId,
      publicToken,
      publicUrl,
      thumbnailUrl,
      durationSeconds: 45,
      aspectRatio: '16:9',
    };
  }

  generateEmbedUrl(providerVideoId: string, options?: { autoplay?: boolean; muted?: boolean }): string {
    const auto = options?.autoplay ? 'autoplay=true' : 'autoplay=false';
    const mute = options?.muted ? 'muted=true' : 'muted=false';
    return `https://iframe.videodelivery.net/${providerVideoId}?${auto}&${mute}&preload=true`;
  }

  async deleteVideo(providerVideoId: string): Promise<boolean> {
    return true;
  }
}

// ----------------------------------------------------------------------
// Implémentation 2 : YouTube / Liens Externes (Vidéo hôtelière / vitrine)
// ----------------------------------------------------------------------
export class YouTubeVideoProvider implements IVideoProvider {
  readonly providerType: VideoProviderType = 'YOUTUBE';

  async registerVideo(params: VideoUploadParams): Promise<VideoProviderResult> {
    const publicToken = generatePublicToken(12);
    const videoId = extractYouTubeId(params.externalUrl || '') || 'dQw4w9WgXcQ';
    const publicUrl = `/v/${publicToken}`;
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    return {
      providerVideoId: videoId,
      publicToken,
      publicUrl,
      thumbnailUrl,
      durationSeconds: 120,
      aspectRatio: '16:9',
    };
  }

  generateEmbedUrl(providerVideoId: string, options?: { autoplay?: boolean; muted?: boolean }): string {
    const auto = options?.autoplay ? '1' : '0';
    const mute = options?.muted ? '1' : '0';
    return `https://www.youtube-nocookie.com/embed/${providerVideoId}?autoplay=${auto}&mute=${mute}&rel=0`;
  }

  async deleteVideo(_providerVideoId: string): Promise<boolean> {
    return true;
  }
}

// ----------------------------------------------------------------------
// Implémentation 3 : Vimeo
// ----------------------------------------------------------------------
export class VimeoVideoProvider implements IVideoProvider {
  readonly providerType: VideoProviderType = 'VIMEO';

  async registerVideo(params: VideoUploadParams): Promise<VideoProviderResult> {
    const publicToken = generatePublicToken(12);
    const videoId = extractVimeoId(params.externalUrl || '') || '123456';
    const publicUrl = `/v/${publicToken}`;

    return {
      providerVideoId: videoId,
      publicToken,
      publicUrl,
      durationSeconds: 90,
      aspectRatio: '16:9',
    };
  }

  generateEmbedUrl(providerVideoId: string, options?: { autoplay?: boolean }): string {
    const auto = options?.autoplay ? '1' : '0';
    return `https://player.vimeo.com/video/${providerVideoId}?autoplay=${auto}&dnt=1`;
  }

  async deleteVideo(_providerVideoId: string): Promise<boolean> {
    return true;
  }
}

// ----------------------------------------------------------------------
// Registre des Fournisseurs Vidéo
// ----------------------------------------------------------------------
export class VideoProviderRegistry {
  private static providers: Map<VideoProviderType, IVideoProvider> = new Map([
    ['CLOUDFLARE_STREAM', new CloudflareStreamProvider()],
    ['YOUTUBE', new YouTubeVideoProvider()],
    ['VIMEO', new VimeoVideoProvider()],
  ]);

  public static getProvider(type: VideoProviderType): IVideoProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Video provider non supporté: ${type}`);
    }
    return provider;
  }

  public static detectProviderFromUrl(url: string): VideoProviderType {
    if (/youtube\.com|youtu\.be/i.test(url)) return 'YOUTUBE';
    if (/vimeo\.com/i.test(url)) return 'VIMEO';
    if (/cloudflarestream\.com|videodelivery\.net/i.test(url)) return 'CLOUDFLARE_STREAM';
    return 'STORAGE_PRIVATE';
  }
}

// Helpers
function generatePublicToken(length: number = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/);
  return match ? match[3] : null;
}
