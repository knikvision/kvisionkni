export interface UploadedImage {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface ImageMetadata {
  prompt: string;
  model: string;
  resolution: string;
  generationTime: number;
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  resultImageUrl: string | null;
  metadata: ImageMetadata | null;
}

export enum ImageType {
  PERSON = 'PERSON',
  BACKGROUND = 'BACKGROUND',
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}
