// Talks to the REST API, falling back to the bundled data modules when the
// server or database is unavailable. The app stays usable either way, and the
// UI can tell the user which source it is reading from.

import { CARDS } from './data/cards.js';

const TIMEOUT_MS = 3000;

async function getJSON(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
            throw new Error(`${url} responded ${response.status}`);
        }
        return await response.json();
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Load the card list, preferring the database copy.
 * Resolves to `{ cards, source }` where source is 'api' or 'bundled'.
 */
export async function loadCards() {
    try {
        const rows = await getJSON('/api/cards/all');
        if (Array.isArray(rows) && rows.length > 0) {
            return { cards: rows, source: 'api' };
        }
        throw new Error('empty card list');
    } catch (error) {
        console.warn('Falling back to bundled card data:', error.message);
        return { cards: CARDS, source: 'bundled' };
    }
}
