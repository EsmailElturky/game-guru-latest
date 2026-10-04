import {
  Directive,
  ElementRef,
  HostListener,
  OnInit,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Directive to convert Arabic numerals to English numerals in input fields.
 * Supports PrimeNG InputNumber and standard HTML input elements.
 *
 * Arabic numerals: ٠ ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩
 * English numerals: 0 1 2 3 4 5 6 7 8 9
 *
 * Usage:
 * <input uikitArabicToEnglish />
 * <p-inputNumber uikitArabicToEnglish></p-inputNumber>
 */
@Directive({
  selector: '[uikitArabicToEnglish]',
  standalone: true,
})
export class ArabicToEnglishDirective implements OnInit, OnDestroy {
  private readonly arabicToEnglishMap: Record<string, string> = {
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9',
  };

  private readonly arabicDigitsRegex = /[٠-٩]/g;
  private destroy$ = new Subject<void>();

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    // Handle the case where the input already has a value on initialization
    this.convertInputValue();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handles input event (typing, pasting, etc.)
   */
  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    this.convertAndDispatchEvent(event);
  }

  /**
   * Handles paste event
   */
  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const pastedText = event.clipboardData?.getData('text') || '';
    const convertedText = this.convertArabicToEnglish(pastedText);

    const input = this.getInputElement();
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const currentValue = input.value;

      // Insert the converted text at the cursor position
      const newValue =
        currentValue.substring(0, start) +
        convertedText +
        currentValue.substring(end);

      this.renderer.setProperty(input, 'value', newValue);

      // Set cursor position after the inserted text
      const newCursorPosition = start + convertedText.length;
      requestAnimationFrame(() => {
        input.setSelectionRange(newCursorPosition, newCursorPosition);
      });

      // Dispatch events
      this.dispatchInputEvent(input);
      this.dispatchChangeEvent(input);
    }
  }

  /**
   * Handles keydown event to prevent invalid characters
   */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const input = this.getInputElement();
    if (!input) return;

    // Check if the key being pressed is an Arabic digit
    if (this.arabicDigitsRegex.test(event.key)) {
      event.preventDefault();
      const convertedKey = this.convertArabicToEnglish(event.key);

      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const currentValue = input.value;

      // Insert the converted key at the cursor position
      const newValue =
        currentValue.substring(0, start) +
        convertedKey +
        currentValue.substring(end);

      this.renderer.setProperty(input, 'value', newValue);

      // Set cursor position after the inserted character
      requestAnimationFrame(() => {
        input.setSelectionRange(start + 1, start + 1);
      });

      // Dispatch events
      this.dispatchInputEvent(input);
      this.dispatchChangeEvent(input);
    }
  }

  /**
   * Handles change event
   */
  @HostListener('change', ['$event'])
  onChange(event: Event): void {
    this.convertAndDispatchEvent(event);
  }

  /**
   * Handles blur event
   */
  @HostListener('blur', ['$event'])
  onBlur(event: Event): void {
    this.convertAndDispatchEvent(event);
  }

  /**
   * Converts input value and dispatches events
   */
  private convertAndDispatchEvent(event: Event): void {
    const input = this.getInputElement();
    if (!input) return;

    const originalValue = input.value;
    const convertedValue = this.convertArabicToEnglish(originalValue);

    if (originalValue !== convertedValue) {
      this.renderer.setProperty(input, 'value', convertedValue);

      // Preserve cursor position if possible
      const cursorPosition = input.selectionStart || 0;
      requestAnimationFrame(() => {
        input.setSelectionRange(cursorPosition, cursorPosition);
      });

      // Dispatch events
      this.dispatchInputEvent(input);
      this.dispatchChangeEvent(input);
    }
  }

  /**
   * Converts Arabic numerals to English numerals
   */
  private convertArabicToEnglish(text: string): string {
    return text.replace(this.arabicDigitsRegex, (match) => {
      return this.arabicToEnglishMap[match] || match;
    });
  }

  /**
   * Converts the input element's current value
   */
  private convertInputValue(): void {
    const input = this.getInputElement();
    if (!input) return;

    const originalValue = input.value;
    const convertedValue = this.convertArabicToEnglish(originalValue);

    if (originalValue !== convertedValue) {
      this.renderer.setProperty(input, 'value', convertedValue);
    }
  }

  /**
   * Gets the input element from the host
   */
  private getInputElement(): HTMLInputElement | null {
    const element = this.elementRef.nativeElement;

    // If the element itself is an input, return it
    if (element.tagName === 'INPUT') {
      return element;
    }

    // If it's a PrimeNG InputNumber, find the input inside it
    const inputElement = element.querySelector('input');
    return inputElement;
  }

  /**
   * Dispatches an input event
   */
  private dispatchInputEvent(element: HTMLInputElement): void {
    const inputEvent = new Event('input', { bubbles: true });
    element.dispatchEvent(inputEvent);
  }

  /**
   * Dispatches a change event
   */
  private dispatchChangeEvent(element: HTMLInputElement): void {
    const changeEvent = new Event('change', { bubbles: true });
    element.dispatchEvent(changeEvent);
  }
}
