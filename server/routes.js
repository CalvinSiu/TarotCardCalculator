import { Router } from 'express';
import { pool } from './db.js';
import { calculateReading, validateDate } from '../client/js/tarot.js';

export const router = Router();

/**
 * Express 4 does not catch rejected promises, so an unhandled `await` leaves
 * the request hanging forever. Every async handler goes through this.
 */
const asyncHandler = handler => (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);

/** Parse a route param that must be a non-negative integer. */
function parseId(value) {
    return /^\d+$/.test(value) ? Number(value) : null;
}

/** Reject a create/update body that is missing required text fields. */
function validateCardBody({ name, description }) {
    if (typeof name !== 'string' || name.trim() === '') {
        return '`name` is required and must be a non-empty string.';
    }
    if (typeof description !== 'string' || description.trim() === '') {
        return '`description` is required and must be a non-empty string.';
    }
    return null;
}

// --- Reading -------------------------------------------------------------
// The calculation itself is pure and runs client-side; this endpoint exists so
// the reading is also available to any non-browser API consumer.

router.get('/reading', asyncHandler(async (req, res) => {
    const month = Number(req.query.month);
    const day = Number(req.query.day);
    const year = Number(req.query.year);

    const problem = validateDate(month, day, year);
    if (problem) {
        return res.status(400).json({ error: problem });
    }
    res.json(calculateReading(month, day, year));
}));

// --- Cards ---------------------------------------------------------------
// `/cards/all` is declared before `/cards/:id` on purpose. Registered the other
// way round, Express matches `all` as an `:id` and the route is unreachable.

router.get('/cards/all', asyncHandler(async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM cards ORDER BY num');
    res.json(rows);
}));

router.get('/cards/:id', asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: 'Card id must be a number.' });
    }
    const { rows } = await pool.query('SELECT * FROM cards WHERE num = $1', [id]);
    if (!rows[0]) {
        return res.status(404).json({ error: 'Card not found.' });
    }
    res.json(rows[0]);
}));

router.post('/cards', asyncHandler(async (req, res) => {
    const { num, name, description, image } = req.body ?? {};
    if (!Number.isInteger(num) || num < 0 || num > 21) {
        return res.status(400).json({ error: '`num` must be an integer from 0 to 21.' });
    }
    const problem = validateCardBody(req.body ?? {});
    if (problem) {
        return res.status(400).json({ error: problem });
    }

    const { rows } = await pool.query(
        `INSERT INTO cards (num, name, description, image)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (num) DO NOTHING
         RETURNING *`,
        [num, name, description, image ?? `images/${num}.jpg`]
    );
    if (!rows[0]) {
        return res.status(409).json({ error: `Card ${num} already exists.` });
    }
    res.status(201).json(rows[0]);
}));

router.put('/cards/:id', asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: 'Card id must be a number.' });
    }
    const problem = validateCardBody(req.body ?? {});
    if (problem) {
        return res.status(400).json({ error: problem });
    }

    const { name, description, image } = req.body;
    const { rows } = await pool.query(
        `UPDATE cards SET name = $1, description = $2, image = $3
         WHERE num = $4 RETURNING *`,
        [name, description, image ?? `images/${id}.jpg`, id]
    );
    if (!rows[0]) {
        return res.status(404).json({ error: 'Card not found.' });
    }
    res.json(rows[0]);
}));

router.delete('/cards/:id', asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: 'Card id must be a number.' });
    }
    const { rows } = await pool.query('DELETE FROM cards WHERE num = $1 RETURNING *', [id]);
    if (!rows[0]) {
        return res.status(404).json({ error: 'Card not found.' });
    }
    res.json(rows[0]);
}));

// --- Combinations --------------------------------------------------------

router.get('/combinations', asyncHandler(async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM combinations ORDER BY key_card DESC');
    res.json(rows);
}));
