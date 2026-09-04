import pkg from 'pg';
import { CARDS } from '../client/js/data/cards.js';
import { COMBINATIONS } from '../client/js/data/combinations.js';

const { Pool } = pkg;

// Credentials come from the environment -- never hard-code them in source.
// See .env.example for the variables this expects.
export const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT) || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'tarot_db'
});

const SCHEMA = `
    CREATE TABLE IF NOT EXISTS cards (
        num         INTEGER PRIMARY KEY CHECK (num BETWEEN 0 AND 21),
        name        VARCHAR(64) NOT NULL,
        description TEXT        NOT NULL,
        image       VARCHAR(255)
    );

    CREATE TABLE IF NOT EXISTS combinations (
        key_card INTEGER PRIMARY KEY REFERENCES cards(num),
        cards    INTEGER[] NOT NULL,
        pairing  TEXT      NOT NULL
    );
`;

/**
 * Create the schema if needed and seed it from the shared data modules.
 *
 * Idempotent: safe to run on every boot. The upsert means editing a card
 * description in client/js/data/ and restarting is enough to update the
 * database -- the files stay the single source of truth.
 */
export async function initializeDatabase() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(SCHEMA);

        for (const card of CARDS) {
            await client.query(
                `INSERT INTO cards (num, name, description, image)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (num) DO UPDATE
                   SET name = EXCLUDED.name,
                       description = EXCLUDED.description,
                       image = EXCLUDED.image`,
                [card.num, card.name, card.description, `images/${card.num}.jpg`]
            );
        }

        for (const combo of COMBINATIONS) {
            await client.query(
                `INSERT INTO combinations (key_card, cards, pairing)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (key_card) DO UPDATE
                   SET cards = EXCLUDED.cards,
                       pairing = EXCLUDED.pairing`,
                [combo.cards[0], combo.cards, combo.pairing]
            );
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }

    return { cards: CARDS.length, combinations: COMBINATIONS.length };
}
