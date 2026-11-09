# Журнал ревью — SPEC-002

Каждый раунд независимого ревью и результат security-гейта. Ключи полей не
переименовывать — по ним журнал читается `grep`-ом. В полях-перечислениях только
значение, пояснения — в находках.

reviewer: /reviewer:review (плагин reviewer, read-only)
round_limit: 2

---

## Раунд 1 — 2026-11-09
scope: git diff main...HEAD, 61 файл
verdict: CHANGES REQUESTED
gates: typecheck ok · lint ok · test ok — по отчёту ревьюера (144 теста)
findings:
  - id: F-1
    severity: major
    category: logic
    location: src/shared/api/useAsyncResource.ts:54-56
    problem: при возврате к ключу A → B → A результат прежней попытки показывается вместо loading
    response: fixed (src/shared/api/useAsyncResource.ts: сброс stored при смене key в рендере; тест A → B → A в useAsyncResource.test.ts)
  - id: F-2
    severity: minor
    category: standards
    location: src/widgets/profile-card/ProfileCard.module.css:15,53; src/widgets/customer-tasks/CustomerTasks.module.css:25
    problem: физическое min-width: 0 вместо min-inline-size: 0
    response: fixed (ProfileCard.module.css:15,53; CustomerTasks.module.css:25)
  - id: F-3
    severity: minor
    category: tests
    location: src/pages/customer/__tests__/CustomerPage.test.tsx:117-130
    problem: AC-9 «и наоборот» не проверен: повтор профиля не проверен на отсутствие перезапроса задач
    response: fixed (CustomerPage.test.tsx: повтор профиля запрашивает только /users/1)

## Раунд 2 — 2026-11-09
scope: незакоммиченные изменения на spec/002-customer-profile (5 файлов) плюс затронутый код
verdict: APPROVED
gates: typecheck ok · lint ok · test ok — по отчёту ревьюера (145 тестов)
findings:
  - previous: F-1 resolved (useAsyncResource.ts:53-58, тест A → B → A)
  - previous: F-2 resolved (min-inline-size в трёх местах, физических min/max-width в src/**/*.css нет)
  - previous: F-3 resolved (повтор профиля запрашивает только /users/1)
  - новых находок нет
