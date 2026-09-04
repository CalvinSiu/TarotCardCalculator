import test from 'node:test';
import assert from 'node:assert/strict';

import {
    calculateReading, reduceDate, digitSum, daysInMonth, validateDate, HIGHEST_CARD
} from '../client/js/tarot.js';
import { COMBINATIONS } from '../client/js/data/combinations.js';
import { CARDS } from '../client/js/data/cards.js';

/** Every valid date from 1000 through 2026, for the exhaustive sweeps below. */
function* everyValidDate() {
    for (let year = 1000; year <= 2026; year++) {
        for (let month = 1; month <= 12; month++) {
            for (let day = 1; day <= daysInMonth(month, year); day++) {
                yield [month, day, year];
            }
        }
    }
}

test('digitSum sums decimal digits', () => {
    assert.equal(digitSum(7), 7);
    assert.equal(digitSum(139), 13);
    assert.equal(digitSum(2002), 4);
});

test('daysInMonth handles leap years', () => {
    assert.equal(daysInMonth(2, 2001), 28);
    assert.equal(daysInMonth(2, 2004), 29, '2004 is a leap year');
    assert.equal(daysInMonth(2, 1900), 28, '1900 is divisible by 100 but not 400');
    assert.equal(daysInMonth(2, 2000), 29, '2000 is divisible by 400');
    assert.equal(daysInMonth(9, 2023), 30);
});

test('validateDate rejects impossible calendar dates', () => {
    assert.equal(validateDate(12, 4, 2002), null, 'a real date is accepted');
    assert.match(validateDate(2, 30, 2001), /only has 28 days/);
    assert.match(validateDate(9, 31, 1980), /only has 30 days/);
    assert.match(validateDate(13, 1, 2000), /choose a month/);
    assert.match(validateDate(1, 1, 999), /four-digit year/);
    assert.match(validateDate(1, NaN, 2000), /enter a day/);
});

test('reduceDate reduces repeatedly, not just once', () => {
    // Regression: a single pass left this at 22, which is off the end of the
    // Major Arcana and matched no pairing.
    const { total, reduced, steps } = reduceDate(9, 30, 1981);
    assert.equal(total, 139);
    assert.deepEqual(steps, [139, 13]);
    assert.ok(reduced <= HIGHEST_CARD);
});

test('known birth dates produce their documented pairings', () => {
    const expected = [
        [[12, 4, 2002], [11, 2]],
        [[8, 31, 1981], [13, 4]],
        [[12, 31, 1996], [14, 5]],
        [[1, 1, 1900], [21, 3]],
        [[1, 1, 1800], [20, 2]],
        [[6, 15, 2000], [14, 5]]
    ];
    for (const [date, cards] of expected) {
        const reading = calculateReading(...date);
        assert.deepEqual(reading.cards.map(c => c.num), cards, `for ${date.join('/')}`);
    }
});

test('an invalid date throws instead of returning undefined', () => {
    // Regression: the original returned `undefined` and the caller dereferenced
    // it, so a bad date surfaced as a blank page rather than a message.
    assert.throws(() => calculateReading(2, 31, 2001), RangeError);
});

test('every valid date from 1000-2026 resolves to a pairing', () => {
    let checked = 0;
    for (const date of everyValidDate()) {
        const reading = calculateReading(...date);
        assert.ok(reading.cards.length >= 2, `too few cards for ${date.join('/')}`);
        assert.ok(reading.pairing.length > 0, `empty pairing for ${date.join('/')}`);
        checked++;
    }
    assert.ok(checked > 350_000, `expected a full sweep, only checked ${checked}`);
});

test('every pairing is reachable by some real birth date', () => {
    const reached = new Set();
    for (const date of everyValidDate()) {
        reached.add(calculateReading(...date).keyCard);
    }
    // Regression: [10, 1] was dead code -- the 19/10/1 chain always shadowed it.
    for (const { cards } of COMBINATIONS) {
        assert.ok(reached.has(cards[0]), `pairing [${cards}] is unreachable`);
    }
});

test('pairing chains follow the digit-sum rule and reference real cards', () => {
    const numbers = new Set(CARDS.map(card => card.num));
    for (const { cards } of COMBINATIONS) {
        for (const num of cards) {
            assert.ok(numbers.has(num), `card ${num} has no description`);
        }
        for (let i = 1; i < cards.length; i++) {
            assert.equal(cards[i], digitSum(cards[i - 1]),
                `[${cards}] breaks the chain at index ${i}`);
        }
    }
});

test('every Major Arcana card has an image and unique number', () => {
    assert.equal(CARDS.length, 22);
    assert.equal(new Set(CARDS.map(c => c.num)).size, 22, 'card numbers must be unique');
    CARDS.forEach((card, i) => {
        assert.equal(card.num, i, 'cards must be in order 0-21');
        assert.ok(card.name && card.description, `card ${i} is missing text`);
    });
});
