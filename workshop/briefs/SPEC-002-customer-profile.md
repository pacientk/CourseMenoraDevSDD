# Brief — customer profile on the «תמונת לקוח 360» page

This is the product input: raw material from which the `sdd` skill builds the epic.
There are no acceptance criteria and no breakdown into tasks here — the spec formulates those.

## Why

During a call, a service center employee must see within a second who they are
talking to and which tasks for the customer are open. Right now the customer page is empty: there is
only a heading (SPEC-001).

## What is needed

1. **Customer card.** Avatar, full name, customer number, phone, email,
   city. The «פרטי לקוחה» block on the screenshot `docs/design/customer-360.png`.
2. **Customer tasks.** A card with a list of tasks: the task text and its status —
   open or done. Based on the «פניות אחרונות» block on the screenshot.
3. The customer is determined by the page address: `/customers/1`, `/customers/2`.

## Where the data comes from

The open DummyJSON API, base address in `VITE_API_BASE_URL`.

- `GET /users/{id}` — profile. Needed: `id`, `firstName`, `lastName`, `phone`,
  `email`, `image`, `address.city`. A non-existent customer — response `404`.
- `GET /users/{id}/todos` — tasks: `{ todos: [{ id, todo, completed, userId }], total, skip, limit }`.
  A customer may have no tasks — then `todos` is empty.

**Important.** The `/users/{id}` response also contains what must not be shown: `password`,
`ssn`, `bank` (card number, IBAN), `ip`, `macAddress`, `crypto`. These fields must not
end up on the screen, in the application model, or in the logs.

## How it should behave

- While data is loading — it is visible that loading is in progress, not an empty card.
- The customer does not exist (`404`) or the address is not a number (`/customers/abc`, `/customers/0`) —
  the message «הלקוח לא נמצא». For an invalid address no request is sent to the server.
- The server is unavailable or returned an error — the message «לא הצלחנו לטעון את הנתונים» and
  a «נסו שוב» button that retries the request.
- A server response of unexpected shape (required fields missing) is an error, not an
  empty card and not a page crash.
- The customer card and the tasks card are independent: if the tasks failed to load,
  the customer card is still shown, and vice versa.
- The avatar is shown only if the image address starts with `https://`. Otherwise, and
  if the image failed to load — the customer's initials.
- The employee switches between customers quickly: a late response for the previous customer
  must not overwrite the data of the current one.

## UI texts (Hebrew)

| Purpose | Text |
|---|---|
| Customer card name | פרטי לקוח |
| Field labels | מס׳ לקוח · טלפון · דוא״ל · עיר |
| Card loading | טוען פרטי לקוח |
| Tasks card heading | משימות טיפול |
| Task statuses | פתוח · בוצע |
| Tasks loading | טוען משימות |
| No tasks | אין משימות ללקוח |
| Customer not found | הלקוח לא נמצא |
| Loading error | לא הצלחנו לטעון את הנתונים |
| Retry | נסו שוב |

## Not needed now

- Search for another customer (will be a separate spec).
- Claims, policies, benefits, call documentation, offers.
- Editing customer data.
- Join year and the «מבוטחת פעילה» status — the API has no such fields.
- Caching, task pagination, dark theme.

## Constraints

- No new packages: only what is already installed.
- Project conventions — `docs/architecture/conventions.md`.
- The work must break down into tasks that can be executed in parallel.
