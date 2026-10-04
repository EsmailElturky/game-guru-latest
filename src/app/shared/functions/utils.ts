import { FormControl } from '@angular/forms';
import { FileInputErrorEnum, FilePreviewTypeEnum } from '../enums';
import { IFileValidation, IFileInputError, IFilePreview } from '../interfaces';

/**
 * File utility functions for file input handling
 */
export class FileUtils {
  /**
   * Get file preview type based on MIME type
   */
  static getPreviewType(mimeType: string): FilePreviewTypeEnum {
    if (mimeType.startsWith('image/')) {
      return FilePreviewTypeEnum.IMAGE;
    }
    if (mimeType.startsWith('video/')) {
      return FilePreviewTypeEnum.VIDEO;
    }
    if (mimeType.startsWith('audio/')) {
      return FilePreviewTypeEnum.AUDIO;
    }
    if (
      mimeType.includes('pdf') ||
      mimeType.includes('word') ||
      mimeType.includes('sheet') ||
      mimeType.includes('presentation')
    ) {
      return FilePreviewTypeEnum.DOCUMENT;
    }
    return FilePreviewTypeEnum.UNKNOWN;
  }

  /**
   * Get file extension from file name
   */
  static getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    if (lastDot === -1) return '';
    return fileName.substring(lastDot).toLowerCase();
  }

  /**
   * Format file size to human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Validate file against validation rules
   */
  static validateFile(file: File, validation?: IFileValidation): IFileInputError | null {
    if (!validation) return null;

    // Check file size
    if (validation.maxFileSize && file.size > validation.maxFileSize) {
      return {
        type: FileInputErrorEnum.FILE_TOO_LARGE,
        message: `File size exceeds maximum allowed size of ${FileUtils.formatFileSize(
          validation.maxFileSize,
        )}`,
        file,
      };
    }

    // Check file type
    if (validation.allowedFileTypes && validation.allowedFileTypes.length > 0) {
      if (!validation.allowedFileTypes.includes(file.type)) {
        return {
          type: FileInputErrorEnum.INVALID_FILE_TYPE,
          message: `File type ${file.type} is not allowed`,
          file,
        };
      }
    }

    // Check file extension
    if (validation.allowedExtensions && validation.allowedExtensions.length > 0) {
      const extension = FileUtils.getFileExtension(file.name);
      if (!validation.allowedExtensions.includes(extension)) {
        return {
          type: FileInputErrorEnum.INVALID_FILE_TYPE,
          message: `File extension ${extension} is not allowed`,
          file,
        };
      }
    }

    return null;
  }

  /**
   * Create file preview
   */
  static async createFilePreview(file: File): Promise<IFilePreview> {
    const previewType = FileUtils.getPreviewType(file.type);
    const preview: IFilePreview = {
      file,
      previewType,
      size: file.size,
      name: file.name,
      mimeType: file.type,
      uploadStatus: 'pending',
    };

    // Create preview URL for images and videos
    if (previewType === FilePreviewTypeEnum.IMAGE || previewType === FilePreviewTypeEnum.VIDEO) {
      preview.previewUrl = URL.createObjectURL(file);

      // Get image dimensions if it's an image
      if (previewType === FilePreviewTypeEnum.IMAGE) {
        try {
          preview.dimensions = await FileUtils.getImageDimensions(file);
        } catch (error) {
          console.error('Error getting image dimensions:', error);
        }
      }
    }

    return preview;
  }

  /**
   * Get image dimensions
   */
  static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        img.src = event.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Validate image dimensions
   */
  static validateImageDimensions(
    dimensions: { width: number; height: number },
    validation?: IFileValidation,
  ): IFileInputError | null {
    if (!validation) return null;

    if (validation.minImageWidth && dimensions.width < validation.minImageWidth) {
      return {
        type: FileInputErrorEnum.INVALID_DIMENSIONS,
        message: `Image width must be at least ${validation.minImageWidth}px`,
      };
    }

    if (validation.minImageHeight && dimensions.height < validation.minImageHeight) {
      return {
        type: FileInputErrorEnum.INVALID_DIMENSIONS,
        message: `Image height must be at least ${validation.minImageHeight}px`,
      };
    }

    if (validation.maxImageWidth && dimensions.width > validation.maxImageWidth) {
      return {
        type: FileInputErrorEnum.INVALID_DIMENSIONS,
        message: `Image width must not exceed ${validation.maxImageWidth}px`,
      };
    }

    if (validation.maxImageHeight && dimensions.height > validation.maxImageHeight) {
      return {
        type: FileInputErrorEnum.INVALID_DIMENSIONS,
        message: `Image height must not exceed ${validation.maxImageHeight}px`,
      };
    }

    return null;
  }

  /**
   * Check if file is corrupt (basic check)
   */
  static async checkFileIntegrity(file: File): Promise<boolean> {
    try {
      const buffer = await file.arrayBuffer();
      return buffer.byteLength > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get default error message
   */
  static getDefaultErrorMessage(errorType: FileInputErrorEnum): string {
    const messages: { [key in FileInputErrorEnum]: string } = {
      [FileInputErrorEnum.FILE_TOO_LARGE]: 'File size is too large',
      [FileInputErrorEnum.INVALID_FILE_TYPE]: 'Invalid file type',
      [FileInputErrorEnum.MAX_FILES_EXCEEDED]: 'Maximum number of files exceeded',
      [FileInputErrorEnum.NO_FILE_SELECTED]: 'No file selected',
      [FileInputErrorEnum.UPLOAD_FAILED]: 'File upload failed',
      [FileInputErrorEnum.INVALID_DIMENSIONS]: 'Invalid file dimensions',
      [FileInputErrorEnum.CORRUPT_FILE]: 'File appears to be corrupt',
    };

    return messages[errorType] || 'Unknown error';
  }
}

export function generateRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export type Formify<T> = {
  [K in keyof T]: FormControl<T[K] | null>;
};

export type ToFormDataOptions = {
  /**
   * How to serialize plain nested objects and **arrays of plain objects** (model-binding style).
   * - `'json'` (default): nested objects and homogeneous arrays of objects → `JSON.stringify` (backwards compatible).
   * - `'dot'`: flatten with bracket + dotted keys, e.g.
   *   - `{ User: { Password: 'x' } }` → `User.Password`
   *   - `{ Facilities: [{ Name: 'a', Sports: [1, 2] }] }` → `Facilities[0].Name`, `Facilities[0].Sports[0]`, …
   *   Use property casing your API expects (`Name` vs `name`); many .NET binders are case-insensitive.
   */
  nestedObjects?: 'json' | 'dot';
};

/**
 * Recursively appends nested values using `Parent.Child` / `Parent[0].Child` / `Parent[0].Sports[1]` style keys.
 */
function appendWithDotNotation(formData: FormData, prefix: string, value: unknown): void {
  if (value == null) return;

  if (value instanceof File) {
    formData.append(prefix, value);
    return;
  }
  if (value instanceof Blob) {
    formData.append(prefix, value);
    return;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return;
    value.forEach((item, index) => {
      if (item == null) return;
      appendWithDotNotation(formData, `${prefix}[${index}]`, item);
    });
    return;
  }
  if (value instanceof Date) {
    formData.append(prefix, value.toISOString());
    return;
  }
  if (typeof value === 'object') {
    const o = value as Record<string, unknown>;
    const keys = Object.keys(o);
    if (keys.length === 0) return;
    for (const k of keys) {
      appendWithDotNotation(formData, `${prefix}.${k}`, o[k]);
    }
    return;
  }

  formData.append(prefix, String(value));
}

/**
 * Builds `FormData` from a record. Values are appended as:
 * - `File` / `Blob`: binary parts
 * - arrays (root): with `nestedObjects: 'dot'`, homogeneous arrays of plain objects flatten to `Key[i].Prop`;
 *   otherwise JSON array of plain objects, or repeated keys for files / mixed arrays
 * - `Date`: ISO string
 * - other objects: see {@link ToFormDataOptions.nestedObjects}
 * - primitives: `String(value)`
 */
export function toFormData(obj: Record<string, unknown>, options?: ToFormDataOptions): FormData {
  const formData = new FormData();
  const nestedMode = options?.nestedObjects ?? 'json';

  for (const key of Object.keys(obj)) {
    const value = obj[key];

    if (value == null) continue;

    if (value instanceof File) {
      formData.append(key, value);
    } else if (value instanceof Blob) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        continue;
      }
      const hasFileOrBlob = value.some((item) => item instanceof File || item instanceof Blob);
      const allPlainObjects = value.every(
        (item) =>
          item !== null &&
          typeof item === 'object' &&
          !(item instanceof File) &&
          !(item instanceof Blob) &&
          !(item instanceof Date),
      );
      if (nestedMode === 'dot' && allPlainObjects && !hasFileOrBlob) {
        appendWithDotNotation(formData, key, value);
      } else if (allPlainObjects && !hasFileOrBlob) {
        formData.append(key, JSON.stringify(value));
      } else {
        for (const item of value) {
          if (item instanceof File || item instanceof Blob) {
            formData.append(key, item);
          } else if (item !== null && typeof item === 'object' && !(item instanceof Date)) {
            formData.append(key, JSON.stringify(item));
          } else if (item != null) {
            formData.append(key, String(item));
          }
        }
      }
    } else if (value instanceof Date) {
      formData.append(key, value.toISOString());
    } else if (typeof value === 'object') {
      if (nestedMode === 'dot') {
        appendWithDotNotation(formData, key, value);
      } else {
        formData.append(key, JSON.stringify(value));
      }
    } else {
      formData.append(key, String(value));
    }
  }

  return formData;
}

// transform date from 2020-04-06T22:00:00.000Z to MM/dd/yyyy
// if 5/1/2020 then should be 05/01/2020
export function transformDate(dateStr: string): string {
  const date = new Date(dateStr);

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}

// transform date from 2020-04-06T22:00:00.000Z to MM/dd/yyyy HH:mm - HH:mm
export function formatDateRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const date = start.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
  const startTime = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const endTime = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${date} ${startTime} - ${endTime}`;
}

// extract code +20 from (+20)1016396028
export function extractCode(phoneNumber: string): string {
  return phoneNumber.split(')')[0].replace('(', '');
}

// extract number 1016396028 from (+20)1016396028
export function extractNumber(phoneNumber: string): string {
  return phoneNumber.split(')')[1].replace(' ', '');
}

/** LTR isolate (U+2066/U+2069) so digits/Latin stay left-to-right in RTL layouts. */
export function ltrIsolate(value: string | null | undefined): string {
  if (value == null) return '';
  const s = String(value);
  if (s === '') return '';
  return `\u2066${s}\u2069`;
}

export function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 1) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  const visible = Math.min(3, local.length);
  return `${local.slice(0, visible)}****${domain}`;
}

/** Parse filename from Content-Disposition (supports filename*=UTF-8''). */
export function parseContentDispositionFilename(header: string | null): string | null {
  if (!header) return null;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1].trim());
    } catch {
      return utf8[1].trim();
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain?.[1]?.trim() ?? null;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.click();
  URL.revokeObjectURL(url);
}
