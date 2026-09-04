import { calculateReading, validateDate } from './tarot.js';
import { loadCards } from './api.js';
import { DateStore } from './storage.js';

const form = document.getElementById('birth-form');
const monthInput = document.getElementById('month');
const dayInput = document.getElementById('day');
const yearInput = document.getElementById('year');
const resetButton = document.getElementById('reset');
const cardRow = document.getElementById('cards');
const errorBox = document.getElementById('error');
const pairingBox = document.getElementById('pairing');
const mathBox = document.getElementById('math');
const detailBox = document.getElementById('detail');
const sourceNote = document.getElementById('source-note');

const CARD_BACK = 'images/back_tarot.jpg';
const store = new DateStore();

/** Card descriptions, replaced by the API copy once it loads. */
let cardIndex = new Map();

function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = !message;
}

/** Render the three result panels for a reading. */
function renderReading(reading) {
    const chain = reading.steps.map(String).join(' → ');
    mathBox.textContent =
        `${monthInput.value} + ${dayInput.value} + ${String(yearInput.value).slice(0, 2)}`
        + ` + ${String(yearInput.value).slice(2, 4)} = ${chain}`;

    pairingBox.textContent = reading.pairing;
    detailBox.textContent = 'Select a card to read what it means on its own.';

    cardRow.replaceChildren(...reading.cards.map(card => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'card';
        button.setAttribute('aria-label', `${card.name}. Show description.`);

        const image = document.createElement('img');
        image.src = `images/${card.num}.jpg`;
        image.alt = card.name;
        image.width = 200;
        image.height = 350;

        const caption = document.createElement('span');
        caption.className = 'card-name';
        caption.textContent = card.name;

        button.append(image, caption);
        button.addEventListener('click', () => {
            const known = cardIndex.get(card.num) ?? card;
            detailBox.textContent = `${known.name} (#${known.num}): ${known.description}`;
            cardRow.querySelectorAll('.card').forEach(el => el.classList.remove('is-selected'));
            button.classList.add('is-selected');
        });
        return button;
    }));
}

/** Reset the board to two face-down cards. */
function renderFaceDown() {
    cardRow.replaceChildren(...[0, 1].map(() => {
        const image = document.createElement('img');
        image.src = CARD_BACK;
        image.alt = 'A face-down tarot card';
        image.className = 'card card-back';
        image.width = 200;
        image.height = 350;
        return image;
    }));
    pairingBox.textContent = '';
    mathBox.textContent = '';
    detailBox.textContent = '';
}

/**
 * Run a reading for the current form values.
 * Called directly on submit and on restore -- the old version simulated a
 * button click to reuse this path, which coupled the logic to the DOM event.
 */
function calculate({ persist = true } = {}) {
    const month = Number.parseInt(monthInput.value, 10);
    const day = Number.parseInt(dayInput.value, 10);
    const year = Number.parseInt(yearInput.value, 10);

    const problem = validateDate(month, day, year);
    if (problem) {
        showError(problem);
        renderFaceDown();
        return;
    }

    showError('');
    renderReading(calculateReading(month, day, year));

    if (persist) {
        store.save(month, day, year);
        const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        history.replaceState(null, '', `?d=${iso}`);
    }
}

/** A shared ?d=YYYY-MM-DD link wins over whatever is in localStorage. */
function restoreDate() {
    const shared = new URLSearchParams(location.search).get('d');
    const match = shared && /^(\d{4})-(\d{2})-(\d{2})$/.exec(shared);
    if (match) {
        const [, year, month, day] = match;
        return { month: Number(month), day: Number(day), year: Number(year) };
    }
    return store.load();
}

form.addEventListener('submit', event => {
    event.preventDefault();
    calculate();
});

resetButton.addEventListener('click', () => {
    form.reset();
    showError('');
    renderFaceDown();
    store.clear();
    history.replaceState(null, '', location.pathname);
});

renderFaceDown();

const saved = restoreDate();
if (saved) {
    monthInput.value = String(saved.month);
    dayInput.value = String(saved.day);
    yearInput.value = String(saved.year);
    calculate({ persist: false });
}

// Descriptions come from the database when it is reachable; the bundled copy
// keeps the page working when it is not.
loadCards().then(({ cards, source }) => {
    cardIndex = new Map(cards.map(card => [card.num, card]));
    if (source === 'bundled') {
        sourceNote.textContent = 'Offline mode — showing bundled card descriptions.';
        sourceNote.hidden = false;
    }
});
