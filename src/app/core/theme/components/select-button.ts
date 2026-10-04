export const selectbutton = {
  css: () => `

        app-dashboard {
        .p-selectbutton {
          gap: 0.5rem !important;
        }
      }

    .p-togglebutton {
      background-color: var(--surface-0) !important;
      border: 1px solid var(--surface-300) !important;
      border-radius: var(--border-radius-sm) !important;
      .p-togglebutton-content {
         background-color: var(--surface-0);
         color: var(--gray-700) !important;
         border-radius: unset;
      }
      &.p-togglebutton-checked {
          background-color: var(--primary-500);
          color: var(--surface-0);
          padding: unset;
          .p-togglebutton-content {
            background-color: var(--primary-500);
            color: var(--surface-0) !important;
            border-radius: var(--border-radius-md);
          }
      }
    }
    .add-notification{
      .p-selectbutton {
        display: flex !important;
        width: 100% !important;
          .p-togglebutton{
            flex: 1 !important;
          }
      }
    }
    `,
};
