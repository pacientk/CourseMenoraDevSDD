import { describe, expect, it, vi } from 'vitest'
import { mapCustomerTasks } from '../model/mapCustomerTasks'

function validBody(todos: unknown[] = [validTodo()]): Record<string, unknown> {
  return { todos, total: todos.length, skip: 0, limit: 30 }
}

function validTodo(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { id: 7, todo: 'Call back', completed: false, userId: 99, ...overrides }
}

describe('mapCustomerTasks', () => {
  it('returns exactly id, text, isCompleted and drops userId', () => {
    const consoleSpies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((method) =>
      vi.spyOn(console, method),
    )

    const tasks = mapCustomerTasks(
      validBody([validTodo(), validTodo({ id: 8, todo: 'Send form', completed: true })]),
    )

    expect(tasks).toEqual([
      { id: 7, text: 'Call back', isCompleted: false },
      { id: 8, text: 'Send form', isCompleted: true },
    ])
    for (const task of tasks) {
      expect(Object.keys(task).sort()).toEqual(['id', 'isCompleted', 'text'])
    }
    expect(JSON.stringify(tasks)).not.toContain('99')
    for (const spy of consoleSpies) expect(spy).not.toHaveBeenCalled()
  })

  it('returns an empty list for todos: []', () => {
    expect(mapCustomerTasks(validBody([]))).toEqual([])
  })

  it.each<[string, unknown]>([
    ['root is an array', []],
    ['root is null', null],
    ['todos is missing', { total: 0 }],
    ['todos is not an array', { todos: 'nope' }],
    ['item has no todo', validBody([validTodo({ todo: undefined })])],
    ['completed is not boolean', validBody([validTodo({ completed: 'true' })])],
    ['id is not an integer', validBody([validTodo({ id: 1.5 })])],
    ['item is not an object', validBody(['x'])],
    ['one broken item among valid ones', validBody([validTodo(), validTodo({ completed: 1 })])],
  ])('throws when %s', (_name, body) => {
    expect(() => mapCustomerTasks(body)).toThrow()
  })
})
