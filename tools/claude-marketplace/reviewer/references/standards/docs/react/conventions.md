# React Conventions

**Layer:** react — shared by every React stack (React Native, web). Builds on
`docs/core/` and `docs/architecture/fsd.md`. Platform layers define what is
platform-specific: the styles module format, the primitive set, screen files.

---

## Naming

| Kind | Convention | Example |
|---|---|---|
| Component (file and folder) | `PascalCase` | `TaskCard/TaskCard.tsx` |
| Shared UI primitive | `ui.componentPrefix` + `PascalCase` | `AppText`, `AppPressable` |
| Screen / page component | `PascalCase` + the stack's suffix (`Screen` on RN, `Page` on web) | `TaskListScreen` |
| Hook | `camelCase`, `use` prefix | `useTaskList.ts` |
| Props file | props prefix + component name | `ITaskCard.ts` exporting `ITaskCardProps` |
| Styles module | component name + the platform's styles suffix | `TaskCard.styles.ts` (RN) |
| Context | `PascalCase` + `Context`; provider + `Provider` | `ThemeContext`, `ThemeProvider` |
| Store file | `camelCase` + `Store` / `Slice` | `authStore.ts` |
| Event handler prop / implementation | `on*` / `handle*` | `onPress` / `handlePress` |

---

## Component folders

Every component owns a folder named after it. All files belonging to that component
live inside: the `.tsx`, its styles module, its props file, its tests, and a barrel.

### A simple component

```
TaskCard/
├── index.ts                 # barrel — the only external entry point
├── TaskCard.tsx
├── TaskCard.styles.ts       # format set by the platform layer
├── ITaskCard.ts             # ITaskCardProps
└── __tests__/TaskCard.test.tsx
```

### A package — a component with sub-components

When a component grows sub-components or its own hooks, it becomes a **package**. The
package root holds only the barrel and folders; the main component moves into its own
folder like any other:

```
BottomSheet/                        # package
├── index.ts                        # unchanged — still the only external entry point
├── BottomSheet/
│   ├── BottomSheet.tsx
│   ├── BottomSheet.styles.ts
│   ├── IBottomSheet.ts
│   └── __tests__/BottomSheet.test.tsx
├── BottomSheetHeader/
│   ├── BottomSheetHeader.tsx
│   ├── BottomSheetHeader.styles.ts
│   └── IBottomSheetHeader.ts
└── hooks/
    └── useBottomSheet.ts
```

- **External code imports the barrel only** — never a nested file. That is what makes
  promotion from simple component to package free: the move is internal, every
  external import stays the same.
- Nested files are private. The package's own tests may deep-import within it.
- A sub-component used by exactly one parent lives inside that parent's package. Once
  a second consumer appears, it moves to the lowest shared layer.

### Where an extracted component goes

| Scope | Location |
|---|---|
| Reusable, no business knowledge | `shared/ui/` (primitives and molecules) |
| Sub-component of one component | inside that component's package |
| Display component bound to an entity | `entities/<entity>/ui/` |
| Interactive capability | `features/<feature>/ui/` |
| Screen-level block reused across screens | `widgets/<widget>/ui/` |

---

## Props

- Props are a named declaration in the component's own props file
  (`I<Component>.ts`), re-exported from the barrel. Never declared inline in the
  `.tsx`. This holds for a discriminated union too.
- Hook inputs taking an object follow the same rule (`IUseTaskListProps`); hook result
  types are named `Use<Hook>Result`, unprefixed.
- Event props are `on*`; boolean props follow `core.naming.boolean-prefix`.
- Children and render props are typed explicitly (`ReactNode`, a named function type).

---

## Hooks

- Business logic lives in hooks, not in components. A component reads a hook and
  renders.
- A hook does one thing. `useTaskList` fetches and shapes the list; it does not also
  track analytics.
- Hooks that wrap a server-state query live in the `api` or `model` segment of the
  owning slice, next to the request they wrap.
