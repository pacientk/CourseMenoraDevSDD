# Architecture — Feature-Sliced Design

**Layer:** architecture — platform-neutral. The *shape* of a codebase: layers, slices,
segments, and the import rules between them. Each stack picks its own layer list
(below); the rules are the same for all of them.

Read after the core documents. Values resolve against `standards.config.json`
(`srcDir`, `layers`, `unslicedLayers`).

---

## Vocabulary

- **Layer** — a top-level directory under `srcDir` with a fixed rank. Rank decides who
  may import whom.
- **Slice** — a subdirectory of a layer that owns one business concept
  (`features/auth`, `entities/task`). Slices of the same layer do not know about each
  other.
- **Segment** — a subdirectory of a slice (or of an unsliced layer) grouped by technical
  purpose: `ui`, `model`, `api`, `lib`, `config`.
- **Public API** — a slice's `index.ts`. The only file other slices may import.
- **Slice names** are `kebab-case` directories (`task-create`). Component folders inside
  a slice's `ui` segment follow the platform's component naming (`PascalCase`).
- **Unsliced layer** — a layer that is one cohesive whole, not a set of independent
  slices (`app`, `shared`, and on some stacks `navigation`). Its subdirectories may
  import each other.

## Layer lists per stack

`layers` in the profile lists layers **from the top**. Each layer may import only
from the layers after it.

| Stack | `layers` | `unslicedLayers` |
|---|---|---|
| React Native | `app, navigation, screens, widgets, features, entities, shared` | `app, navigation, shared` |
| React (web) | `app, pages, widgets, features, entities, shared` | `app, shared` |

`screens` (React Native) and `pages` (web) are the same concept: one slice per routed
screen, composing widgets and features. `navigation` exists on React Native because
navigator trees, linking config, and the navigation ref are an app-wide concern that
sits between bootstrap and screens.

| Layer | Holds | Example slices |
|---|---|---|
| `app` | Bootstrap: root component, providers, store creation, global error boundary | — |
| `navigation` / router | Navigators or route tree, route constants, deep-link config | — |
| `screens` / `pages` | One slice per screen; composition only, no business logic | `task-list`, `settings` |
| `widgets` | Large self-sufficient blocks reused across screens | `task-board`, `app-header` |
| `features` | One user-facing capability: an action with business value | `auth`, `task-create` |
| `entities` | Business entities: types, model, display components | `task`, `user` |
| `shared` | Infrastructure with no business knowledge: UI kit, API client, lib, config | — |

---

## Rules

### `arch.fsd.downward-only` — imports flow down the layer list **[ESLint]**

A layer imports from layers after it in `layers`, never from one before it. Enforced by
`eslint-plugin-boundaries`, generated from the profile by `configs/eslint/fsd.mjs`.
A documented boundary that CI does not check is a boundary that lasts about three
weeks.

### `arch.fsd.no-cross-slice` — slices of one layer are isolated **[ESLint]**

`features/auth` never imports `features/task-create`. Two slices that need the same
thing share it through a lower layer. If two features genuinely must cooperate, a
widget or screen above them composes both and passes data down.

Unsliced layers are exempt: `shared/ui` may import `shared/lib`.

### `arch.fsd.public-api` — only a slice's `index.ts` is importable **[ESLint]**

```ts
// Wrong — reaches into the slice
import { taskSchema } from '@entities/task/model/schema';

// Right
import { taskSchema } from '@entities/task';
```

Everything not re-exported from `index.ts` is private to the slice and may change
freely. The slice's own files use relative imports among themselves.

### `arch.fsd.one-alias-per-layer` — aliases mirror layers **[Review]**

One alias per layer, nothing finer: `@app`, `@screens`, `@features`, `@entities`,
`@shared`, … Shared segments are reached as `@shared/ui`, `@shared/lib` — not through
extra top-level aliases, which hide the layer an import comes from.

### `arch.fsd.segments` — standard segment names **[Review]**

| Segment | Contents |
|---|---|
| `ui` | Components |
| `model` | State, stores, business logic hooks, schemas, types |
| `api` | Requests and their DTO mapping |
| `lib` | Slice-internal helpers |
| `config` | Constants and flags |

Name segments by **purpose**, not by **essence**: `model/`, not `hooks/` or `types/`.

### `arch.fsd.shared-is-business-free` — `shared` knows nothing about the domain **[Review]**

If a module in `shared` mentions a business entity by name, it belongs in `entities`.

### `arch.fsd.server-state-in-slice` — data fetching lives with its owner **[Review]**

Request functions and server-state hooks live in the `api` segment of the slice that
owns the data — usually an entity. Never in a global store.

---

## Checklist

- [ ] No import climbs the layer list or crosses into a sibling slice
- [ ] Imports from other slices go through their `index.ts` only
- [ ] New code sits in the lowest layer that has everything it needs
- [ ] `shared` additions contain no business vocabulary
