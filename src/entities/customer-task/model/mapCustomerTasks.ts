import type { CustomerTask } from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function mapTask(raw: unknown): CustomerTask {
  if (!isRecord(raw)) throw new TypeError('Unexpected task shape')
  const { id, todo, completed } = raw
  if (typeof id !== 'number' || !Number.isSafeInteger(id)) {
    throw new TypeError('Unexpected task shape')
  }
  if (typeof todo !== 'string' || typeof completed !== 'boolean') {
    throw new TypeError('Unexpected task shape')
  }
  return { id, text: todo, isCompleted: completed }
}

// Один «битый» элемент делает ошибкой весь список (эпик, вопрос 2).
export function mapCustomerTasks(raw: unknown): CustomerTask[] {
  if (!isRecord(raw) || !Array.isArray(raw.todos)) {
    throw new TypeError('Unexpected tasks shape')
  }
  return raw.todos.map((item: unknown) => mapTask(item))
}
