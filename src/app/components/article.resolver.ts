import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ResolveFn } from '@angular/router';
import { marked } from 'marked';
import { map, switchMap } from 'rxjs';
import { API_URL } from '../shared/api';
import { wrapInObservable } from '../shared/wrap-in-observable';

export const articleResolver: ResolveFn<SafeHtml> = (route) => {
  const http = inject(HttpClient);
  const apiUrl = inject(API_URL);
  const sanitizer = inject(DomSanitizer);

  const name = route.paramMap.get('name') ?? '';

  return http
    .get(`${apiUrl}/articles/${name}`, {
      responseType: 'text',
    })
    .pipe(
      map((res) => marked.parse(res)),
      switchMap((content) => wrapInObservable(content)),
      map((html) => sanitizer.bypassSecurityTrustHtml(html))
    );
};
