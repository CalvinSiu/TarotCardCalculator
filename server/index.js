import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { router } from './routes.js';
import { initializeDatabase } from './db.js';

const clientDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'client');
const port = Number(process.env.PORT) || 3000;

const app = express();

app.use(express.json());
app.use('/api', router);
app.use(express.static(clientDir));

app.use((req, res) => {
    res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
});

// Central error handler. Every async route funnels here via asyncHandler, so a
// failed query returns a 500 instead of hanging the request.
app.use((error, req, res, next) => {
    console.error(`${req.method} ${req.originalUrl} failed:`, error);
    res.status(500).json({ error: 'Internal server error.' });
});

// The front end falls back to its bundled copy of the card data when the API is
// unreachable, so a missing database degrades the app rather than breaking it.
try {
    const seeded = await initializeDatabase();
    console.log(`Database ready: ${seeded.cards} cards, ${seeded.combinations} combinations.`);
} catch (error) {
    console.warn('Could not reach Postgres -- serving the client with bundled card data.');
    console.warn(`  ${error.message}`);
}

app.listen(port, () => {
    console.log(`Tarot Birth Card Calculator running at http://localhost:${port}`);
});
