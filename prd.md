# Adaptive Packing & Trip Planner (Mobile-First Web)

## 1. Overview

This is a mobile-first website that turns three inputs (trip name, dates, purpose) into a day-by-day itinerary, a packing checklist that adapts to the trip's purpose and length, and a budget with clear insights. The product name is a working title: **Trip Pack**.

**Problem.** People pack from memory, plan days in notes apps and track costs in a spreadsheet. Packing lists are generic: a 3-day business trip and a 14-day beach holiday get the same list, so travelers over-pack, forget items or never reconsider laundry.

**Vision.** One small, calm app per trip. Set it up in under a minute, then use it one-handed on a phone.

### Goals

- Create a trip (name, start date, end date) in under 60 seconds.
- Generate a Clothing checklist whose quantities follow trip length and purpose.
- Make the itinerary easy to fill day by day, with swipe or buttons between days.
- Show at a glance how much of each prep category is done (x/y with a colored ring).
- Show whether planned spending fits the budget, and which category drives it.

### Non-goals (v1)

- User accounts, cross-device sync and sharing (data stays on the device).
- Booking, maps, live prices, weather or exchange-rate lookups.
- Actual-spend tracking against the plan (listed as a follow-up in section 8).
- Native iOS or Android apps.

### Target users

- Occasional to frequent leisure travelers planning trips of 2 to 21 days.
- Business travelers who want a short, purpose-fit packing list.
- Planners who share nothing and want a private, fast tool on their phone.

### Success metrics (proposed targets)

| Metric | Target | How measured |
| --- | --- | --- |
| Trip creation completion | 90% of started setups finish | Funnel: setup started to Itinerary shown |
| Time to first itinerary entry | Under 2 minutes from first visit | Event timestamps |
| Trips with at least 1 checked prep item | 70% | Local event count |
| Trips with a budget set | 50% | Local event count |
| Return within a trip's dates | 40% of trips | Return-visit event |

## 2. Design principles and app shell

**DESIGN.md.** every visual value comes from DESIGN.md through theme tokens (CSS variables in the Tailwind and shadcn-svelte theme), never hard-coded in components. Until the file is supplied, build on the default shadcn-svelte theme so swapping tokens later needs no component changes. See open question 1 in section 8.

### Mobile-first rules

- Design at 360 px wide first, then enhance at 768 px and above. On wider screens keep a centered column (max about 480 px) rather than stretching the layout.
- Touch targets are at least 44 x 44 px. Primary actions sit in the thumb zone (bottom third).
- Respect device safe areas (notch, home indicator) for the bottom navigation and drawers.
- Prefer bottom drawers over centered dialogs for forms on phones.
- Every swipe gesture has a visible button and a keyboard equivalent.
- Support light and dark themes, and `prefers-reduced-motion`.

### App shell

After a trip exists, the shell has three parts:

1. **Top bar:** trip name, date range chip (for example "14 to 20 Nov") and a menu to edit or delete the trip.
2. **Content area:** the active tab, scrolls independently.
3. **Bottom navigation:** three tabs, always visible: **Itinerary**, **Preps**, **Budget**. The active tab is highlighted and labeled; icons plus text, never icons alone.

Before a trip exists, the bottom navigation is hidden and the person sees only the setup flow (section 3). The three tabs appear once name and dates are saved.

## 3. Onboarding: create the trip

The three menus stay hidden until the person has named the trip and picked dates. A short guided flow, one question per screen, with a step indicator (1 of 3) and a persistent primary button at the bottom.

### Flow

1. **Name your trip.** Single text field, autofocused, with a placeholder such as "Bali with friends". Continue is disabled until the field has 1 to 60 characters.
2. **Pick your dates.** A range calendar: tap the start date, then the end date. Show the trip length live ("7 days, 6 nights"). Continue is disabled until both dates are set.
3. **What kind of trip?** Single-select chips for the purpose, with an optional note. This drives the adaptive packing list (section 5). Default is "General"; the step can be skipped.
4. **Done.** Land on the Itinerary tab, Day 1, with the first-entry guidance from section 4.

### Rules

| Rule | Behavior |
| --- | --- |
| End before start | Not selectable in the range calendar; inline message if forced |
| Single-day trip | Allowed (start equals end) |
| Maximum length | 60 days (proposed); longer shows an inline message |
| Start date in the past | Allowed with a gentle note, so people can log trips already under way |
| Back button | Returns to the previous step with values kept |
| Leaving mid-flow | Draft is kept on the device and resumed on next visit |

### Purposes offered in v1 (proposed)

General, Leisure, Beach, Business, Hiking and outdoors, City break, Family. The list is data-driven so more can be added without a redesign.

### Editing later

Name, dates and purpose can be changed from the top-bar menu. When dates change, itinerary entries on days that no longer exist are kept in a "Unscheduled" holding list rather than deleted, and the person is told how many were moved.

## 4. Itinerary

The Itinerary tab shows one day at a time. The person fills Day 1, then moves to Day 2 by swiping or tapping, and can go back the same way. The first visit actively guides them to the first entry.

### Layout (top to bottom)

1. **Day strip:** a horizontally scrolling row of day chips ("Day 1 / Sat 14"). The active day is highlighted; days with entries show a filled dot, empty days an outlined dot. Tapping a chip jumps to that day.
2. **Day pane:** the active day's heading ("Day 3 of 7, Mon 16 Nov") and its entries, sorted by time, then by creation order for entries without a time.
3. **Day footer:** Previous and Next buttons with the neighboring day's label ("Day 2 →"), plus the add button.

The day pane is a swipeable carousel with one pane per day. Swiping left goes to the next day, swiping right goes back. The buttons, the day strip and the left and right arrow keys do the same.

### Entry fields

| Field | Required | Notes |
| --- | --- | --- |
| Title | Yes | For example "Temple visit" |
| Time | No | Optional start time; entries without a time sit under "Anytime" |
| Place | No | Free text, no map lookup in v1 |
| Notes | No | Short text |
| Type | No | Icon tag: Transport, Stay, Food, Activity, Other |

### Guided first entry

- **Empty trip (no entries on any day):** Day 1 shows a coach card, "Start with Day 1: what's the first thing you'll do?" with the title field already focused. Other days are reachable but show a quiet empty state.
- **After the first entry is saved:** a confirmation line appears under it, "Day 1 started. Add more, or continue to Day 2 →", with the Next button emphasized.
- **On a later empty day:** a lighter prompt, "Nothing planned for Day 4 yet" with an Add button.
- **First swipe hint:** shown once, an animated edge hint that disappears after the first successful day change.
- **Last day:** Next becomes "All days planned" when every day has at least one entry, otherwise "Back to first empty day".

### Interactions

- Add and edit open in a bottom drawer. Save returns focus to the list and shows the new entry highlighted briefly.
- Entry actions (edit, duplicate, move to another day, delete) live in a per-entry overflow menu, not in a horizontal swipe, so item gestures never conflict with day swiping.
- Delete shows an undo toast for 5 seconds.
- Vertical scrolling inside a day never triggers a day change; only a clearly horizontal gesture does.

### Acceptance criteria

- A person with a new trip can add a Day 1 entry in at most 3 taps after landing.
- Swiping or tapping Next from Day N shows Day N+1 within 300 ms, with state kept.
- The active day persists after reload.
- All day-changing gestures have a button and keyboard alternative.

## 5. Preps: never forget a thing

The Preps tab is the packing checklist. Its main screen lists prep categories as cards; v1 ships with one category, **Clothing**. Each card shows a progress ring with the count of packed items out of total items, for example **4/10**.

### Main screen

- Header: "Never forget a thing" and an overall line ("4 of 10 packed").
- One card per category: icon, name, ring with x/y in the center. The card is a single tap target that opens the category detail.
- Ring color follows completion so status reads without numbers:

| Completion | Ring color token | Meaning |
| --- | --- | --- |
| 0 to 33% | Critical (red) | Barely started |
| 34 to 66% | Warning (amber) | In progress |
| 67 to 99% | Primary (brand) | Nearly there |
| 100% | Success (green) | All packed, with a check mark in the ring |

- The color is never the only signal: the x/y text and a screen-reader label ("Clothing, 4 of 10 packed") always accompany it.
- An "Add category" card is shown last but marked as a follow-up (P1); v1 has Clothing only.
- Empty state: if a category has no items, the ring shows 0/0 in a neutral color and the card says "Add your first item".

### Category detail (Clothing)

- Top: back button, category name, and the same ring at larger size.
- List of items; each row has a checkbox, the item name, and a quantity stepper (minus, number, plus; minimum 1).
- Checking an item moves it to a collapsed "Packed" group at the bottom and updates the ring immediately.
- Add item: a bottom drawer with Name and Quantity fields. Example: "Jacket", quantity 1. Name is required.
- Edit name or quantity inline or from the row's overflow menu; delete with undo.
- Progress counts **items**, not units: a Jacket with quantity 2 checked counts as 1 of N.

### Adaptive checklist

When the trip is created, Clothing is pre-filled from the trip's duration and purpose. All suggested items start unchecked and are fully editable. D = number of days. Quantities are suggestions; the person can change anything.

**Duration rules**

| Item | Quantity rule |
| --- | --- |
| Underwear | D, capped at 7 |
| Socks | D, capped at 7 |
| T-shirts or tops | D, capped at 7 |
| Bottoms (pants, shorts, skirt) | D divided by 2, rounded up, minimum 2, capped at 5 |
| Sleepwear | 1 for trips up to 4 days, otherwise 2 |
| Light jacket | 1 for every trip |

When D is more than 7, the app caps quantities and shows one tip: "Pack for 7 days and plan a laundry stop", with a button that adds a Laundry line to the Budget tab.

**Purpose rules** (added on top of the duration rules)

| Purpose | Added or changed items |
| --- | --- |
| Beach | Swimwear (2), beach cover-up, sandals, hat |
| Business | Dress shirts or blouses (D, capped at 5), formal shoes, blazer, belt |
| Hiking and outdoors | Hiking shoes, quick-dry tops (replace T-shirts), rain jacket, extra socks |
| City break | Comfortable walking shoes, one smart-casual outfit |
| Family | Spare outfits for children, plus extra tops |
| Leisure and General | Base duration rules only |

The exact lists are data, kept in one config file, so they can be edited without code changes.

**When the trip changes.** If dates or purpose change, the app offers "Update suggestions". It only adjusts items the person has not touched (not edited, not checked) and adds new ones. It never deletes or unchecks anything on its own.

### Acceptance criteria

- A 3-day beach trip and a 10-day business trip produce different Clothing lists on creation.
- Checking or unchecking an item updates the ring number and color in the same frame.
- Totals and color rules match the table above for 0/0, 1/10, 4/10, 7/10 and 10/10.

## 6. Budget

The Budget tab answers one question: will the planned spending fit the budget, and what drives it? The person sets a total budget, lists assumed expenses, and sees insights update live. v1 covers **planned** spending only.

### Screen structure (top to bottom)

1. **Budget header card:** total budget (tap to edit), planned total, and remaining (or over by). A segmented bar shows planned against budget: neutral up to 80%, warning from 80 to 100%, critical above 100%.
2. **Insight chips:** two or three short, plain sentences generated from the data (table below).
3. **Category chart:** a donut chart of planned spending by category with the category list as its legend; tapping a slice or legend row filters the expense list below.
4. **Expense list:** grouped by category, each row showing name, how the amount is calculated, and the total.
5. **Add expense button:** fixed above the bottom navigation.

### Expense fields

| Field | Required | Notes |
| --- | --- | --- |
| Name | Yes | For example "Hotel" |
| Category | Yes | Hotel, Eat and drink, Laundry, Transport, Activities, Other |
| Unit price | Yes | In the trip currency |
| Basis | Yes | Per night, per day, per item or one-time |
| Quantity | Auto | Prefilled from trip length: nights for per night, days for per day; editable |
| Total | Auto | Unit price x quantity, shown as the row total |

Starter rows are offered on first open of the tab, with no amounts: **Hotel** (per night), **Eat and drink** (per day) and **Laundry** (per item, shown only when the trip is longer than 7 days). The person fills in prices; unpriced rows show "Add price" and count as zero.

### Insights (rule-based)

| Insight | Shows when | Example text |
| --- | --- | --- |
| Biggest category | Planned total above 0 | "Hotel is your biggest cost at 54% of the plan." |
| Daily average | Planned total above 0 | "Planned spending averages X a day." |
| Over budget | Planned above budget | "You are X over budget. Largest category: Hotel." |
| Under budget | Planned at or below budget | "X left to cover extras." |
| No budget set | Budget empty | "Set a total budget to see how the plan compares." |
| Missing prices | Any starter row unpriced | "2 expenses still need a price." |

### Currency and format

One currency per trip, chosen at first use from the browser locale and changeable in the Budget header. Amounts are formatted with the locale's separators and shown without decimals when the currency conventionally has none. No conversion between currencies in v1.

### Charts (LayerChart)

- **Planned vs budget bar:** a single horizontal bar with a budget marker line.
- **Category donut:** arcs per category, total planned in the center, label and percentage in the legend (the legend carries the numbers; the arc colors carry nothing alone).
- Chart colors come from DESIGN.md chart tokens; the over-budget state uses the critical token and also changes the text, never color alone.
- Charts need a text equivalent (the legend and the insight sentences) for screen readers.

### Acceptance criteria

- Adding, editing or deleting an expense updates the totals, bar, donut and insights without a page reload.
- Changing the trip dates recalculates quantities for expenses whose quantity was never manually edited.
- With no expenses, the tab shows a clear empty state and the starter rows, not an empty chart.

## 7. Data model, stack and components

### Stack

- **Framework:** SvelteKit with Svelte 5 and TypeScript, built as a PWA so it installs and works offline.
- **UI:** shadcn-svelte components on Tailwind, themed from DESIGN.md tokens.
- **Charts:** LayerChart (donut, bar, progress ring), styled with the same tokens.
- **Validation:** a schema library (Zod suggested) shared by forms and storage.
- **Persistence (v1):** on-device storage (IndexedDB, with a small wrapper); no server or accounts. Data is exportable as JSON from the trip menu.

### Data model

| Entity | Key fields |
| --- | --- |
| Trip | id, name, startDate, endDate, purpose, currency, budgetTotal, createdAt |
| ItineraryEntry | id, tripId, dayIndex (0-based, or null if unscheduled), title, time, place, notes, type, order |
| PrepCategory | id, tripId, name, icon |
| PrepItem | id, categoryId, name, quantity, packed (boolean), source (suggested or manual), touched (boolean) |
| Expense | id, tripId, name, category, unitPrice, basis, quantity, quantityEdited (boolean) |

Derived values are computed, not stored: day count from the dates, ring progress (packed items over total items), planned total, per-category totals and insights. The `touched` and `quantityEdited` flags are what let date or purpose changes update suggestions safely.

### Component map

Component names follow the shadcn-svelte and LayerChart libraries; confirm exact names and variants against their current documentation during build.

| Feature | shadcn-svelte | LayerChart |
| --- | --- | --- |
| Trip setup flow | Input, Label, Button, RangeCalendar, Popover or Drawer, Badge (purpose chips) | None |
| App shell | Custom bottom navigation (no ready-made component), Dropdown Menu for the trip menu, Sonner for toasts | None |
| Itinerary day pager | Carousel (swipe), Scroll Area (day strip), Card, Drawer (add and edit), Skeleton | None |
| Preps cards and detail | Card, Checkbox, Button (quantity stepper), Drawer, Collapsible (Packed group) | Arc or Pie for the progress ring |
| Budget | Card, Input, Select, Drawer, Alert (insights), Separator | Pie or Arc (donut), Bars (planned vs budget) |

Two custom pieces are needed: the bottom navigation bar and a reusable `ProgressRing` component that wraps the LayerChart arc and applies the color thresholds from section 5.

### Routes

| Route | Screen |
| --- | --- |
| `/` | Setup flow when no trip exists, otherwise redirect to the trip |
| `/trip/itinerary` | Itinerary tab |
| `/trip/preps` and `/trip/preps/[category]` | Preps list and category detail |
| `/trip/budget` | Budget tab |

## 8. Quality, milestones, risks and open questions

### Non-functional requirements (proposed targets)

| Area | Requirement |
| --- | --- |
| Performance | Largest contentful paint under 2.5 s on a mid-range phone on 4G; interactions respond within 100 ms |
| Offline | After first load, all screens work without a connection; changes save locally |
| Accessibility | WCAG 2.2 AA: contrast, focus order, labels on icons and rings, no color-only meaning, 44 px targets |
| Gestures | Every swipe has a button and keyboard alternative; reduced-motion setting disables slide animation |
| Privacy | No account and no data leaves the device in v1; analytics, if added, is aggregate and free of trip content |
| Browser support | Current and previous major versions of Safari, Chrome, Firefox and Edge, on iOS and Android |
| Resilience | Storage failure shows a clear message and keeps the in-memory trip usable |

### Milestones

| Phase | Scope | Exit criteria |
| --- | --- | --- |
| 1. Foundations | Project setup, DESIGN.md tokens, app shell, bottom navigation, trip setup flow | A trip can be created and the three tabs open |
| 2. Itinerary | Day pager, entries, first-entry guidance, edit and delete | Itinerary acceptance criteria pass |
| 3. Preps | Clothing category, progress ring, adaptive rules, item add, edit and check | Preps acceptance criteria pass |
| 4. Budget | Expenses, starter rows, insights, LayerChart charts | Budget acceptance criteria pass |
| 5. Hardening | Accessibility audit, offline and PWA, performance, usability test with 5 travelers | Targets in this section met |

### Follow-ups after v1

- More prep categories (Toiletries, Documents, Electronics, Health) with their own adaptive rules and an Add category flow.
- Actual spending against the plan.
- Sync across devices, sharing a trip, and a printable packing list.
- Weather-aware suggestions.

### Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Day swipe conflicts with scrolling or item gestures | Accidental day changes | Horizontal-only threshold, no item swipes, button alternative |
| Adaptive rules feel wrong for some travelers | Low trust in suggestions | Everything editable; rules live in editable config; collect feedback |
| Data lives only on the device | Lost data if storage is cleared | JSON export; clear note in the trip menu; sync as a follow-up |
| Component or library API differences from this PRD | Rework | Confirm shadcn-svelte and LayerChart usage in a spike in phase 1 |
