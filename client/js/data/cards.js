// The 22 Major Arcana. Shared by the browser (offline fallback), the server
// (database seed) and the test suite -- there is exactly one copy of this data.
//
// Card meanings adapted from:
// https://daily-tarot-girl.com/tarot-card-meanings/list-of-tarot-card-meanings/

export const CARDS = [
    { num: 0,  name: 'The Fool',             description: 'New beginnings, optimism, trust in life.' },
    { num: 1,  name: 'The Magician',         description: 'Action, and the power to manifest.' },
    { num: 2,  name: 'The High Priestess',   description: 'Inaction, going within, the mystical.' },
    { num: 3,  name: 'The Empress',          description: 'Abundance, nurturing, fertility, life in bloom.' },
    { num: 4,  name: 'The Emperor',          description: 'Structure, stability, rules and power.' },
    { num: 5,  name: 'The Hierophant',       description: 'Institutions, tradition, society and its rules.' },
    { num: 6,  name: 'The Lovers',           description: 'Sexuality, passion, choice, uniting.' },
    { num: 7,  name: 'The Chariot',          description: 'Movement, progress, integration.' },
    { num: 8,  name: 'Strength',             description: 'Courage, subtle power, integration of the animal self.' },
    { num: 9,  name: 'The Hermit',           description: 'Meditation, solitude, consciousness.' },
    { num: 10, name: 'The Wheel of Fortune', description: 'Cycles, change, ups and downs.' },
    { num: 11, name: 'Justice',              description: 'Fairness, equality, balance.' },
    { num: 12, name: 'The Hanged Man',       description: 'Surrender, new perspective, enlightenment.' },
    { num: 13, name: 'Death',                description: 'The end of something, change, the impermanence of all things.' },
    { num: 14, name: 'Temperance',           description: 'Balance, moderation, being sensible.' },
    { num: 15, name: 'The Devil',            description: 'Destructive patterns, addiction, giving away your power.' },
    { num: 16, name: 'The Tower',            description: 'Collapse of stable structures, destruction, release, sudden insight.' },
    { num: 17, name: 'The Star',             description: 'Hope, calm, a good omen.' },
    { num: 18, name: 'The Moon',             description: 'Mystery, the subconscious, dreams.' },
    { num: 19, name: 'The Sun',              description: 'Success, happiness, all will be well.' },
    { num: 20, name: 'Judgement',            description: 'Rebirth, a new phase, an inner calling.' },
    { num: 21, name: 'The World',            description: 'Completion, wholeness, attainment, celebration of life.' }
];

/** Look up a single card by its Major Arcana number. Returns undefined if absent. */
export function cardByNumber(num) {
    return CARDS.find(card => card.num === num);
}
