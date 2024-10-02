import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ResolveFn } from '@angular/router';
import { marked } from 'marked';
import { forkJoin, map, switchMap } from 'rxjs';
import { API_URL } from '../shared/api';
import { wrapInObservable } from '../shared/wrap-in-observable';

export interface ArticlePreview {
  fileName: string;
  content: SafeHtml;
}

interface ArticlesResponse {
  fileName: string;
  content: string;
}

export const articlePreviewsResolver: ResolveFn<ArticlePreview[]> = () => {
  const http = inject(HttpClient);
  const apiUrl = inject(API_URL);
  const sanitizer = inject(DomSanitizer);

  return http.get<ArticlesResponse[]>(`${apiUrl}/articles`).pipe(
    switchMap((data) => {
      const previews = data.map((item) =>
        wrapInObservable(marked.parse(item.content)).pipe(
          map((html) => ({
            fileName: item.fileName,
            content: sanitizer.bypassSecurityTrustHtml(html),
          }))
        )
      );

      return forkJoin(previews);
    })
  );
};
