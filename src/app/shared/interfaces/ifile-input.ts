import { FileInputErrorEnum, FilePreviewTypeEnum } from '../enums';

/**
 * File validation configuration
 */
export interface IFileValidation {
  /**
   * Maximum file size in bytes
   */
  maxFileSize?: number;

  /**
   * Maximum number of files
   */
  maxFiles?: number;

  /**
   * Allowed file types (MIME types)
   * Example: ['image/jpeg', 'image/png', 'application/pdf']
   */
  allowedFileTypes?: string[];

  /**
   * Allowed file extensions
   * Example: ['.jpg', '.png', '.pdf']
   */
  allowedExtensions?: string[];

  /**
   * Minimum image width (for image files)
   */
  minImageWidth?: number;

  /**
   * Minimum image height (for image files)
   */
  minImageHeight?: number;

  /**
   * Maximum image width (for image files)
   */
  maxImageWidth?: number;

  /**
   * Maximum image height (for image files)
   */
  maxImageHeight?: number;
}

/**
 * File preview data
 */
export interface IFilePreview {
  /**
   * File object
   */
  file: File;

  /**
   * Preview URL (for images, videos, etc.)
   */
  previewUrl?: string;

  /**
   * Preview type
   */
  previewType: FilePreviewTypeEnum;

  /**
   * File size in bytes
   */
  size: number;

  /**
   * File name
   */
  name: string;

  /**
   * File MIME type
   */
  mimeType: string;

  /**
   * Image dimensions (if applicable)
   */
  dimensions?: {
    width: number;
    height: number;
  };

  /**
   * Upload progress (0-100)
   */
  uploadProgress?: number;

  /**
   * Upload status
   */
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';

  /**
   * Error message (if upload failed)
   */
  errorMessage?: string;
}

/**
 * File input error
 */
export interface IFileInputError {
  /**
   * Error type
   */
  type: FileInputErrorEnum;

  /**
   * Error message
   */
  message: string;

  /**
   * File that caused the error (if applicable)
   */
  file?: File;

  /**
   * Additional error details
   */
  details?: any;
}

/**
 * File input configuration
 */
export interface IFileInputConfig {
  /**
   * Input ID
   */
  inputId?: string;

  /**
   * Input name
   */
  inputName?: string;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Allow multiple file selection
   */
  multiple?: boolean;

  /**
   * Show file previews
   */
  showPreview?: boolean;

  /**
   * Show file list
   */
  showFileList?: boolean;

  /**
   * Drag and drop enabled
   */
  dragDropEnabled?: boolean;

  /**
   * File validation rules
   */
  validation?: IFileValidation;

  /**
   * Custom error messages
   */
  errorMessages?: {
    [key in FileInputErrorEnum]?: string;
  };

  /**
   * Show toaster notifications
   */
  showToaster?: boolean;

  /**
   * Auto upload files
   */
  autoUpload?: boolean;

  /**
   * Upload endpoint URL
   */
  uploadUrl?: string;

  /**
   * Custom upload headers
   */
  uploadHeaders?: { [key: string]: string };

  /**
   * Custom upload parameters
   */
  uploadParams?: { [key: string]: any };

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Read-only state
   */
  readonly?: boolean;
}
