/**
 * File input error types
 */
export enum FileInputErrorEnum {
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  MAX_FILES_EXCEEDED = 'MAX_FILES_EXCEEDED',
  NO_FILE_SELECTED = 'NO_FILE_SELECTED',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  INVALID_DIMENSIONS = 'INVALID_DIMENSIONS',
  CORRUPT_FILE = 'CORRUPT_FILE',
}

/**
 * File preview types
 */
export enum FilePreviewTypeEnum {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  UNKNOWN = 'unknown',
}
