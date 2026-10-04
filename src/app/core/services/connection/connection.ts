import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Connection {
  public connected = signal<boolean>(true);

  constructor() {
    this.checkConnection();
  }

  private checkConnection() {
    window.addEventListener('online', () => this.connected.set(true));
    window.addEventListener('offline', () => this.connected.set(false));
    this.connected.set(navigator.onLine);
  }
}
