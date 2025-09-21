function withUrlParams(url: string, urlParams: Record<string, any> = {}): string {
  const params = new URLSearchParams()
  for (const key in urlParams) {
    const value = urlParams[key]
    if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  }
  const query = params.toString()
  return query ? `${url}?${query}` : url
}

export async function get(url: string, urlParams: Record<string, any> = {}) {
  return fetch(withUrlParams(url, urlParams), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })
}

export async function post(url: string, data: unknown = {}, urlParams: Record<string, any> = {}) {
  return fetch(withUrlParams(url, urlParams), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function put(url: string, data: unknown = {}, urlParams: Record<string, any> = {}) {
  return fetch(withUrlParams(url, urlParams), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function patch(url: string, data: unknown = {}, urlParams: Record<string, any> = {}) {
  return fetch(withUrlParams(url, urlParams), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function del(url: string, data: unknown = {}, urlParams: Record<string, any> = {}) {
  return fetch(withUrlParams(url, urlParams), {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function head(url: string, data: unknown = {}, urlParams: Record<string, any> = {}) {
  return fetch(withUrlParams(url, urlParams), {
    method: 'HEAD',
    headers: {
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function options(url: string, data: unknown = {}, urlParams: Record<string, any> = {}) {
  return fetch(withUrlParams(url, urlParams), {
    method: 'OPTIONS',
    headers: {
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function connect(url: string, data: unknown = {}, urlParams: Record<string, any> = {}) {
  return fetch(withUrlParams(url, urlParams), {
    method: 'CONNECT',
    headers: {
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function trace(url: string, data: unknown = {}, urlParams: Record<string, any> = {}) {
  return fetch(withUrlParams(url, urlParams), {
    method: 'TRACE',
    headers: {
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  })
}
