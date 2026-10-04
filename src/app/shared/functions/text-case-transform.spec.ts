import { textCaseTransform } from './text-case-transform';
import { TextCaseEnum } from '../enums';

describe('textCaseTransform', () => {
  it('should transform text to uppercase when TextCaseEnum.UpperCase is provided', () => {
    // Arrange
    const inputText = 'Sample Text';
    const expectedOutput = 'SAMPLE TEXT';
    // Act
    const result = textCaseTransform(inputText, TextCaseEnum.UpperCase);
    // Assert
    expect(result).toBe(expectedOutput);
  });

  it('should transform text to lowercase when TextCaseEnum.LowerCase is provided', () => {
    // Arrange
    const inputText = 'Sample Text';
    const expectedOutput = 'sample text';
    // Act
    const result = textCaseTransform(inputText, TextCaseEnum.LowerCase);
    // Assert
    expect(result).toBe(expectedOutput);
  });

  it('should return the original text when TextCaseEnum.Mixed is provided', () => {
    // Arrange
    const inputText = 'Sample Text';
    const expectedOutput = 'Sample Text';
    // Act
    const result = textCaseTransform(inputText, TextCaseEnum.Mixed);
    // Assert
    expect(result).toBe(expectedOutput);
  });

  it('should handle empty strings correctly', () => {
    // Arrange
    const inputText = '';
    // Act & Assert
    expect(textCaseTransform(inputText, TextCaseEnum.UpperCase)).toBe('');
    expect(textCaseTransform(inputText, TextCaseEnum.LowerCase)).toBe('');
    expect(textCaseTransform(inputText, TextCaseEnum.Mixed)).toBe('');
  });

  it('should handle strings with special characters and numbers', () => {
    // Arrange
    const inputText = 'Sample123 !@#$%^&*() Text';
    // Act & Assert
    expect(textCaseTransform(inputText, TextCaseEnum.UpperCase)).toBe('SAMPLE123 !@#$%^&*() TEXT');
    expect(textCaseTransform(inputText, TextCaseEnum.LowerCase)).toBe('sample123 !@#$%^&*() text');
    expect(textCaseTransform(inputText, TextCaseEnum.Mixed)).toBe('Sample123 !@#$%^&*() Text');
  });
});
