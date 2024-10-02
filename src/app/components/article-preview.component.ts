import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-article-preview',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <article [routerLink]="['/article', name()]">
      <div [innerHTML]="content()"></div>
      <!-- TO-DO поправить на дату создания файла -->
      <footer>Опубликовано {{ currentDate | date : 'medium' }}</footer>
    </article>
  `,
  styles: `
    :host {
      cursor: pointer;
    }
  `,
})
export class ArticlePreviewComponent {
  name = input<string>();
  content = input<SafeHtml>();
  currentDate = new Date();
}
