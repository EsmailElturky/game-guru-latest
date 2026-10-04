import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionAction } from '../enums/permission-action.enum';
import { PermissionService } from '../services/permission/permission.service';

/**
 * Structural directive: renders content when the user has the given page action.
 *
 * @example
 * <button *hasPermission="AppPage.PromoCodes; action: PermissionAction.Add">Add</button>
 */
@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly permissionService = inject(PermissionService);

  readonly page = input.required<string>({ alias: 'hasPermission' });
  readonly action = input<PermissionAction>(PermissionAction.View);

  constructor() {
    effect(() => {
      const page = this.page();
      const action = this.action();
      const allowed = this.permissionService.hasAction(page, action);

      this.viewContainer.clear();
      if (allowed) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}
