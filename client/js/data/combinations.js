// The twelve tarot birth-card pairings.
//
// Each entry is keyed by `cards[0]`, the highest card in the chain. The rest of
// the chain follows by repeatedly summing the digits of the previous card
// (19 -> 1+9 = 10 -> 1+0 = 1), which is why the arrays are already in the order
// they should be displayed, left to right.

export const COMBINATIONS = [
    {
        cards: [21, 3],
        pairing: 'As the Empress, you are guided by love. The act of giving and receiving love from those in your life is very important to you. You seek to unify the various aspects of your life to create a harmonious and welcoming World.'
    },
    {
        cards: [20, 2],
        pairing: 'Intuition guides the High Priestess. Your best results come when you trust the voice within. Because of the Judgement card, you are not afraid to re-evaluate any situation and make the best decision, even if you must break through many limitations to achieve this.'
    },
    {
        cards: [19, 10, 1],
        pairing: 'The Wheel of Fortune card keeps you in touch with the ever-changing world around you. You find it easy to adapt to whatever comes your way, thanks to the Magician’s powers. And much like the Sun, you always have a bright outlook on life, bringing you joy and contentment.'
    },
    {
        cards: [18, 9],
        pairing: 'As a Hermit, you tend to be solitary, preferring to follow your own inner voice and intelligence. You use this to find your path through the darkness and dreams that the Moon brings.'
    },
    {
        cards: [17, 8],
        pairing: 'A well-known icon of wishing, the Star represents hope and an overall optimistic outlook on life. This stems from a great inner Strength, which can carry you through the hard times of life.'
    },
    {
        cards: [16, 7],
        pairing: 'You possess the ability to carry forward even in turbulent times. The Tower is a destructive force, but amidst the rubble, new paths emerge. Then the Chariot leads the way forward, maintaining careful control over all impulses.'
    },
    {
        cards: [15, 6],
        pairing: 'You are very sensual and passionate about everything you do. The Devil card means that you are playful, which can lead to problems with materialism. However, the passion of the Lovers can restore balance.'
    },
    {
        cards: [14, 5],
        pairing: 'You have the qualities of a great leader. You have the great wisdom of the Hierophant, which is necessary to lead. Temperance helps you resolve conflict. You bring calm serenity to any situation.'
    },
    {
        cards: [13, 4],
        pairing: 'When one door closes, you have the stability and authority of the Emperor to open a new one and pursue that new path. Death may bring the end of a cycle, but, for you, it is a chance for new beginnings.'
    },
    {
        cards: [12, 3],
        pairing: 'Like the Hanged Man in suspension, you are able to easily handle any delays or pauses in your life journeys. This grace, as well as your nurturing spirit, comes from the Empress tarot birth card.'
    },
    {
        cards: [11, 2],
        pairing: 'You are very intuitive in almost every situation. Justice gives you the logical clarity you need to make quick decisions and remain objective. The High Priestess keeps you highly connected with your inner voice.'
    },
    {
        cards: [10, 1],
        pairing: 'The spinning Wheel of Fortune represents the cycles of change that are always present in life. You recognize these changes and are easily able to adapt to them thanks to the resourcefulness of the Magician.'
    }
];

/** Look up a pairing by its key card (the highest card in the chain). */
export function combinationByKeyCard(keyCard) {
    return COMBINATIONS.find(combo => combo.cards[0] === keyCard);
}
