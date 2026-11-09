# Menora · SDD Workshop

Стартовый репозиторий курса «Spec-Driven Development на практике». За одну встречу
проходим полный цикл разработки страницы «תמונת לקוח 360» — от спеки до собранного
приложения — с агентами и гейтами на каждом этапе.

## До встречи (10 минут)

Нужно: **Node.js 22.12+**, **Git**, **Claude Code** с выполненным входом.

```sh
git clone https://github.com/pacientk/CourseMenoraDevSDD.git
cd CourseMenoraDevSDD
npm install
npm run doctor
```

`npm run doctor` проверяет машину и говорит, что исправить. Строки `[INFO]` про агента
и плагин — нормальны: это шаги встречи.

## На встрече

Откройте `workshop/PROMPTS.md` — там все команды и промпты по шагам, с запасным
вариантом на каждый шаг.

## Что где лежит

```
CLAUDE.md                     правила проекта для агентов и людей
docs/
  architecture/conventions.md конвенции: слои, компоненты, данные, безопасность, тесты
  design/                     скриншот и разметка целевой страницы
  specs/SPEC-001-app-shell/   первая спека — уже написана и утверждена
.claude/
  skills/sdd/                 скилл Spec-Driven Development и шаблоны документов
  agents/                     сюда на встрече создадим агента react-engineer
  settings.json               разрешения для команд гейтов
tools/claude-marketplace/     маркетплейс с плагином независимого ревьюера
workshop/
  PROMPTS.md                  все промпты встречи
  briefs/                     вводные от продукта для SPEC-002 и SPEC-003
  reference/rn-engineer.md    образец агента, по которому создаём своего
  fallback/                   готовые агенты на случай, если что-то не получилось
  golden/                     эталонные документы SPEC-002
src/                          приложение: app · pages · widgets · entities · shared
mocks/                        офлайн-копия API
```

## Команды

| Что | Команда |
|---|---|
| Запуск | `npm run dev` |
| Запуск без доступа к API | `npm run dev:offline` |
| Все гейты: типы → линт → тесты | `npm run validate` |
| Релизная проверка: validate → audit → build | `npm run release:check` |
| Собрать и открыть как на сервере | `npm run build && npm run preview` |
| Проверка машины | `npm run doctor` |
| Догнать группу с готовой контрольной точки | `npm run catchup` |

## После встречи

- Самостоятельное задание: `workshop/briefs/SPEC-003-customer-search.md`.
- Скилл `sdd` — учебная выжимка. Что в нём упрощено относительно полной версии,
  написано в конце `.claude/skills/sdd/SKILL.md`.
