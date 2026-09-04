# Tarot Birth Card Calculator

Enter a birth date and find out which tarot cards it reduces to, what the pairing
means, and how the arithmetic got there.

Built with vanilla JavaScript ES modules, an Express REST API and PostgreSQL —
no framework, no build step, no bundler.

<!-- TODO: drop a screenshot at docs/screenshot.png and uncomment the line below.
![The calculator showing a three-card reading](docs/screenshot.png)
-->

## How the calculation works

Tarot birth cards come from reducing a date to a number in the Major Arcana
(0–21). This project uses the month/day/year-halves method:

```
8 / 31 / 1981   ->   8 + 31 + 19 + 81  =  139
                     1 + 3 + 9         =   13     <- Death
                     1 + 3             =    4     <- The Emperor
```

The digits are summed **repeatedly** until the result is 21 or less. That detail
matters: a single pass leaves totals like 139 sitting at 22, which is off the end
of the deck and matches no card.

Pairings are keyed by the highest card in the chain. When a date reduces to 9 or
below it is the *tail* of a chain — 4 is only ever reached from 13 — so the
lookup steps back up by nine to find the card that heads it. Every value from 1
to 21 resolves to exactly one of the twelve pairings, and
[the test suite](test/tarot.test.js) proves it by sweeping every valid date from
1000 to 2026.

## Running it

Requires Node 18+ and PostgreSQL.

```bash
git clone https://github.com/<your-username>/tarot-birth-card-calculator.git
cd tarot-birth-card-calculator
npm install
cp .env.example .env      # then fill in your Postgres password
npm start
```

Open <http://localhost:3000>.

The schema is created and seeded automatically on first boot, so there is no
migration step. If you do not have Postgres installed locally, this is enough:

```bash
docker run --name tarot-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=tarot_db -p 5432:5432 -d postgres:16
```

**The app still runs without a database.** If Postgres is unreachable the server
logs a warning, keeps serving, and the front end falls back to its bundled copy
of the card data, showing an "Offline mode" notice. A missing database degrades
the app instead of breaking it.

### Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Start the server on port 3000 |
| `npm run dev` | Same, restarting on file changes |
| `npm test` | Run the test suite (`node --test`, no dependencies) |

## API

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/reading?month=&day=&year=` | Full reading for a date — cards, pairing, and the reduction steps |
| `GET` | `/api/cards/all` | All 22 Major Arcana cards |
| `GET` | `/api/cards/:id` | One card by its number (0–21) |
| `POST` | `/api/cards` | Create a card |
| `PUT` | `/api/cards/:id` | Update a card |
| `DELETE` | `/api/cards/:id` | Delete a card |
| `GET` | `/api/combinations` | All twelve birth-card pairings |

```bash
curl "http://localhost:3000/api/reading?month=8&day=31&year=1981"
```

```json
{
  "total": 139,
  "reduced": 13,
  "steps": [139, 13],
  "keyCard": 13,
  "pairing": "When one door closes, you have the stability and authority of the Emperor...",
  "cards": [
    { "num": 13, "name": "Death", "description": "The end of something, change..." },
    { "num": 4, "name": "The Emperor", "description": "Structure, stability, rules and power." }
  ]
}
```

Invalid input returns a `400` with a readable message rather than a stack trace:

```json
{ "error": "That month only has 28 days in 2001." }
```

## Project layout

```
client/
  index.html
  css/main.css
  js/
    main.js              DOM wiring and rendering
    tarot.js             pure calculation logic — no DOM, no storage, no network
    api.js               fetch layer with offline fallback
    storage.js           localStorage wrapper, injectable and non-throwing
    data/
      cards.js           the 22 Major Arcana
      combinations.js    the 12 pairings
server/
  index.js               app wiring, static hosting, error handling
  routes.js              REST API
  db.js                  pool, schema and idempotent seed
test/
  tarot.test.js          10 tests, including two exhaustive date sweeps
```

`client/js/data/` is the single source of truth for the card text. The browser
imports it directly as an ES module, the server reads it to seed Postgres, and
the tests assert against it — one copy, three consumers.

`tarot.js` deliberately has no dependencies on the DOM, `localStorage` or
`fetch`, which is what makes the exhaustive test sweeps possible: the same
function that runs in the browser runs 375,000 times under `node --test`.

## Testing

```bash
npm test
```

Ten tests using the built-in `node:test` runner — no Jest, no config. Beyond the
usual unit cases, two of them sweep **every valid date from 1000 through 2026**
to assert that each one resolves to a pairing and that no pairing is
unreachable. The second sweep exists because one of the twelve pairings was
dead code for a while: a shadowing bug meant no birth date could ever produce it.

## Credits

Card meanings adapted from
[Daily Tarot Girl](https://daily-tarot-girl.com/tarot-card-meanings/list-of-tarot-card-meanings/).
Card images are from the Rider–Waite–Smith deck, which is in the public domain.

## License

MIT
