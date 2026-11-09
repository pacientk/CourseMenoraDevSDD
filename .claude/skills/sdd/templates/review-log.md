# Журнал ревью — SPEC-{NNN}

Каждый раунд независимого ревью и результат security-гейта. Ключи полей не
переименовывать — по ним журнал читается `grep`-ом. В полях-перечислениях только
значение, пояснения — в находках.

reviewer: /reviewer:review (плагин reviewer, read-only)
round_limit: 2

---

<!-- Раунд ревью — по одному блоку на раунд:

## Раунд {n} — {YYYY-MM-DD}
scope: {диапазон диффа или файлы}
verdict: {APPROVED | CHANGES REQUESTED}
gates: {typecheck ok · lint ok · test ok — по отчёту ревьюера}
findings:
  - id: F-1
    severity: {blocker | major | minor | question}
    category: {logic | spec | standards | tests | security | performance}
    location: {путь:строка}
    problem: {одна фраза}
    response: {open | fixed (где) | answered | disputed (доказательство)}

Решение человека при исчерпанном лимите раундов:

## Решение — {YYYY-MM-DD}
decision: {accepted-with-reason | extra-round | spec-rework}
reason: {почему}
decided_by: {имя}

Security-гейт:

## Security — {YYYY-MM-DD}
tool: /security-review
result: {no findings | findings}
audit: {npm run audit:deps → 0 high}
findings:
  - severity: {high | medium | low}
    location: {путь:строка}
    problem: {одна фраза}
    resolution: {fixed | accepted (причина) | deferred}
-->
