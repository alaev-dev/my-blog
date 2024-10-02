import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import cors from 'cors';
import express from 'express';
import fs from 'fs/promises';
import path, { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  server.use(cors());

  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');
  const articlesFolder = resolve(serverDistFolder, '../../../articles');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  server.get('/api/articles', (_, res) => {
    fs.readdir(articlesFolder)
      .then((files) => files.filter((file) => file.endsWith('.md')))
      .then((files) => {
        const promises = files.map((file) => {
          const filePath = path.join(articlesFolder, file);

          return fs.readFile(filePath, 'utf8').then((data) => ({
            fileName: file.replace('.md', ''),
            content: data.split('\n').slice(0, 4).join('\n').trimEnd() + '...',
          }));
        });

        return Promise.all(promises);
      })
      .then((articles) => {
        res.json(articles);
      })
      .catch((err) => {
        console.error('Error scanning directory:', err);
        res.status(500).json({ error: 'Unable to scan directory' });
      });
  });

  server.get('/api/articles/:name', (req, res) => {
    const fileName = req.params.name + '.md';
    const filePath = path.join(articlesFolder, fileName);

    fs.readFile(filePath, 'utf8')
      .then((data) => res.send(data))
      .catch(() => res.status(404).send('Article not found'));
  });

  // Serve static files from /browser
  server.get(
    '**',
    express.static(browserDistFolder, {
      maxAge: '1y',
      index: 'index.html',
    })
  );

  // All regular routes use the Angular engine
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
