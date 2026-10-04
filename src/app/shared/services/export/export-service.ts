import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { downloadBlob, parseContentDispositionFilename } from '../../functions';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  private http = inject(HttpClient);

  export(url: string, name: string): Observable<void> {
    console.log('export', url, name);
    return this.http.get(url, { responseType: 'blob', observe: 'response' }).pipe(
      map((res) => {
        if (!res.body) {
          throw new Error('Empty export file');
        }
        const filename = `${name}.xlsx`;
        console.log('filename', filename);
        downloadBlob(res.body, filename);
      }),
    );
  }
}
