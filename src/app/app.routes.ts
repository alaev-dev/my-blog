import { Routes } from '@angular/router';
import { articlePreviewsResolver } from './components/article-previews.resolver';
import { ArticleComponent } from './components/article.component';
import { articleResolver } from './components/article.resolver';
import { HomeComponent } from './components/home.component';

export const routes: Routes = [
  {
    path: 'article/:name',
    component: ArticleComponent,
    resolve: {
      article: articleResolver,
    },
  },
  {
    path: '',
    component: HomeComponent,
    resolve: {
      articlePreviews: articlePreviewsResolver,
    },
  },
];
