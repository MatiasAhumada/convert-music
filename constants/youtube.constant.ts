export const YOUTUBE_CONSTANTS = {
  MESSAGES: {
    INVALID_URL: 'URL de YouTube inválida',
    DOWNLOAD_ERROR: 'Error al procesar el video',
    MISSING_URL: 'URL requerida',
    PROCESSING: 'Convirtiendo...',
    READY: 'Convertir a MP3',
  },
  REGEX: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
  TIMEOUT: 300000,
} as const;

export const HTTP_HEADERS = {
  CONTENT_TYPE_MP3: 'audio/mpeg',
  CONTENT_DISPOSITION: 'attachment; filename="audio.mp3"',
} as const;
