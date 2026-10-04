import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, distinctUntilChanged, map, of, switchMap, take, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonComponent } from '@EsmailElturky/ui-kit';
import { environment } from 'src/environments/environment';
import { OrganizationTransactionService } from '../../services/organization-transaction.service';
import { IOrganizationTransactionDetail } from '../../interfaces/organization-transaction.interface';
import { TransactionActionDialogs } from '../../components/transaction-action-dialogs/transaction-action-dialogs';
import { ltrIsolate } from 'src/app/shared/functions';

@Component({
  selector: 'app-organization-transaction-detail',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent, TransactionActionDialogs],
  templateUrl: './organization-transaction-detail.html',
  styleUrl: './organization-transaction-detail.scss',
})
export class OrganizationTransactionDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly organizationTransaction = inject(OrganizationTransactionService);
  private readonly translateService = inject(TranslateService);

  readonly actionDialogs = viewChild.required(TransactionActionDialogs);

  translate = (key: string) => this.translateService.instant(key);

  readonly imageBase = environment.imageApi;

  detail = signal<IOrganizationTransactionDetail | null>(null);
  loadFailed = signal(false);

  constructor() {
    this.route.paramMap
      .pipe(
        tap(() => {
          this.detail.set(null);
          this.loadFailed.set(false);
        }),
        map((pm) => pm.get('organizationId')),
        distinctUntilChanged(),
        switchMap((id) => {
          const n = id ? Number(id) : NaN;
          if (!Number.isFinite(n) || n <= 0) {
            return of(null);
          }
          return this.organizationTransaction.getById(n).pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((d) => {
        const raw = this.route.snapshot.paramMap.get('organizationId');
        const n = raw ? Number(raw) : NaN;
        const hadValidId = Number.isFinite(n) && n > 0;
        if (!hadValidId) {
          this.detail.set(null);
          this.loadFailed.set(true);
          return;
        }
        this.detail.set(d);
        this.loadFailed.set(d === null);
      });
  }

  imageUrl(thumbnail: string | null | undefined): string | null {
    if (!thumbnail?.trim()) return null;
    return `${this.imageBase}/${thumbnail}`;
  }

  phoneLine(d: IOrganizationTransactionDetail): string {
    return ltrIsolate([d.countryCode, d.phoneNumber].filter(Boolean).join(' '));
  }

  back(): void {
    void this.router.navigate(['/requests/new-signups']);
  }

  openApprove(): void {
    const id = this.detail()?.id;
    if (id != null) this.actionDialogs().openApprove(id);
  }

  openDisapprove(): void {
    const id = this.detail()?.id;
    if (id != null) this.actionDialogs().openDisapprove(id);
  }

  onActionsDone(): void {
    const id = this.route.snapshot.paramMap.get('organizationId');
    const n = id ? Number(id) : NaN;
    if (!Number.isFinite(n) || n <= 0) return;
    this.router.navigate(['/requests/new-signups']);
  }
}
