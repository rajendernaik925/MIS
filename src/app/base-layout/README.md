# What was corrected (this pass)

## The layout was rebuilt as sidebar (full height, left) + header/content column (right)

**Before:** `.main-layout` was `flex-direction: column`, so the header
sat as a full-width strip across the *entire* top of the page, and
`<app-sidebar>` was never even rendered in `base-layout.html` — the
`Sidebar` import in `base-layout.ts` was unused.

**Now:**
- `base-layout.html` renders `<app-sidebar>` and `<app-header>` as
  siblings inside `.main-layout`.
- `base-layout.scss`: `.main-layout` is `flex-direction: row`. The
  sidebar (which is `height: 100%` / `flex-shrink: 0` in
  `sidebar.scss`) stretches the full viewport height on the left.
  `.content-layout` is `flex: 1`, `flex-direction: column`, holding the
  header on top and the scrollable routed content underneath — so the
  header now runs from "the end of the sidebar" to the right edge,
  exactly like your screenshots.

## Header filters now reach routed components via a shared service

`Header` used to just `@Output()` a `locationChange` event that only
`BaseLayout` could hear — but `BaseLayout` isn't the parent of your
routed pages (`PayableSummary`, `LocationBifurcation`, etc.), so there
was no way for those pages to actually get the value.

Added **`core/filter-state.service.ts`** (`FilterStateService`,
`providedIn: 'root'`) with a `BehaviorSubject<{ payPeriod, location }>`.

- `Header` now calls `filterState.setPayPeriod(...)` /
  `filterState.setLocation(...)` when either dropdown changes.
- **Any routed component** can inject the same service and subscribe:

  ```ts
  private filterState = inject(FilterStateService);

  ngOnInit() {
    this.filterState.filters.subscribe(({ payPeriod, location }) => {
      this.loadPayableSummary(payPeriod, location); // refetch/filter here
    });
  }
  ```

  or read a one-off snapshot with `this.filterState.current`.

- The **Pay Period pill** is now a real `<select>` (styled to still
  look like the badge from your mockup) populated with the last 6
  months as `YYYYMM`, instead of static text — so it's actually
  changeable like the Group dropdown next to it.

## Sidebar collapse

Already worked correctly in the file you provided (`collapsed`
`@Input()`/`@Output()`, `.sidebar--collapsed` hides `.sidebar-text` and
shrinks the rail to 64px, icons stay centered, footer/profile
recenter). Left as-is — just confirmed it still holds up under the new
row-based `.main-layout`. `BaseLayout.sidebarCollapsed` is the single
source of truth, toggled from the sidebar's hamburger button, so it
governs the sidebar app-wide (every route renders inside the same
`BaseLayout`, so every page sees the same collapsed/expanded rail).

## Files in this zip

```
base-layout.ts / .html / .scss
header/header.ts / .html / .scss
sidebar/sidebar.ts / .html / .scss   (unchanged from your upload)
core/filter-state.service.ts          (new)
styles-global-leftover.scss           (unchanged — see note below)
```

## Things to double check on your end

- `header.ts` previously injected a `CoreService` from
  `../../core/services/core.services`, a file that wasn't included in
  your zip, so the project wouldn't have compiled as-is. I replaced it
  with `FilterStateService` at `core/filter-state.service.ts`
  (imported as `../core/filter-state.service` from `header.ts`) — if
  you do have a real `CoreService` elsewhere in the app that's meant to
  own this state instead, tell me and I'll fold `FilterStateService`'s
  logic into it.
- `sidebar.ts`'s `navItems` routes (`/dashboard`, `/payable`,
  `/bifurcation`, `/joins-exits`, `/interns`, `/methodology`) assume
  those are your real route paths — update them if not.
- `pageTitle` is still a hardcoded `@Input()` set once in
  `base-layout.ts`. If you want it to change per route automatically
  (e.g. "Payable Summary" when on `/payable`), wire it from
  `Router` events + `route.snapshot.data['title']` instead — happy to
  add that if you share your routes file.
- Font Awesome classes (`fa-solid fa-grip`, etc.) are kept as-is —
  make sure the package/CDN is included in `angular.json` /
  `index.html`.
- `styles-global-leftover.scss` still isn't wired into anything
  (`custom-btn`, `custom-tooltip`, `.g-3/.g-4`, `swal2-*`) — move its
  contents into your project's global `styles.scss`.
