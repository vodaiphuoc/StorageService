import {
    AngularNodeAppEngine,
    createNodeRequestHandler,
    isMainModule,
    writeResponseToNodeResponse,
} from '@angular/ssr/node';

import express from 'express';
import { join, dirname, resolve } from 'node:path';
import { relative } from 'path';

const browserDistFolder = join(import.meta.dirname, '../browser');
const serverDistFolder = join(import.meta.dirname, '../server');

console.log('dir name: ', import.meta.dirname);

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */
const PRODUCTS = [
    { id: 1, name: 'Laptop', price: 1200, description: 'A powerful laptop for work and gaming.' },
    { id: 2, name: 'Phone', price: 800, description: 'A sleek smartphone with amazing camera.' },
    { id: 3, name: 'Headphones', price: 150, description: 'Noise-cancelling over-ear headphones.' },
    { id: 4, name: 'Monitor', price: 300, description: '4K UHD monitor for productivity.' },
];


app.get('/api/products', (req, res) => {
    console.log('run products endpoint');
    res.json(PRODUCTS);
});

app.get('/api/products/:id', (req, res) => {
    const product = PRODUCTS.find(p => p.id === Number(req.params.id));
    if (!product) {
        res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
});

/**
 * Serve static files from /browser
 */
app.use(
    express.static(browserDistFolder, {
        maxAge: '1y',
        index: false,
        redirect: false,
        setHeaders: (res, path, stat) => {
            // path is the absolute path of the file being served
            const relativePath = relative(browserDistFolder, path);
            console.log(`Serving static file: ${relativePath}`);
        }
    }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
    angularApp
        .handle(req)
        .then((response) =>
            response ? writeResponseToNodeResponse(response, res) : next(),
        )
        .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
    const port = process.env['PORT'] || 4000;
    app.listen(port, (error) => {
        if (error) {
            throw error;
        }

        console.log(`Node Express server listening on http://localhost:${port}`);
    });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
