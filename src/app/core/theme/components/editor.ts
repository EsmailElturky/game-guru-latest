export const editorPreset = {
  toolbar: {
    borderColor: '{form.field.border.color}',
  },
  overlay: {
    borderColor: '{form.field.border.color}',
  },
  overlayOption: {
    color: '{text.muted.color}',
    hoverColor: '{text.color}',
    activeColor: '{primary.color}',
  },
  content: {
    borderColor: '{form.field.border.color}',
  },
  css: () => `
  .p-editor-content {
    min-height: 250px !important;
  }
    .p-editor .p-editor-content .ql-editor {
      min-height: 250px !important;
    }
  `,
};
