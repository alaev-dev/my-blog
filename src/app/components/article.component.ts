import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'app-article',
  standalone: true,
  template: `<div [innerHTML]="content()"></div>`,
})
export class ArticleComponent {
  readonly #route = inject(ActivatedRoute);

  content = toSignal<SafeHtml>(
    this.#route.data.pipe(map(({ article }) => article))
  );
}
