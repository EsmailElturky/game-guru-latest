import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@EsmailElturky/ui-kit';

/** Mirrors demo rows on the customers list until a detail API exists. */
const MOCK_CUSTOMERS: {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  status: string;
}[] = [
  {
    id: '1',
    code: 'PAEFEEF6751',
    name: 'Mohamed Alaa (محمد علاء)',
    phone: '(+966) 2345 - 3236 - 656',
    email: 'mohamed@youremail.com',
    status: 'Active',
  },
  {
    id: '2',
    code: 'PAEFEEF6751',
    name: 'Mohamed Alaa (محمد علاء)',
    phone: '(+966) 2345 - 3236 - 656',
    email: 'mohamed@youremail.com',
    status: 'Active',
  },
  {
    id: '3',
    code: 'PAEFEEF6751',
    name: 'Mohamed Alaa (محمد علاء)',
    phone: '(+966) 2345 - 3236 - 656',
    email: 'mohamed@youremail.com',
    status: 'Active',
  },
  {
    id: '4',
    code: 'PAEFEEF6751',
    name: 'Mohamed Alaa (محمد علاء)',
    phone: '(+966) 2345 - 3236 - 656',
    email: 'mohamed@youremail.com',
    status: 'Active',
  },
];

@Component({
  selector: 'app-view-customer',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent],
  templateUrl: './view-customer.html',
  styleUrl: './view-customer.scss',
})
export class ViewCustomer {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  customerId = signal<string | null>(null);
  customer = signal<(typeof MOCK_CUSTOMERS)[0] | null>(null);

  constructor() {
    this.route.paramMap
      .pipe(
        map((pm) => pm.get('id')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((id) => {
        this.customerId.set(id);
        const row = id ? (MOCK_CUSTOMERS.find((c) => c.id === id) ?? null) : null;
        this.customer.set(row);
      });
  }

  back() {
    void this.router.navigate(['/customers']);
  }

  goEdit() {
    const id = this.customerId();
    if (id) {
      void this.router.navigate(['/customers/edit-customer', id]);
    }
  }
}
