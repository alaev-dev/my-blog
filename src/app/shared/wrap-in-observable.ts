import { Observable, from, of } from 'rxjs';

export function wrapInObservable<T>(data: Promise<T> | T): Observable<T> {
  if (data instanceof Promise) {
    return from(data);
  }

  return of(data);
}
