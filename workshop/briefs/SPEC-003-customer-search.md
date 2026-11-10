# Brief — search for another customer

A self-study assignment after the session. Go through the full cycle: spec →
approval → execution → independent review → security → close.

## Why

An employee finishes one call and takes the next. They need to move to another
customer without editing the page address by hand.

## What is needed

In the customer card — a «חיפוש לקוח אחר» field. The employee types a name, sees a list
of matches, and on selection lands on the selected customer's page. The search block is on
the screenshot `docs/design/customer-360.png`, to the right of the customer details.

## Where the data comes from

`GET /users/search?q={text}` → `{ users: [{ id, firstName, lastName, … }], total, skip, limit }`.
The response has the same sensitive fields as the profile.

The offline copy of the API (`npm run dev:offline`) does not serve this address yet — decide in the
spec whether adding it is in scope.

## How it should behave

- The request is sent not on every keystroke, but after a pause in typing.
- Fewer than two characters — no request is sent.
- No matches — the message «לא נמצאו לקוחות».
- Request error — an error message; the customer card already shown is not affected.
- Fast typing: a late response for the old text does not overwrite the fresh one.
- The list is keyboard-operable.

## Hints for the spec

- Which track: small spec or full? Justify it in gate G0.
- What from SPEC-002 is reused without changes?
- Which acceptance criteria here are about security?
- What is explicitly "out of scope"?
