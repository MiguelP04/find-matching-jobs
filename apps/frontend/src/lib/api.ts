const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface ApiOptions {
  body?: unknown
  token?: string
}

export interface FieldError {
  field: string
  message: string
}

export class ApiError extends Error {
  fieldErrors: FieldError[]
  constructor(message: string, fieldErrors: FieldError[]) {
    super(message)
    this.fieldErrors = fieldErrors
  }
}

async function request<T>(method: string, path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`
  }
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    let fieldErrors: FieldError[] = []
    if (Array.isArray(body) && body.length > 0 && 'field' in body[0]) {
      fieldErrors = body
    } else if (body?.message && Array.isArray(body.message) && body.message.length > 0 && 'field' in body.message[0]) {
      fieldErrors = body.message
    }

    if (fieldErrors.length > 0) {
      throw new ApiError(
        fieldErrors.map((f) => f.message).join('. '),
        fieldErrors,
      )
    }

    throw new ApiError(
      body?.message || `Error ${res.status}`,
      [],
    )
  }
  return res.json()
}
export const api = {
  post: <T>(path: string, body?: unknown, token?: string) =>
    request<T>('POST', path, { body, token }),
  get: <T>(path: string, token?: string) =>
    request<T>('GET', path, { token }),
}