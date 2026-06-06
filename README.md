# PersonalHub — Your Life Dashboard

A personal productivity and finance web app that helps you manage tasks, schedule client meetings, track expenses, monitor revenue, and calculate profit & loss — all in one place. No server, no login, runs entirely in your browser.

---

## Features

### Scheduling & Tasks
- **Calendar** — Monthly view with color-coded events (personal, professional, client); click any day to add an event
- **Tasks (Kanban)** — Manage tasks across To Do / In Progress / Done columns; filter by personal or professional; set priority, due date, and time
- **Client Bookings** — Let clients block your calendar with their name, email, service type, and preferred time; confirm or mark sessions complete

### Finance
- **Personal Expenses** — Log daily spending with category, payment method, and date; see a category breakdown chart
- **Business Expenses** — Track professional costs with a tax-deductible flag per entry
- **Revenue** — Record income from freelance, retainers, consulting, investments, digital products, and more; mark sources as recurring
- **P&L Calculator** — Full income statement view: total revenue, total expenses (personal + business), net profit/loss, profit margin %, and tax-deductible amount

### Dashboard
- At-a-glance stat cards: tasks due today, upcoming week, monthly revenue, net P&L
- Revenue vs. Expenses bar chart
- Task status donut chart
- Upcoming tasks and client bookings feed

---

## Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 + Tailwind CSS (CDN) |
| Logic | Vanilla JavaScript (ES6+) |
| Charts | Chart.js 4 (CDN) |
| Storage | Browser localStorage |

No build step. No framework. No backend. Open `index.html` and it works.

---

## Getting Started

### Run locally
```bash
git clone https://github.com/writersrinivasan/PersonalHub.git
cd PersonalHub
open index.html        # macOS
# or double-click index.html in Finder / File Explorer
```

No `npm install`. No server needed.

### First launch
On the first open, the app loads sample data (tasks, expenses, revenue, bookings) so every section looks populated right away. All data is stored in your browser's localStorage — it persists across page refreshes and browser restarts on the same device.

---

## Project Structure

```
PersonalHub/
├── index.html      # App shell, navigation, modal container
├── style.css       # Custom styles (sidebar, cards, calendar, kanban, forms)
└── app.js          # All application logic
    ├── Utilities   # uid(), formatCurrency(), DB (localStorage wrapper)
    ├── Sample data # Pre-loaded on first run
    ├── Router      # navigate(view) — renders the active section
    ├── Views       # One render function per section
    ├── Modals      # Form templates for add/edit
    ├── App actions # saveTask, saveExpense, saveRevenue, saveBooking, deleteItem
    └── Charts      # Chart.js initialization per view
```

---

## Sections

| Section | Path (nav) | What you can do |
|---|---|---|
| Dashboard | Home | See summary stats and charts |
| Calendar | Scheduling → Calendar | View and add events by date |
| Tasks | Scheduling → Tasks | Kanban board with priority and filters |
| Client Bookings | Scheduling → Client Bookings | Manage client sessions |
| Personal Expenses | Finances → Personal Expenses | Track personal spending |
| Business Expenses | Finances → Business Expenses | Track deductible business costs |
| Revenue | Finances → Revenue | Log income from all sources |
| P&L Calculator | Finances → P&L Calculator | Full profit & loss summary |

---

## Data Storage

All data is stored locally using `localStorage` under these keys:

| Key | Contents |
|---|---|
| `tasks` | Personal and professional tasks |
| `personal_expenses` | Personal expense entries |
| `professional_expenses` | Business expense entries |
| `revenue` | Revenue entries from all sources |
| `client_bookings` | Client session bookings |
| `ph_user` | Your display name |
| `ph_initialized` | Flag to skip sample data on reload |

To reset the app to sample data, open your browser console and run:
```js
localStorage.clear(); location.reload();
```

---

## Currencies & Locale

The app uses Indian Rupees (₹) and `en-IN` locale formatting for numbers and dates. To change the currency symbol, update the `formatCurrency` function in `app.js`:

```js
// app.js — line ~8
const formatCurrency = n => '₹' + Number(n).toLocaleString('en-IN');
```

---

## Roadmap

- [ ] Export data to CSV / PDF
- [ ] Client-facing booking form (shareable link)
- [ ] Monthly budget targets with progress bars
- [ ] Dark mode
- [ ] Mobile-responsive layout
- [ ] Multi-month P&L comparison
- [ ] Recurring task automation
- [ ] Data backup / import via JSON

---

## License

MIT — free to use, modify, and distribute.

---

Built with [Claude Code](https://claude.ai/code)
