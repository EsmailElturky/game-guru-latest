export const tablePreset = {
  headerCell: {
    background: '{surface.300}',
    borderColor: '{datatable.border.color}',
    color: '{content.color}',
    borderWidth: '0 0 1px 0',
    padding: '0.75rem 1rem',
    sm: {
      padding: '0.75rem 0.5rem',
    },
    lg: {
      padding: '1rem 1.25rem',
    },
  },
  css: () => `
  .p-datatable {
    border: 1px solid  var(--form-field-border-color);
    border-radius: var(--form-field-border-radius);
    padding: var(--spacing-sm);
    flex: 1;
    .p-paginator {
        justify-content: space-between !important;
        border-radius: var(--form-field-border-radius) !important;
    }
  }
  .p-datatable-flex-scrollable {
    justify-content: space-between;
    .p-datatable-table-container {
        flex: unset;
        height: unset;
      }
    }

    .p-datatable-table-container {
    border-radius: var(--form-field-border-radius);
    }

    `,
};
