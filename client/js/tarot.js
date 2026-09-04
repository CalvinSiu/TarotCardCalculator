// Pure tarot birth-card logic: no DOM, no storage, no network.
// Runs unchanged in the browser, on the server and under `node --test`.

import { combinationByKeyCard } from './data/combinations.js';
import { cardByNumber } from './data/cards.js';

export const HIGHEST_CARD = 21;   // The World -- the top of the Major Arcana
const MIN_YEAR = 1000;
const MAX_YEAR = 9999;

/** Sum the decimal digits of a non-negative integer. 139 -> 13. */
export function digitSum(n) {
    return String(n).split('').reduce((sum, digit) => sum + Number(digit), 0);
}

/** Number of days in a given month, accounting for leap years. */
export function daysInMonth(month, year) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

/**
 * Validate a birth date. Returns null when the date is valid, otherwise a
 * human-readable reason -- so the caller decides how to present the error.
 */
export function validateDate(month, day, year) {
    if (!Number.isInteger(month) || month < 1 || month > 12) {
        return 'Please choose a month.';
    }
    if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
        return `Please enter a four-digit year between ${MIN_YEAR} and ${MAX_YEAR}.`;
    }
    if (!Number.isInteger(day) || day < 1) {
        return 'Please enter a day.';
    }
    const limit = daysInMonth(month, year);
    if (day > limit) {
        return `That month only has ${limit} days in ${year}.`;
    }
    return null;
}

/**
 * Reduce a birth date to its tarot number.
 *
 * The date is summed as month + day + the two halves of the year
 * (2002 -> 20 + 2), then the digits of that total are summed repeatedly until
 * the result is 21 or less. Reducing *repeatedly* is the important part: a
 * single pass leaves totals such as 139 sitting at 22, which is off the end of
 * the Major Arcana and matches no pairing.
 *
 * Returns every intermediate step so the UI can show its work.
 */
export function reduceDate(month, day, year) {
    const yearText = String(year).padStart(4, '0');
    const total = month + day + Number(yearText.slice(0, 2)) + Number(yearText.slice(2, 4));

    const steps = [total];
    let reduced = total;
    while (reduced > HIGHEST_CARD) {
        reduced = digitSum(reduced);
        steps.push(reduced);
    }
    return { total, reduced, steps };
}

/**
 * Calculate the birth-card reading for a date.
 *
 * Throws a RangeError on an invalid date, so callers must validate first.
 */
export function calculateReading(month, day, year) {
    const problem = validateDate(month, day, year);
    if (problem) {
        throw new RangeError(problem);
    }

    const { total, reduced, steps } = reduceDate(month, day, year);

    // Pairings are keyed by the highest card in the chain. A reduced value of 9
    // or less is the tail of a chain (4 is reached from 13, 1 from 10), so step
    // back up to the card that heads it.
    const keyCard = reduced >= 10 ? reduced : reduced + 9;

    const combination = combinationByKeyCard(keyCard);
    if (!combination) {
        // Unreachable for any valid date -- the test suite proves every value of
        // `keyCard` resolves -- but a silent `undefined` is what broke the
        // original version, so fail loudly instead.
        throw new Error(`No pairing defined for card ${keyCard} (reduced from ${total}).`);
    }

    return {
        total,
        reduced,
        steps,
        keyCard,
        pairing: combination.pairing,
        cards: combination.cards.map(num => cardByNumber(num))
    };
}
