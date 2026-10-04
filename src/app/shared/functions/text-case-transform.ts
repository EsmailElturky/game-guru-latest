import { TextCaseEnum } from '../enums';

/**
 * @param value, value written in question input
 * @param textCase, text case of the field
 * @description this function is used to handle the text transformation based on field text case properties
 * @returns question after transformation
 */
export function textCaseTransform(
  value: string,
  textCase: TextCaseEnum
): string {
  switch (textCase) {
    case TextCaseEnum.UpperCase:
      return value.toUpperCase();
    case TextCaseEnum.LowerCase:
      return value.toLowerCase();
    default:
      return value;
  }
}
