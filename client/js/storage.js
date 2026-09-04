// Thin wrapper over localStorage. Injectable so the logic can be exercised
// outside a browser, and non-fatal when storage is unavailable (private
// browsing, disabled cookies) rather than throwing on load.

const KEY = 'tarot.birthDate';

export class DateStore {
    constructor(storage = globalThis.localStorage) {
        this.storage = storage;
    }

    /** Returns { month, day, year } or null if nothing valid is saved. */
    load() {
        try {
            const saved = this.storage?.getItem(KEY);
            if (!saved) return null;
            const { month, day, year } = JSON.parse(saved);
            if ([month, day, year].every(Number.isInteger)) {
                return { month, day, year };
            }
            return null;
        } catch {
            return null;
        }
    }

    save(month, day, year) {
        try {
            this.storage?.setItem(KEY, JSON.stringify({ month, day, year }));
        } catch {
            // Storage full or blocked -- the app works fine without persistence.
        }
    }

    clear() {
        try {
            this.storage?.removeItem(KEY);
        } catch {
            // Nothing to do.
        }
    }
}
