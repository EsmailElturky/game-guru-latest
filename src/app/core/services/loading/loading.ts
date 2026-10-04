import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Loading {
  private activeRequests = signal<number>(0);

  readonly isLoading = computed(() => this.activeRequests() > 0);

  start(): void {
    this.activeRequests.update(v => v + 1);
  }

  stop(): void {
    this.activeRequests.update(v => Math.max(0, v - 1));
  }

}
