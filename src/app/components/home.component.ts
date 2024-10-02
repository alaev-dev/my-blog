import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { ArticlePreviewComponent } from './article-preview.component';
import { ArticlePreview } from './article-previews.resolver';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, ArticlePreviewComponent],
  template: `
    <div><h1>Список доступных статей:</h1></div>
    @for (item of articles(); track item) {
    <app-article-preview [name]="item.fileName" [content]="item.content" />
    }
  `,
})
export class HomeComponent {
  readonly #route = inject(ActivatedRoute);

  articles = toSignal<ArticlePreview[]>(
    this.#route.data.pipe(map(({ articlePreviews }) => articlePreviews))
  );
}
