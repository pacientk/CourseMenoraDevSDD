import { readFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'

// Local copy of two DummyJSON endpoints for offline mode.
// Response shapes match the real API, including the "extra" sensitive fields.

const PREFIX = '/mock-api'
const USER_ROUTE = /^\/users\/(\d+)$/
const TODOS_ROUTE = /^\/users\/(\d+)\/todos$/

interface MockUser {
  id: number
}

interface MockTodo {
  id: number
  todo: string
  completed: boolean
  userId: number
}

function load<T>(name: string): T {
  const file = fileURLToPath(new URL(`./data/${name}`, import.meta.url))
  return JSON.parse(readFileSync(file, 'utf8')) as T
}

function send(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

function handle(req: IncomingMessage, res: ServerResponse, next: () => void): void {
  const url = (req.url ?? '').split('?')[0] ?? ''
  if (!url.startsWith(PREFIX)) {
    next()
    return
  }
  const path = url.slice(PREFIX.length)
  const users = load<MockUser[]>('users.json')
  const todos = load<MockTodo[]>('todos.json')

  const userMatch = USER_ROUTE.exec(path)
  if (userMatch) {
    const id = Number(userMatch[1])
    const user = users.find((candidate) => candidate.id === id)
    if (user) send(res, 200, user)
    else send(res, 404, { message: `User with id '${id}' not found` })
    return
  }

  const todosMatch = TODOS_ROUTE.exec(path)
  if (todosMatch) {
    const id = Number(todosMatch[1])
    if (!users.some((candidate) => candidate.id === id)) {
      send(res, 404, { message: `User with id '${id}' not found` })
      return
    }
    const own = todos.filter((todo) => todo.userId === id)
    send(res, 200, { todos: own, total: own.length, skip: 0, limit: own.length })
    return
  }

  send(res, 404, { message: `No mock for ${path}` })
}

export function mockApiPlugin(): Plugin {
  return {
    name: 'workshop-mock-api',
    configureServer(server) {
      server.middlewares.use(handle)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle)
    },
  }
}
